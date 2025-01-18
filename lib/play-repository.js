

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Trivia = require('../models/trivia'),
    User = require('../models/user'),
    Badge = require('../models/badge'),
    Curated = require('../models/curated'),
    DailyPoll = require('../models/poll'),
    Tdiscussion = require('../models/thread-discussion');


class PlayRepository {


    timesUp(triviaId, userId, callback) {

        Trivia.findById(triviaId)
            .exec((err, trivia) => {
                if (err) return callback(null, false);
                if (!trivia) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(null, false);
                }

                User.findById(userId)
                    .exec((err, user) => {
                        if (err) return callback(null, false);
                        if (!user) {
                            return callback(null, false);
                        }

                        //guardar respuesta de usuario
                        let sizeOfSavedTriviasByLeague = user.dailyTrivias.filter(t => t.league == trivia.league).length;
                        if (sizeOfSavedTriviasByLeague > 8) {
                            let index = user.dailyTrivias.findIndex(t => t.league == trivia.league) //regresar el primero que encuentre
                            if (index > -1) {
                                user.dailyTrivias.splice(index, 1);
                            }
                        }
                        let userTrivia = {
                            league: trivia.league,
                            trivia: trivia._id,
                            timesUp: true
                        }
                        if (!user.dailyTrivias.some(t => t.trivia.toString() == trivia._id.toString())) user.dailyTrivias.push(userTrivia)

                        user.save((err) => {
                            if (err) return callback(null, false);
                            callback(null, true);
                        })
                    })


            })
    }

    postTriviaAnswer(body, userId, callback) {

        Trivia.findById(body.trivia)
            .exec((err, trivia) => {
                if (err) return callback(null, false);
                if (!trivia) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(null, false);
                }

                let index = trivia.options.findIndex(o => o._id == body.answerId)
                if (index > -1) trivia.options[index].count += 1;

                trivia.save((err, savedTrivia) => {

                    User.findById(userId)
                        .exec((err, user) => {
                            if (err) return callback(null, false);
                            if (!user) {
                                return callback(null, false);
                            }

                            //la tuvo bie
                            if (body.answerId == trivia.correctOption.toString()) {
                                user.totalPoints += 5;
                                if (user.badge.nextBadge) {
                                    if (user.totalPoints >= user.badge.nextPoints) {
                                        user.badge = user.badge.nextBadge;
                                    }
                                }
                            }


                            //guardar respuesta de usuario
                            let sizeOfSavedTriviasByLeague = user.dailyTrivias.filter(t => t.league == trivia.league).length;
                            if (sizeOfSavedTriviasByLeague > 8) {
                                let index = user.dailyTrivias.findIndex(t => t.league == trivia.league) //regresar el primero que encuentre
                                if (index > -1) {
                                    user.dailyTrivias.splice(index, 1);
                                }
                            }
                            let userTrivia = {
                                league: trivia.league,
                                trivia: trivia._id,
                                answer: body.answerId
                            }
                            if (!user.dailyTrivias.some(t => t.trivia.toString() == trivia._id.toString())) user.dailyTrivias.push(userTrivia)

                            user.save((err) => {
                                if (err) return callback(null, false);
                                callback(null, true);
                            })
                        })

                })
            })
    }

  


    getDailyTrivias(league, leagues, callback) { //HOT

        if (league == "TOP") {
            if (!leagues.includes("General")) {
                leagues.push('General')
            }
            Trivia.aggregate([
                { $match: { active: true, league: { $in: leagues } } },
                { $sort: { date: -1 } }
            ], (err, trivias) => {
                if (err) return callback(err);
                Trivia.populate(trivias, { path: 'user', select: { 'username': 1, 'profilePicture': 1, 'verified': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);
                    callback(null, results);
                });
            })


        } else {

            Trivia.aggregate([
                { $match: { active: true, league: league} },
                { $sort: { date: -1 } }
            ], (err, trivias) => {
                if (err) return callback(err);
                Trivia.populate(trivias, { path: 'user', select: { 'username': 1, 'profilePicture': 1, 'verified': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);
                    callback(null, results);
                });
            })

        }

    }

    getDailyPicks(league, leagues, callback) { //HOT

        if (league == "TOP") {
            if (!leagues.includes("General")) {
                leagues.push('General')
                leagues.push('Test')
            }
            Trivia.aggregate([
                { $match: { active: true, league: { $in: leagues }, type: 'pick' } },
                { $sort: { date: -1 } }
            ], (err, trivias) => {
                if (err) return callback(err);
                Trivia.populate(trivias, { path: 'user', select: { 'username': 1, 'profilePicture': 1, 'verified': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);
                    console.log(results)
                    callback(null, results);
                });
            })


        } else {

            Trivia.aggregate([
                { $match: { active: true, league: league, type: 'pick'} },
                { $sort: { date: -1 } }
            ], (err, trivias) => {
                if (err) return callback(err);
                Trivia.populate(trivias, { path: 'user', select: { 'username': 1, 'profilePicture': 1, 'verified': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);
                    callback(null, results);
                });
            })

        }

    }



    deleteTrivia(isAdmin, userId, body, callback) {

        Trivia.findById(body.tId, (err, trivia) => {
            if (err) return callback(err);
            if (trivia.user.toString() == userId || isAdmin) {
                trivia.remove((err, trivia) => {
                    if (err) return callback(err);
                    User.findById(trivia.user)
                        .populate('badge')
                        .exec((err, user) => {
                            if (err) return callback(err);
                            user.totalPoints -= 10;
                            if (user.badge.previousBadge) {
                                if (user.totalPoints < user.badge.previousPoints) {
                                    user.badge = user.badge.previousBadge;
                                }
                            }
                            user.trivias = user.trivias.filter(trivia => trivia != body.tId);
                            user.save((err) => {
                                if (err) return callback(err);
                                callback(null, true);
                            })

                        })
                })

            } else {


            }
        })
    }

}



module.exports = new PlayRepository();

