const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Game = require('../models/game');

class GameRepository {

    getWeekGames(now, callback) {
        Game.find({ 'gameDate': { $gt: now } }, { awayTeam: true, homeTeam: true, awayTeamScore: true, homeTeamScore: true, gameLocation: true, gameDate: true, league: true, replies: true, views: true })
            .populate('awayTeam')
            .populate('homeTeam')
            .sort({ gameDate: 1 })
            .exec((err, games) => {
                if (err) {
                    return callback(err);
                }
                callback(null, games)

            })
    }

    postVote(id, vote, userId, callback) {
        Game.findById(id, (err, game) => {
            if (err) return callback(err);
            if (!game) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }


            if (!game.votes.some(voter => voter.user === userId)) {
                if (game.pollValues.some(option => option == vote.option)) {
                    game.votes.push(vote);
                }

            }

            game.save((err, game) => {
                if (err) return callback(err);
                callback(null, game);
            })
        })
    }


    getWeekLeagueGames(league, leagues, now, callback) {


        if (league == 'TOP') { //NO ES TOP POR AHORA: ES ALL. (EVENTUALMENTE VA A SER TOP CUANDO AGREGUE LOS LIKES A JUEGOS)

            Game.find({ 'gameDate': { $gt: now }, "league": { $in: leagues } }, {votes: 0})
                .populate('awayTeam')
                .populate('homeTeam')
                .sort({ gameDate: 1 })
                .exec((err, games) => {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, games)

                })

        } else {
            Game.find({ 'gameDate': { $gt: now }, "league": league }, {votes: 0})
                .populate('awayTeam')
                .populate('homeTeam')
                .sort({ gameDate: 1 })
                .exec((err, games) => {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, games)

                })

        }


    }

    getPoll(gameId, callback) {
        Game.findById(gameId, {pollValues: 1, votes: 1})
            .exec((err, game) => {
                if (err) return callback(err);
                if (!game) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }
                callback(null,game)

            })
    }

    getGame(gameId, callback) {
        Game.findById(gameId)
            .populate('awayTeam')
            .populate('homeTeam')
            .exec((err, game) => {
                if (err) return callback(err);
                if (!game) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }
                game.views += 1;
                game.save((err, game) => {

                    let now = new Date();
                    let gameDate = new Date(game.gameDate);

                    if (err) return callback(err);
                    if (gameDate <= now) callback(null, game);

                })

            })
    }
}

module.exports = new GameRepository();

