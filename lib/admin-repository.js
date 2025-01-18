

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Team = require('../models/team'),
    Chat = require('../models/chat'),
    ObjectId = mongoose.Types.ObjectId,
    User = require('../models/user'),
    Tdiscussion = require('../models/thread-discussion'),
    DailyPoll = require('../models/poll'),
    Badge = require('../models/badge'),
    Trivia = require('../models/trivia'),
    Report = require('../models/reports'),
    Game = require('../models/game');

class AdminRepository {


    updateTrivia(body, id, callback) {
        Trivia.findById(id, (err, trivia) => {
            for (let index = 0; index < trivia.options.length; index++) {
                const option = trivia.options[index];
                option.option = body.options[index].option;
                option.picture = body.options[index].picture;
                
            }
            
            trivia.question = body.question;
            trivia.active = body.active;
            trivia.revealAnswer = body.revealAnswer;
            if(body.correctOption) trivia.correctOption = body.correctOption;
            trivia.league = body.league;
            trivia.active = body.active;
            console.log(trivia)
            trivia.save()

            if (err) return callback(err);
            callback(null, trivia);

        })
    }


    getTrivias(skip, callback) {

        Trivia.find({})
            .sort({ active: -1 })
            .sort({ date: -1 })
            .skip(skip)
            .limit(80)
            .exec((err, trivias) => {
                if (err) return callback(err);
                callback(null, trivias);
            })



    }


    postTrivia(body, userId, callback) {

        if (body.question.length <= 120) {

            body.user = userId;
            body.question = body.question[0].toUpperCase() + body.question.slice(1); //Upper
            
            let correctOption;
            if(body.correctOption) {
                correctOption = body.correctOption
                delete body.correctOption;
            }

            Trivia.create(body, (err, trivia) => {
                if (err) return callback(err);
                if(body.correctOption) {
                    trivia.correctOption = trivia.options.find(o => o.option == correctOption)._id;
                    trivia.save();
                    return callback(null, trivia);
                } else {
                    return callback(null, trivia);
                }
            })

        } else {
            callback(null, null, "Invalid");
        }
    }



    blockUser(data, callback) {
        User.findById(data.id)
            .exec((err, user) => {
                if (err) return callback(err);
                user.blocked = !user.blocked;
                user.blockedReason = data.reason ? data.reason : "";
                user.save((err) => {
                    if (err) return callback(err);
                    callback(null, true);
                })

            })
    }


    getUsers(username, callback) {

        User.find({ "username": new RegExp('.*' + username + '.*', "i") })
            .populate('badge')
            .exec((err, users) => {
                if (err) return callback(err);
                callback(null, users);
            })
    }

    //TEAMS

    getTeams(callback) {
        Team.find({})
            .sort({ teamName: 1 })
            .exec((err, teams) => {
                if (err) return callback(err);
                callback(null, teams);
            })
    }

    postTeam(body, callback) {
        Team.create(body, (err, game) => {
            if (err) return callback(err);
            callback(null, game);

        })

    }

    updateTeam(body, id, callback) {
        Team.findByIdAndUpdate(id, body, (err, team) => {
            if (err) return callback(err);
            callback(null, team);

        })
    }

    //GAMES

    deleteGame(gameId, callback) {
        Game.findById(gameId, (err, game) => {
            if (err) return callback(err);
            game.remove((err) => {
                if (err) return callback(err);
                callback(null, true)

            })

        })
    }

    postGame(body, callback) {
        console.log('perro');

        Game.create(body, (err, game) => {
            if (err) return callback(err);

            let chat = {
                game: game._id,
                roomDate: game.gameDate,
                league: game.league,
                room: true
            }

            console.log(chat)
            Chat.create(chat, (err, chat) => {
                console.log(chat)
                if (err) return callback(err);
                Game.populate(game, [{ "path": "awayTeam" }, { "path": "homeTeam" }], (error, result) => {
                    if (error) return callback(error);
                    callback(null, result);
                });

            })


        })

    }

    getGames(skip, league, callback) {
        Game.find({ "league": league })
            .sort({ gameDate: -1 })
            .skip(skip)
            .limit(20)
            .populate("awayTeam")
            .populate("homeTeam")
            .exec((err, games) => {
                if (err) return callback(err);
                callback(null, games);
            })
    }

    updateGame(body, id, callback) {

        Game.findByIdAndUpdate(id, body)
            .exec((err, game) => {
                if (err) return callback(err);
                if (body.updateRecord) {
                    Team.findById(game.homeTeam, (err, homeTeam) => {
                        if (err) return callback(err);
                        Team.findById(game.awayTeam, (err, awayTeam) => {
                            if (err) return callback(err);
                            if (game.league != 'Soccer') {



                                if (game.league == 'NHL') {

                                    //NHL
                                    if (body.homeTeamScore > body.awayTeamScore) {
                                        homeTeam.wins += 1;
                                        //OTL
                                        if ((body.homeTeamPointsOT != body.awayTeamPointsOT) || (body.homeTeamPointsSO != body.awayTeamPointsSO)) {
                                            awayTeam.otl += 1;
                                        } else {
                                            awayTeam.loses += 1;
                                        }

                                        if (body.mistake) {
                                            awayTeam.wins -= 1;
                                            if ((body.homeTeamPointsOT != body.awayTeamPointsOT) || (body.homeTeamPointsSO != body.awayTeamPointsSO)) {
                                                homeTeam.otl -= 1;
                                            } else {
                                                homeTeam.loses -= 1;
                                            }
                                        }
                                    }
                                    else {

                                        awayTeam.wins += 1;

                                        //OTL
                                        if ((body.homeTeamPointsOT != body.awayTeamPointsOT) || (body.homeTeamPointsSO != body.awayTeamPointsSO)) {
                                            homeTeam.otl += 1;
                                        } else {
                                            homeTeam.loses += 1;
                                        }
                                        if (body.mistake) {
                                            homeTeam.wins -= 1;
                                            if ((body.homeTeamPointsOT != body.awayTeamPointsOT) || (body.homeTeamPointsSO != body.awayTeamPointsSO)) {
                                                awayTeam.otl -= 1;
                                            } else {
                                                awayTeam.loses -= 1;
                                            }

                                        }

                                    }

                                } else {

                                    //NBA and NFL
                                    if (body.homeTeamScore > body.awayTeamScore) {
                                        homeTeam.wins += 1;
                                        awayTeam.loses += 1;
                                        if (body.mistake) {
                                            homeTeam.loses -= 1;
                                            awayTeam.wins -= 1;
                                        }
                                    }
                                    else {
                                        homeTeam.loses += 1;
                                        awayTeam.wins += 1;
                                        if (body.mistake) {
                                            awayTeam.loses -= 1;
                                            homeTeam.wins -= 1;

                                        }

                                    }

                                }

                            }


                            homeTeam.save((err, homeTeamSaves) => {
                                if (err) return callback(err);
                                awayTeam.save((err, awayTeam) => {
                                    if (err) return callback(err);
                                })
                            })
                        })

                    })
                }


                callback(null, game);


            })
    }


    getUserPosts(userId, skip, callback) {
        Thread.find({ user: userId }, { votes: false, usersViews: false })
            .skip(skip)
            .limit(30)
            .sort({ date: -1 })
            .exec((err, threads) => {
                if (err) return callback(err);
                callback(null, threads);

            })

    }

    getUserDiscussions(userId, skip, callback) {

        Tdiscussion.aggregate([
            { $match: { user: ObjectId(userId) } },
            {
                $project: {
                    discussion: 1,
                    date: 1,
                    thread: 1,
                    game: 1,
                    likers: 1,
                    count: { $size: "$likers" },
                    numberOfAnswers: { $size: "$answers" },
                }
            },
            { $sort: { date: -1 } },
            { $skip: skip },
            { $limit: 60 }
        ], (err, discussions) => {

            if (err) return callback(err);
            Tdiscussion.populate(discussions, { "path": "thread", "populate": { 'path': 'user', "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } } }, (error, results) => {
                if (error) return callback(error);
                Tdiscussion.populate(discussions, { "path": "game" }, (error, results) => {
                    if (error) return callback(error);
                    Tdiscussion.populate(results, [{ "path": "game.awayTeam", "model": "Team" },
                    { "path": "game.homeTeam", "model": "Team" }],
                        (error, discussionsPopulated) => {
                            if (error) return callback(error);
                            callback(null, discussionsPopulated);
                        });
                });


            });

        })


    }

    getUserReplies(userId, skip, callback) {
        Tdiscussion.aggregate([
            { $match: { "answers.user": ObjectId(userId) } },
            { $unwind: "$answers" },
            { $match: { "answers.user": ObjectId(userId) } },
            {
                $project: {
                    "answers.date": 1,
                    "answers.user": 1,
                    date: "$answers.date",
                    game: 1,
                    thread: 1,
                    game: 1,
                    discussion: 1,
                    likers: 1,
                    user: 1,
                    "answers.replyText": 1,
                    "answers._id": 1,
                    "answers.discussion": 1,
                    "answers.responding": 1,
                    "answers.likers": 1,
                    numberOfLikers: { $size: "$answers.likers" },
                    numberOfDislikers: { $size: "$answers.dislikers" }

                }
            },

            { $sort: { date: -1 } },
            { $skip: skip },
            { $limit: 60 }
        ], (err, discussions) => {

            if (err) return callback(err);
            Tdiscussion.populate(discussions, [{ "path": "thread", "populate": { 'path': 'user', "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } } }, { "path": "answers.responding", "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } }, { "path": "game" }, { "path": "user", "populate": { "path": 'badge' } }], (error, results) => {
                if (error) return callback(error);
                Tdiscussion.populate(results, [{ "path": "game.awayTeam", "model": "Team" },
                { "path": "game.homeTeam", "model": "Team" }],
                    (error, discussionsPopulated) => {
                        if (error) return callback(error);
                        callback(null, discussionsPopulated);
                    });
            });
        })


    }


    getReports(callback) {
        Report.find({ reviewed: false })
            .populate('userReported', { 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, "_id": 1, "playerIds": 1 })
            .populate('userReporting', { 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, "_id": 1, "playerIds": 1 })
            .sort({ date: -1 })
            .exec((err, reports) => {
                if (err) return callback(err);
                callback(null, reports);
            })

    }

    //BADGE

    postBadge(body, callback) {

        Badge.create(body, (err, badge) => {
            if (err) return callback(err);
            callback(null, badge);
        })

    }

    getBadges(callback) {
        Badge.find({})
            .sort({ level: -1 })
            .exec((err, badges) => {
                if (err) return callback(err);
                callback(null, badges);
            })

    }

    updateReport(id, data, callback) {
        Report.findByIdAndUpdate(id, data, (err, report) => {
            if (err) return callback(err);
            callback(null, report)
        })
    }

    updateBadge(body, id, callback) {

        Badge.findByIdAndUpdate(id, body, (err, badge) => {
            if (err) return callback(err);
            let nextLevel = badge.level + 1;
            let previousLevel = badge.level - 1;

            badge.name = body.name;
            badge.nextName = body.nextName;
            badge.nextPicture = body.nextPicture;
            badge.nextPoints = body.nextPoints;
            badge.picture = body.picture;
            badge.previousPoints = body.previousPoints;

            Badge.findOne({ 'level': nextLevel }, (err, nextBadge) => {
                if (err) return callback(err);
                if (nextBadge) {

                    badge.nextBadge = nextBadge._id;
                }
                Badge.findOne({ 'level': previousLevel }, (err, previousBadge) => {
                    if (err) return callback(err);
                    if (previousBadge) {

                        badge.previousBadge = previousBadge._id;
                    }
                    badge.save((err) => {
                        if (err) return callback(err);
                        callback(null, badge);
                    })

                })


            })
        })
    }

    //poll


    updatePoll(body, id, callback) {

        DailyPoll.findByIdAndUpdate(id, body, (err, poll) => {
            if (err) return callback(err);

            callback(null, poll);

        })
    }


    postPoll(body, callback) {

        DailyPoll.create(body, (err, poll) => {
            if (err) return callback(err);
            callback(null, poll);
        })

    }

    getPolls(skip, league, callback) {
        DailyPoll.find({ "league": league })
            .sort({ date: 1 })
            .skip(skip)
            .limit(20)
            .exec((err, polls) => {
                if (err) return callback(err);
                callback(null, polls);
            })
    }
}

module.exports = new AdminRepository();

