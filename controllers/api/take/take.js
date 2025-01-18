const takeRepo = require('../../../lib/take-repository'),
    FroalaEditor = require('../../../lib/wysiwyg-editor-node-sdk/lib/froalaEditor.js'),
    mid = require('../../../middleware/index'),
    rateLimit = require("../../../lib/rates/posts"),
    passport = require('passport');
var requireAuth = passport.authenticate('jwt', { session: false }),
    requireLogin = passport.authenticate('local', { session: false });

class TakeController {

    constructor(router) {
        router.post('/', requireAuth, this.postTake.bind(this));
        router.get('/', this.getTakes.bind(this));
        router.get('/bookmarks', requireAuth, this.getBookmarks.bind(this));
        router.get('/i/newest', this.getNewestTakes.bind(this));
        router.get('/i/top', this.getTopTakes.bind(this));
        router.get('/i/teams', requireAuth, this.getTeamTakes.bind(this));
        router.get('/following', requireAuth, this.getFollowingTakes.bind(this));
        router.get('/:id', this.getTake.bind(this));
        router.post('/i/delete-take', requireAuth, mid.deleteAuthorization, this.deleteTake.bind(this));
        router.post('/:id/bookmark', requireAuth, this.addToBookmarks.bind(this));
        router.delete('/:id/bookmark', requireAuth, this.deleteBookmark.bind(this));
        router.post('/:id', requireAuth, mid.deleteAuthorization, this.editTake.bind(this));
        router.post("/:id/boost", requireAuth, mid.roleAuthorization(['admin']), this.boost.bind(this));
        router.post('/:id/vote', requireAuth, this.postVote.bind(this));
        
         //Likes
         router.post("/:id/likers/:user", requireAuth, this.like.bind(this));
         router.delete("/:id/likers/:user", requireAuth, this.deleteLike.bind(this));
  
    }


    postVote(req, res, next) {

        let id = req.body.takeId;
        let vote = {
            user: req.user._id,
            option: req.body.option
        }
        let userId = req.user._id;


        takeRepo.postVote(id, vote, userId, (err, take) => {
            if (err) return next(err);
            res.json({});
        })

    }

    getBookmarks(req, res, next) {

        let limit = 10;
        let skip = +req.query.skip;
        let userId = req.user._id;
       
        takeRepo.getBookmarks(userId, limit, skip, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })

    }

    addToBookmarks(req, res, next) {
        let takeId = req.params.id;
        let userId = req.user._id;
        takeRepo.addToBookmarks(takeId, userId, (err, success) => {
            if (err) return next(err);
            res.json({success});
        })
    }

    deleteBookmark(req, res, next) {
        let takeId = req.params.id;
        let userId = req.user._id;
        takeRepo.deleteBookmark(takeId, userId, (err, success) => {
            if (err) return next(err);
            res.json({success});
        })
    }

    

    deleteTake(req, res, next) {

        let userId = req.user._id.toString();
        let isAdmin = req.user.role == "admin" ? true : null;
        takeRepo.deleteTake(isAdmin, userId, req.body, (err, succeded) => {
            if (err) return next(err);
            res.json({ succeded: succeded });
        })

    }

    editTake(req, res, next) {
        let takeId = req.params.id;
        let data = req.body;

        //ARREGLAR PARA LINKS
        if (req.body.take.length == 0 || !req.body.take.replace(/\s/g, '').length) {
            res.statusMessage = "Text can't be empty. Go to your profile to delete this post.";
            return res.status(429).end();
        }

        delete data.userId;
        takeRepo.editTake(takeId, data, (err, take) => {
            if (err) return next(err);
            res.json(take);
        })
    }

    boost(req, res, next) {

        let takeId = req.params.id;
        let likes = +req.body.likes;
        let user = req.user._id.toString();
        takeRepo.boost(takeId, user, likes, (err, succeded) => {
            if (err) return next(err);
            res.json({});
        })

    }

    

    getTeamTakes(req, res, next) {


        let limit = req.query.limit ? +req.query.limit : 10;
        let skip = +req.query.skip;
        let team = req.query.team;

        takeRepo.getTeamTakes(req.user._id, team, limit, skip, (err, takes) => {
            if (err) return next(err);
            res.json(takes);
        })

    }


    getTake(req, res, next) {

        let id = req.params.id;
        takeRepo.getTake(id, (err, take) => {
            if (err) return next(err);
            res.json(take);
        })

    }


    like(req, res, next) {
        let takeId = req.params.id;
        let user = req.user._id.toString();

        takeRepo.addLike(takeId, user, (err, take) => {
            if (err) return next(err);
            res.json({});
        })
    }

    deleteLike(req, res, next) {
        let takeId = req.params.id;
        let user = req.user._id.toString();

        takeRepo.deleteLike(takeId, user, (err, take) => {
            if (err) return next(err);
            res.json({});
        })


    }

    

    postTake(req, res, next) {

        let userId = req.user._id;
        if (req.body.take.length > 300) {
            var err = new Error('The discussion must have less than 300');
            err.status = 400;
            return next(err);
        }
       
        takeRepo.postTake(req.user.username, req.body, userId, (err, take, customError) => {
            if (err) return next(err);
            if (customError) return res.json(({ take: null, error: customError }));

            res.json({ take: take, error: null });
        })
    }

    getFollowingTakes(req, res, next) {

        let limit = req.query.limit ? +req.query.limit : 15;
        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }
        console.log('takes')
        takeRepo.getFollowingTakes(req.user, league, leaguesForTop, limit, skip, (err, takes) => {
            if (err) return next(err);
            res.json(takes);
        })

    }

    getTakes(req, res, next) {

        let limit = req.query.limit ? +req.query.limit : 15;
        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        let userId = req.query.userId != undefined ? req.query.userId : null;

        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }

        takeRepo.getTakes(userId, league, leaguesForTop, limit, skip, (err, takes) => {
            if (err) return next(err);
            res.json(takes);
        })

    }


    getNewestTakes(req, res, next) {

        let limit = req.query.limit ? +req.query.limit : 15;
        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }

        takeRepo.getNewestTakes(userId, leaguesForTop, league, limit, skip, (err, takes) => {
            if (err) return next(err);
            res.json(takes);
        })

    }

    getTopTakes(req, res, next) {

        let limit = req.query.limit ? +req.query.limit : 15;
        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }

        takeRepo.getTopTakes(userId, leaguesForTop, league, limit, skip, (err, takes) => {
            if (err) return next(err);
            res.json(takes);
        })

    }


}

module.exports = TakeController;