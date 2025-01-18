const gameRepo = require('../../../lib/game-repository'),
    passport = require('passport');
var requireAuth = passport.authenticate('jwt', { session: false });

class GamesController {


    constructor(router, io) {
        this.io = io;
        router.get('/', this.getGames.bind(this));
        router.get('/leaguegames', this.getLeagueGames.bind(this));
        router.get('/:id', this.getGame.bind(this));
        router.get('/:id/poll', this.getPoll.bind(this));
        router.post('/:id/vote', requireAuth, this.postVote.bind(this));
    }

    postVote(req, res, next) {

        let id = req.body.game;
        let vote = {
            user: req.user._id,
            option: req.body.option
        }
        let userId = req.user._id;

        gameRepo.postVote(id, vote, userId, (err, thread) => {
            if (err) return next(err);
            res.json({});
        })

    }

    getPoll(req, res, next) {

        let game = req.params.id;
        gameRepo.getPoll(game, (err, data) => {
            if (err) return next(err);
            res.json(data);
        })

    }

    getGames(req, res, next) {


        let now = new Date();
        let nowGap = new Date(now.getTime() - 1000 * 60 * 60 * 24); // Minus one day, so the game discussions can last one day more.
        gameRepo.getWeekGames(nowGap, (err, data) => {
            if (err) return next(err);
            res.json(data);
        })

    }

    getLeagueGames(req, res, next) {

        let leaguesForTop = JSON.parse(req.query.leagues);
        let now = new Date();
        let league = req.query.league;
        let nowGap = new Date(now.getTime() - 1000 * 60 * 60 * 24); // Minus one day, so the game discussions can last one day more.
        gameRepo.getWeekLeagueGames(league, leaguesForTop, nowGap, (err, data) => {
            if (err) return next(err);
            res.json(data);
        })

    }

    getGame(req, res, next) {

        let gameId = req.params.id;

        gameRepo.getGame(gameId, (err, game) => {
            if (err) return next(err);
            res.json(game);
        })
    }



}

module.exports = GamesController;