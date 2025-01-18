const threadDiscussionRepo = require('../../../lib/thread-discussion-repository'),
        playDiscussionRepo = require('../../../lib/play-discussion-repository'),
            takeDiscussionRepo = require('../../../lib/take-discussion-repository'),
                    mid = require('../../../middleware/index'),
                    app = require('express')(),
                    passport = require('passport');

var requireAuth = passport.authenticate('jwt', {session: false}),
requireLogin = passport.authenticate('local', {session: false});

class PlayDiscussionController {

    constructor(router, io) {

        this.io = io;
        router.post("/trivias/:id", requireAuth ,this.postTriviaDiscussion.bind(this));
        router.post("/trivias/:id/answers",requireAuth ,this.postTriviaAnswer.bind(this));
        router.get("/trivias/:id", requireAuth, this.getTriviaDiscussions.bind(this));
        router.get("/trivias/:id/new", requireAuth, this.getNewestTriviaDiscussions.bind(this));
        router.get("/trivias/:id/top", requireAuth, this.getTopTriviaDiscussions.bind(this));
        router.post("/i/delete-trivia-comment", requireAuth, mid.deleteAuthorization, this.deleteTriviaComment.bind(this))
        router.post("/i/delete-trivia-answer", requireAuth, mid.deleteAuthorization, this.deleteTriviaAnswer.bind(this))
    }

    deleteTriviaAnswer(req, res, next) {

        let userId = req.user._id.toString();
        let isAdmin = req.user.role == "admin" ? true : null;
        playDiscussionRepo.deleteTriviaAnswer(isAdmin, userId, req.body, (err, succeded) => {
            if (err) return next(err);
            res.json({succeded: succeded});
        })

    }

    deleteTriviaComment(req, res, next) {

        let userId = req.user._id.toString();
        let isAdmin = req.user.role == "admin" ? true : null;
        playDiscussionRepo.deleteTriviaComment(isAdmin, userId, req.body, (err, succeded) => {
            if (err) return next(err);
            res.json({succeded: succeded});
        })

    }

    postTriviaAnswer(req, res, next) {
        
        let discussionId = req.params.id;
        let userId = req.user._id;
        let response = req.body;
        let playerIds = req.body.playerIds;

        playDiscussionRepo.postAnswer(req.user, playerIds, response, userId, discussionId, (err, answer) => {
            if (err) return next(err);
            res.json(answer);
        })
    }

    postTriviaDiscussion(req, res, next) {

        let triviaId = req.params.id;
        let opinion = req.body.opinion;
    
        if (!opinion.replace(/\s/g, '').length) {
            var err = new Error('Internal server error');
            err.status = 400;
            return next(err);
        }
        
        playDiscussionRepo.postTriviaDiscussion(req.user._id, opinion, triviaId, (err, discussion) => {
            if (err) return next(err);
            res.json(discussion);
        })
    }

    getNewestTriviaDiscussions(req, res, next) {
        let triviaId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let userId = req.user._id;
        playDiscussionRepo.getNewestDiscussions(userId, triviaId, limit, skip, (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

    getTopTriviaDiscussions(req, res, next) {
        
        let triviaId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let userId = req.user._id;
        playDiscussionRepo.getTopDiscussions(userId, triviaId, limit, skip, (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

    getTriviaDiscussions(req, res, next) {

        let triviaId = req.params.id;
        let limit = 25;
        let skip = +req.query.skip;
        let userId = req.user._id;

        playDiscussionRepo.getTriviaDiscussions(userId, triviaId, limit, skip, (err, discussions) => {
            if(err) return next(err);
            res.json(discussions);
        })
    }

}

module.exports = PlayDiscussionController;