const threadDiscussionRepo = require('../../../lib/thread-discussion-repository'),
            takeDiscussionRepo = require('../../../lib/take-discussion-repository'),
                    mid = require('../../../middleware/index'),
                    app = require('express')(),
                    passport = require('passport');

var requireAuth = passport.authenticate('jwt', {session: false}),
requireLogin = passport.authenticate('local', {session: false});

class TakeDiscussionController {

    constructor(router, io) {

        this.io = io;

        router.get("/:id" ,this.getDiscussions.bind(this));
        router.get("/:id/new" ,this.getNewestDiscussions.bind(this));
        router.get("/:id/top" ,this.getTopDiscussions.bind(this));
        router.post("/:id", requireAuth ,this.postDiscussion.bind(this));
        router.post("/:id/answers",requireAuth ,this.postAnswer.bind(this));
        router.post("/i/delete-post", requireAuth, mid.deleteAuthorization, this.deletePost.bind(this))

        router.post("/i/delete-post-mytake", requireAuth, mid.deleteAuthorization, this.deleteCommentFromMyTake.bind(this))

    }

    deletePost(req, res, next) {

        let userId = req.user._id.toString();
        let isAdmin = req.user.role == "admin" ? true : null;
        takeDiscussionRepo.deletePost(isAdmin, userId, req.body, (err, succeded) => {
            if (err) return next(err);
            res.json({succeded: succeded});
        })

    }

    postAnswer(req, res, next) {
        
        let discussionId = req.params.id;
        let userId = req.user._id;
        let response = req.body;
        let playerIds = req.body.playerIds;

        takeDiscussionRepo.postAnswer(req.user, playerIds, response, userId, discussionId, (err, answer) => {
            if (err) return next(err);
            res.json(answer);
        })
    }

    deleteCommentFromMyTake(req, res, next) {

        let userId = req.user._id.toString();
        let isAdmin = req.user.role == "admin" ? true : null;
        takeDiscussionRepo.deleteCommentFromMyTake(isAdmin, userId, req.body, (err, succeded) => {
            if (err) return next(err);
            res.json({succeded: succeded});
        })

    }

    postDiscussion(req, res, next) {

        let takeId = req.params.id;
        let opinion = req.body.opinion;
        let userId = req.user._id;
        let takeUser = req.body.takeUser;
        console.log(takeUser)
        let playerIds = req.body.playerIds;
        
        if (!opinion.replace(/\s/g, '').length) {
            var err = new Error('Internal server error');
            err.status = 400;
            return next(err);
        }
        
        takeDiscussionRepo.postDiscussion(req.user, playerIds, takeUser, opinion, takeId, userId, (err, discussion) => {
            if (err) return next(err);
            res.json(discussion);
        })
    }
   

    getNewestDiscussions(req, res, next) {
        let takeId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        takeDiscussionRepo.getNewestDiscussions(userId, takeId, limit, skip, (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

    getTopDiscussions(req, res, next) {
        
        let takeId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        takeDiscussionRepo.getTopDiscussions(userId, takeId, limit, skip, (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

  


    getDiscussions(req, res, next) {

        let takeId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        takeDiscussionRepo.getDiscussions(userId, takeId, limit, skip, (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }
    

}

module.exports = TakeDiscussionController;