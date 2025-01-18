const threadDiscussionRepo = require('../../../lib/thread-discussion-repository'),
                    mid = require('../../../middleware/index'),
                    app = require('express')(),
                    passport = require('passport');

var requireAuth = passport.authenticate('jwt', {session: false}),
requireLogin = passport.authenticate('local', {session: false});

class ThreadDiscussionController {

    constructor(router, io) {

        this.io = io;
        router.put('/edit',requireAuth, mid.deleteAuthorization, this.editDiscussion.bind(this));
        router.put('/edit/answers',requireAuth, mid.deleteAuthorization, this.editAnswer.bind(this));
        router.get("/:id" ,this.getDiscussions.bind(this));
        router.get("/:id/new" ,this.getNewestDiscussions.bind(this));
        router.get("/:id/top" ,this.getTopDiscussions.bind(this));
        router.post("/:id", requireAuth ,this.postDiscussion.bind(this));
        router.get("/:id/notification" ,this.getDiscussion.bind(this));
        router.get("/:id/answers", this.getAnswers.bind(this));
        router.post("/:id/answers",requireAuth ,this.postAnswer.bind(this));
        router.post("/i/delete-post", requireAuth, mid.deleteAuthorization, this.deletePost.bind(this))
        router.post("/i/delete-post-mythread", requireAuth, mid.deleteAuthorization, this.deleteCommentFromMyThread.bind(this))

        //Likes
        router.post("/:id/likers/:username", requireAuth, this.like.bind(this));
        router.delete("/:id/likers/:username", requireAuth, this.deleteLike.bind(this));
        router.post("/:id/dislikers/:username", requireAuth, this.dislike.bind(this));
        router.delete("/:id/dislikers/:username", requireAuth, this.deleteDislike.bind(this));
    
    }

    editDiscussion(req,res,next) {

        threadDiscussionRepo.editDiscussion(req.body, (err, discussion) => {
            if(err) return next(err);
            if(discussion == "trampa") {
                res.statusMessage = "Not even Brady and the Pats would cheat like that!";
                return res.status(429).end();
            } 
            res.json(discussion);
        })
    }

    editAnswer(req,res,next) {
        threadDiscussionRepo.editAnswer(req.body, (err, discussion) => {
            if(err) return next(err);
            res.json(discussion);
        })

    }

    getNewestDiscussions(req, res, next) {
        let threadId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        threadDiscussionRepo.getNewestDiscussions(userId, threadId, limit, skip, (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

    getTopDiscussions(req, res, next) {
        
        let threadId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        threadDiscussionRepo.getTopDiscussions(userId, threadId, limit, skip, (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

    getDiscussion(req, res, next) {
        
        let id = req.params.id;
        console.log(id)
        threadDiscussionRepo.getDiscussion(id, (err, discussion) => {
            if(err) return next(err);
            res.json(discussion);
        })
    }


    getDiscussions(req, res, next) {

        let threadId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        threadDiscussionRepo.getDiscussions(userId, threadId, limit, skip, (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

    postDiscussion(req, res, next) {

        let threadId = req.params.id;
        let opinion = req.body.opinion;
        let userId = req.user._id;
        let threadUser = req.body.threadUser;
        let playerIds = req.body.playerIds;
        if(opinion.search(/(\bamino\b|\bhardwood\b)/i) != -1) {
            var err = new Error('Internal server error');
            err.status = 400;
            return next(err);
        }
        if (!opinion.replace(/\s/g, '').length) {
            var err = new Error('Internal server error');
            err.status = 400;
            return next(err);
        }
        
        threadDiscussionRepo.postDiscussion(req.user, playerIds, threadUser, opinion, threadId, userId, (err, discussion) => {
            if (err) return next(err);
            res.json(discussion);
        })
    }

    getAnswers(req, res, next) {

        let discussionId = req.params.id;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        threadDiscussionRepo.getAnswers(userId, discussionId, (err, answers) => {
            if (err) return next(err);
            res.json(answers);
        })
    }

    postAnswer(req, res, next) {
        
        let discussionId = req.params.id;
        let userId = req.user._id;
        let response = req.body;
        let playerIds = req.body.playerIds;

        threadDiscussionRepo.postAnswer(req.user, playerIds, response, userId, discussionId, (err, answer) => {
            if (err) return next(err);
            res.json(answer);
        })
    }


    deletePost(req, res, next) {

        let userId = req.user._id.toString();
        let isAdmin = req.user.role == "admin" ? true : null;
        threadDiscussionRepo.deletePost(isAdmin, userId, req.body, (err, succeded) => {
            if (err) return next(err);
            res.json({succeded: succeded});
        })

    }

    deleteCommentFromMyThread(req, res, next) {

        let userId = req.user._id.toString();
        let isAdmin = req.user.role == "admin" ? true : null;
        threadDiscussionRepo.deleteCommentFromMyThread(isAdmin, userId, req.body, (err, succeded) => {
            if (err) return next(err);
            res.json({succeded: succeded});
        })

    }
                                             /*  Liking service */
    like(req, res, next) {
        let discussionId = req.params.id;
        let username = req.params.username;
        let discussionOrAnswer = req.query.discussionOrAnswer;
        let answerId = req.body.aId ? req.body.aId : null;
        
        threadDiscussionRepo.addLike(discussionOrAnswer, discussionId, username, answerId, (err, discussion) => {
            if (err) return next(err);
            
            res.json({});
        })
    }

    deleteLike(req, res, next) {
        let discussionId = req.params.id;
        let username = req.params.username;
        let discussionOrAnswer = req.query.discussionOrAnswer;
        let answerId = req.query.answerId ? req.query.answerId : null; 

        threadDiscussionRepo.deleteLike(discussionOrAnswer, discussionId, username, answerId, (err, discussion) => {
            if (err) return next(err);
            res.json({});
        })


    }

    dislike(req, res, next) {
        let discussionId = req.params.id;
        let username = req.params.username;
        let discussionOrAnswer = req.query.discussionOrAnswer;
        let answerId = req.body.aId ? req.body.aId : null;

        threadDiscussionRepo.addDislike(discussionOrAnswer, discussionId, username, answerId, (err, discussion) => {
            if (err) return next(err);
            res.json({});
        })

    }

    deleteDislike(req, res, next) {
        let discussionId = req.params.id;
        let username = req.params.username;
        let discussionOrAnswer = req.query.discussionOrAnswer;
        let answerId = req.query.answerId ? req.query.answerId : null; 

        threadDiscussionRepo.deleteDislike(discussionOrAnswer, discussionId, username, answerId, (err, discussion) => {
            if (err) return next(err);
            res.json({});
        })


    }



    

}

module.exports = ThreadDiscussionController;