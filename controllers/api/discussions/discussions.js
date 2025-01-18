const discussionRepo = require('../../../lib/discussion-repository'),
                    mid = require('../../../middleware/index'),
                    app = require('express')(),
                    passport = require('passport');

var requireAuth = passport.authenticate('jwt', {session: false}),
requireLogin = passport.authenticate('local', {session: false});

class DiscussionController {

    constructor(router, io) {

        //// v1.2.7
        router.get("/apppre/:id" ,this.getAppDiscussionsPre.bind(this));
        router.get("/apppre/:id/new" ,this.getAppNewDiscussionsPre.bind(this));
        router.get("/apppre/:id/top" ,this.getTopAppDiscussionsPre.bind(this));
        /////

       
        router.get("/app/:id" ,this.getAppDiscussions.bind(this));
        router.get("/app/:id/new" ,this.getAppNewDiscussions.bind(this));
        router.get("/app/:id/top" ,this.getTopAppDiscussions.bind(this));
        
        router.get("/:id" ,this.getDiscussions.bind(this));
        router.get("/ingame/:id" ,this.getInGameDiscussions.bind(this));
        router.post("/:id", requireAuth ,this.postDiscussion.bind(this));
        router.get("/:id/answers", this.getAnswers.bind(this));
        router.post("/:id/answers",requireAuth ,this.postAnswer.bind(this));
        router.post("/i/delete-post", requireAuth, mid.deleteAuthorization, this.deletePost.bind(this))

        //Likes
        router.post("/:id/likers/:username", requireAuth, this.like.bind(this));
        router.delete("/:id/likers/:username", requireAuth, this.deleteLike.bind(this));
        router.post("/:id/dislikers/:username", requireAuth, this.dislike.bind(this));
        router.delete("/:id/dislikers/:username", requireAuth, this.deleteDislike.bind(this));
    
    }

    getInGameDiscussions(req, res, next) {
        
        let gameId = req.params.id;
        let userId = req.params.userId;
        let limit = 50;
        
        discussionRepo.getInGameDiscussions(userId, gameId, limit, (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

        //Para la app v2

        getTopAppDiscussionsPre(req, res, next) {
            let gameId = req.params.id;
            let limit = 25;
            let skip = +req.query.skip;
            let gameMoment = req.query.gameMoment;
            let userId = req.query.userId != undefined ? req.query.userId : null;
            
            discussionRepo.getTopAppDiscussionsPre(userId, gameMoment, gameId, limit, skip,  (err, discussions) => {
                if(err) return next(err);
                res.json(discussions);
            })
        }
    
        getAppDiscussionsPre(req, res, next) {

            let gameId = req.params.id;
            let limit = 25;
            let skip = +req.query.skip;
            let gameMoment = req.query.gameMoment;
            let userId = req.query.userId != undefined ? req.query.userId : null;
            
            discussionRepo.getAppDiscussionsPre(userId, gameMoment, gameId, limit, skip,  (err, discussions) => {
                if(err) return next(err);
                res.json(discussions);
            })
        }
    
        getAppNewDiscussionsPre(req, res, next) {
    
            let gameId = req.params.id;
            let limit = 25;
            let skip = +req.query.skip;
            let gameMoment = req.query.gameMoment;
            let userId = req.query.userId != undefined ? req.query.userId : null;
            
            
            discussionRepo.getAppNewDiscussionsPre(userId,  gameMoment, gameId, limit, skip,  (err, discussions) => {
                if(err) return next(err);
                res.json(discussions);
            })
        }

    //Para la app

    getTopAppDiscussions(req, res, next) {
        let gameId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let gameHasEnded = req.query.gameHasEnded;
        
        discussionRepo.getTopAppDiscussions(gameHasEnded, gameId, limit, skip,  (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

    getAppDiscussions(req, res, next) {
        let gameId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let gameHasEnded = req.query.gameHasEnded;
        
        
        discussionRepo.getAppDiscussions(gameHasEnded, gameId, limit, skip,  (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

    getAppNewDiscussions(req, res, next) {

        let gameId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let gameHasEnded = req.query.gameHasEnded;
        
        
        discussionRepo.getAppNewDiscussions(gameHasEnded, gameId, limit, skip,  (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

    //Para web
    getDiscussions(req, res, next) {
        
        let gameId = req.params.id;
        let userId = req.params.userId;
        let limit = 50;
        let skip = +req.query.skip;
       
        
        discussionRepo.getDiscussions(userId, gameId, limit, skip,  (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

    postDiscussion(req, res, next) {

        let gameId = req.params.id;
        let opinion = req.body.opinion;
        let userId = req.user._id;
    
        if(opinion.length > 600) {
            var err = new Error('More than 400 characters');
            err.status = 400;
            return next(err);
        }
        if(opinion.search(/(\bamino|\bhardwood)/i) != -1 ) {
            var err = new Error('Internal server error');
            err.status = 400;
            return next(err);
        }
        discussionRepo.postDiscussion(opinion, gameId, userId, (err, discussion) => {
            if (err) return next(err);
            res.json(discussion);
        })
    }

    getAnswers(req, res, next) {

        let discussionId = req.params.id;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        discussionRepo.getAnswers(userId, discussionId, (err, answers) => {
            if (err) return next(err);
            res.json(answers);
        })
    }

    postAnswer(req, res, next) {
        let discussionId = req.params.id;
        
        let userId = req.user._id;
        let response = req.body;
        let playerIds = req.body.playerIds;

        if(response.response.length > 600) {
            var err = new Error('More than 400 characters');
            err.status = 400;
            return next(err);
        }
    

        discussionRepo.postAnswer(playerIds, response, userId, discussionId, (err, answer) => {
            if (err) return next(err);
            res.json(answer);
        })
    }


    deletePost(req, res, next) {
        
        let userId = req.user._id.toString();
        let isAdmin = req.user.role == "admin" ? true : null;
        
        discussionRepo.deletePost(isAdmin, userId, req.body, (err, succeded) => {
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
        
        discussionRepo.addLike(discussionOrAnswer, discussionId, username, answerId, (err, discussion) => {
            if (err) return next(err);
            res.json({});
        })
    }

    deleteLike(req, res, next) {
        let discussionId = req.params.id;
        let username = req.params.username;
        let discussionOrAnswer = req.query.discussionOrAnswer;
        let answerId = req.query.answerId ? req.query.answerId : null; 

        discussionRepo.deleteLike(discussionOrAnswer, discussionId, username, answerId, (err, discussion) => {
            if (err) return next(err);
            res.json({});
        })


    }

    dislike(req, res, next) {
        let discussionId = req.params.id;
        let username = req.params.username;
        let discussionOrAnswer = req.query.discussionOrAnswer;
        let answerId = req.body.aId ? req.body.aId : null;

        discussionRepo.addDislike(discussionOrAnswer, discussionId, username, answerId, (err, discussion) => {
            if (err) return next(err);
            res.json({});
        })

    }

    deleteDislike(req, res, next) {
        let discussionId = req.params.id;
        let username = req.params.username;
        let discussionOrAnswer = req.query.discussionOrAnswer;
        let answerId = req.query.answerId ? req.query.answerId : null; 

        discussionRepo.deleteDislike(discussionOrAnswer, discussionId, username, answerId, (err, discussion) => {
            if (err) return next(err);
            res.json({});
        })


    }



    

}

module.exports = DiscussionController;