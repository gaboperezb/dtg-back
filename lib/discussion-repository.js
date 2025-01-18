const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Types.ObjectId,
    Discussion = require('../models/discussion'),
    Tdiscussion = require('../models/thread-discussion'),
    Team = require('../models/team'),
    User = require('../models/user'),
    Game = require('../models/game'),
    agenda = require('./agenda'),
    fcm = require('./fcm'),
    Badge = require('../models/badge')
const gameRepo = require('./game-repository');

class DiscussionRepository {

    ////////////////////Version 2

    //Para app

    getTopAppDiscussionsPre(userId, gameMoment, gameId, limit, skipNumber, callback) { //HOT


        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!logged) {

            Tdiscussion.aggregate([
                { $match: { game: ObjectId(gameId), gameMoment: gameMoment } },
                {
                    $project: {
                        user: 1,
                        discussion: 1,
                        post: 1,
                        likers: 1,
                        dislikers: 1,
                        date: 1,
                        numberOfAnswers: { $size: "$answers" },
                        count: { $size: "$likers" },
                        rankingTop:
                        {
                            $add: [
                                { $size: "$likers" },
                                -1,
                                { $multiply: [{ $size: "$answers" }, 0.4] }
                            ]
                        }
                    }
                },
                { $sort: { rankingTop: -1 } },
                { $skip: skipNumber },
                { $limit: limit },
            ], (err, discussions) => {
                if (err) return callback(err);
                Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1,"followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "totalPoints": 1, "badge": 1, "coverPhoto": 1, "playerIds": 1 } }, (error, results) => {
                    if (error) return callback(error);
                    Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                        if (error) return callback(error);
                        callback(null, resultsBadge);
                    });

                });
            })

        } else {

            User.findById(userId)
                .exec((err, user) => {
                    if (err) return callback(err);
                    if (!user) {
                        var err = new Error("Not Found");
                        err.status = 404;
                        return callback(err);
                    }

                    var usersFlag = user.usersBlocked.concat(user.usersBlockedBy.filter((item) => {
                        return user.usersBlocked.indexOf(item) < 0;
                    }));

                    Tdiscussion.aggregate([
                        { $match: { game: ObjectId(gameId), gameMoment: gameMoment, user: { $nin: usersFlag } } },
                        {
                            $project: {
                                user: 1,
                                discussion: 1,
                                post: 1,
                                likers: 1,
                                dislikers: 1,
                                date: 1,
                                numberOfAnswers: { $size: "$answers" },
                                count: { $size: "$likers" },
                                rankingTop:
                                {
                                    $add: [
                                        { $size: "$likers" },
                                        -1,
                                        { $multiply: [{ $size: "$answers" }, 0.4] }
                                    ]
                                }
                            }
                        },
                        { $sort: { rankingTop: -1 } },
                        { $skip: skipNumber },
                        { $limit: limit },
                    ], (err, discussions) => {
                        if (err) return callback(err);
                        Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1,"followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "totalPoints": 1, "badge": 1, "coverPhoto": 1, "playerIds": 1 } }, (error, results) => {
                            if (error) return callback(error);
                            Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                                if (error) return callback(error);
                                callback(null, resultsBadge);
                            });

                        });
                    })

                })

            //



        }


    }

    getAppDiscussionsPre(userId, gameMoment, gameId, limit, skipNumber, callback) { //HOT

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!logged) {

            Tdiscussion.aggregate([
                { $match: { game: ObjectId(gameId), gameMoment: gameMoment } },
                {
                    $project: {
                        user: 1,
                        discussion: 1,
                        post: 1,
                        likers: 1,
                        dislikers: 1,
                        date: 1,
                        numberOfAnswers: { $size: "$answers" },
                        count: { $size: "$likers" },
                        ranking: {
                            $divide: [
                                {
                                    $add: [
                                        { $size: "$likers" },
                                        -1,
                                        { $multiply: [{ $size: "$answers" }, 0.4] }
                                    ]
                                },
                                { $pow: [{ $add: [{ $divide: [{ $subtract: [new Date(), "$date"] }, 3.6e+6] }, 2] }, 1.2] }
                            ]
                        }
                    }
                },
                { $sort: { ranking: -1 } },
                { $skip: skipNumber },
                { $limit: limit },
            ], (err, discussions) => {
                if (err) return callback(err);
                Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1,"followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "totalPoints": 1, "badge": 1, "coverPhoto": 1, "playerIds": 1 } }, (error, results) => {
                    if (error) return callback(error);
                    Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                        if (error) return callback(error);
                        callback(null, resultsBadge);
                    });

                });
            })

        } else {

            User.findById(userId)
                .exec((err, user) => {
                    if (err) return callback(err);
                    if (!user) {
                        var err = new Error("Not Found");
                        err.status = 404;
                        return callback(err);
                    }

                    var usersFlag = user.usersBlocked.concat(user.usersBlockedBy.filter((item) => {
                        return user.usersBlocked.indexOf(item) < 0;
                    }));


                    Tdiscussion.aggregate([
                        { $match: { game: ObjectId(gameId), gameMoment: gameMoment, user: { $nin: usersFlag } } },
                        {
                            $project: {
                                user: 1,
                                discussion: 1,
                                post: 1,
                                likers: 1,
                                dislikers: 1,
                                date: 1,
                                numberOfAnswers: { $size: "$answers" },
                                count: { $size: "$likers" },
                                ranking: {
                                    $divide: [
                                        {
                                            $add: [
                                                { $size: "$likers" },
                                                -1,
                                                { $multiply: [{ $size: "$answers" }, 0.4] }
                                            ]
                                        },
                                        { $pow: [{ $add: [{ $divide: [{ $subtract: [new Date(), "$date"] }, 3.6e+6] }, 2] }, 1.2] }
                                    ]
                                }
                            }
                        },
                        { $sort: { ranking: -1 } },
                        { $skip: skipNumber },
                        { $limit: limit },
                    ], (err, discussions) => {
                        if (err) return callback(err);
                        Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1,"followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "totalPoints": 1, "badge": 1, "coverPhoto": 1, "playerIds": 1 } }, (error, results) => {
                            if (error) return callback(error);
                            Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                                if (error) return callback(error);
                                callback(null, resultsBadge);
                            });

                        });
                    })

                })


        }

    }

    getAppNewDiscussionsPre(userId, gameMoment, gameId, limit, skipNumber, callback) { //NEW

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!logged) {

            Tdiscussion.aggregate([
                { $match: { game: ObjectId(gameId), gameMoment: gameMoment } },
                {
                    $project: {
                        user: 1,
                        discussion: 1,
                        post: 1,
                        likers: 1,
                        dislikers: 1,
                        date: 1,
                        numberOfAnswers: { $size: "$answers" },
                        count: { $size: "$likers" }
                    }
                },
                { $sort: { date: -1 } },
                { $skip: skipNumber },
                { $limit: limit },
            ], (err, discussions) => {
                if (err) return callback(err);

                Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1,"followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1 } }, (error, results) => {
                    if (error) return callback(error);
                    Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                        if (error) return callback(error);
                        callback(null, resultsBadge);
                    });

                });
            })

        } else {

            User.findById(userId)
                .exec((err, user) => {
                    if (err) return callback(err);
                    if (!user) {
                        var err = new Error("Not Found");
                        err.status = 404;
                        return callback(err);
                    }

                    var usersFlag = user.usersBlocked.concat(user.usersBlockedBy.filter((item) => {
                        return user.usersBlocked.indexOf(item) < 0;
                    }));

                    Tdiscussion.aggregate([
                        { $match: { game: ObjectId(gameId), gameMoment: gameMoment, user: { $nin: usersFlag } } },
                        {
                            $project: {
                                user: 1,
                                discussion: 1,
                                post: 1,
                                likers: 1,
                                dislikers: 1,
                                date: 1,
                                numberOfAnswers: { $size: "$answers" },
                                count: { $size: "$likers" }
                            }
                        },
                        { $sort: { date: -1 } },
                        { $skip: skipNumber },
                        { $limit: limit },
                    ], (err, discussions) => {
                        if (err) return callback(err);

                        Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1,"followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1 } }, (error, results) => {
                            if (error) return callback(error);
                            Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                                if (error) return callback(error);
                                callback(null, resultsBadge);
                            });

                        });
                    })

                })

        }

    }

    ///////////

    getDiscussion(id, callback) {
        Tdiscussion.findById(id)
            .populate({ 'path': 'user', "select": { 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1 } })
            .exec((err, discussion) => {
                if (err) return callback(err);
                if (!discussion) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }

                Badge.populate(result, { "path": "user.badge" }, (error, resultBadge) => {
                    if (error) return callback(error);
                    console.log(resultBadge);
                    resultBadge.answers = undefined;
                    callback(null, resultBadge);
                });

            })
    }

    deletePost(isAdmin, userId, body, callback) {
        Tdiscussion.findById(body.dId, (err, discussion) => {
            if (err) return callback(err);
            if (!discussion) return callback(null, false);
            if (body.aId) {

                let userToDelete;

                let answer = discussion.answers.filter(answer => answer.id == body.aId);
                if (!answer[0]) return callback(null, false);
                if (answer[0].user.toString() == userId || isAdmin) {
                    userToDelete = answer[0].user;
                    discussion.answers = discussion.answers.filter(answer => answer.id != body.aId);

                    discussion.save((err, discussion) => {
                        if (err) return callback(err);
                        Game.findById(body.gId, (err, game) => {

                            if (err) return callback(err);
                            if (!game) {
                                var err = new Error("Not Found");
                                err.status = 404;
                                return callback(err);
                            }
                            game.replies -= 1;
                            game.save((err, game) => {
                                if (err) return callback(err);
                                User.findById(userToDelete)
                                    .populate('badge')
                                    .exec((err, user) => {
                                        if (err) return callback(err);
                                        if (!user) {
                                            var err = new Error("Not Found");
                                            err.status = 404;
                                            return callback(err);
                                        }

                                        user.totalPoints -= 5;
                                        if (user.badge.previousBadge) {
                                            if (user.totalPoints < user.badge.previousPoints) {
                                                user.badge = user.badge.previousBadge;
                                            }
                                        }
                                        user.save((err) => {
                                            if (err) return callback(err);
                                            callback(null, true);
                                        })

                                    })


                            })

                        })

                    })
                }

            } else {
                if (body.userId.toString() == discussion.user || isAdmin) {
                    discussion.remove((err) => {
                        if (err) return callback(err);
                        Game.findById(body.gId, (err, game) => {

                            if (err) return callback(err);
                            if (!game) {
                                var err = new Error("Not Found");
                                err.status = 404;
                                return callback(err);
                            }
                            game.replies -= 1;
                            game.save((err, game) => {
                                if (err) return callback(err);
                                User.findById(discussion.user)
                                    .populate('badge')
                                    .exec((err, user) => {
                                        if (err) return callback(err);
                                        if (!user) {
                                            var err = new Error("Not Found");
                                            err.status = 404;
                                            return callback(err);
                                        }

                                        user.totalPoints -= 5;
                                        if (user.badge.previousBadge) {
                                            if (user.totalPoints < user.badge.previousPoints) {
                                                user.badge = user.badge.previousBadge;
                                            }
                                        }
                                        user.save((err) => {
                                            if (err) return callback(err);
                                            callback(null, true);
                                        })

                                    })


                            })

                        })

                    })

                }
            }

        })

    }

    getInGameDiscussions(userId, gameId, limit, callback) {
        let typeOfDiscussions = false;
        Tdiscussion.aggregate([
            { $match: { game: ObjectId(gameId), post: typeOfDiscussions } },
            {
                $project: {
                    user: 1,
                    discussion: 1,
                    post: 1,
                    likers: 1,
                    dislikers: 1,
                    date: 1,
                    userPost: { $eq: ["$user", ObjectId(userId)] },
                    numberOfAnswers: { $size: "$answers" },
                    count: { $subtract: [{ $size: "$likers" }, { $size: "$dislikers" }] }
                }
            },
            { $sort: { userPost: -1 /* count: -1, numberOfAnswers: -1 */, date: -1 } },
            { $limit: limit },
        ], (err, discussions) => {
            if (err) return callback(err);




            Tdiscussion.populate(discussions, { "path": "user", "select": { 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "totalPoints": 1 } }, (error, results) => {
                if (error) return callback(error);
                Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                    if (error) return callback(error);
                    callback(null, resultsBadge);
                });

            });
        })





    }


    //Para app

    getTopAppDiscussions(gameHasEnded, gameId, limit, skipNumber, callback) { //HOT
        let gameHasEndedCast = gameHasEnded == "true" ? true : false;
        Tdiscussion.aggregate([
            { $match: { game: ObjectId(gameId), post: gameHasEndedCast } },
            {
                $project: {
                    user: 1,
                    discussion: 1,
                    post: 1,
                    likers: 1,
                    dislikers: 1,
                    date: 1,
                    numberOfAnswers: { $size: "$answers" },
                    count: { $size: "$likers" },
                    rankingTop:
                    {
                        $add: [
                            { $size: "$likers" },
                            -1,
                            { $multiply: [{ $size: "$answers" }, 0.4] }
                        ]
                    }
                }
            },
            { $sort: { rankingTop: -1 } },
            { $skip: skipNumber },
            { $limit: limit },
        ], (err, discussions) => {
            if (err) return callback(err);
            Tdiscussion.populate(discussions, { "path": "user", "select": { 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "totalPoints": 1, "badge": 1, "coverPhoto": 1, "playerIds": 1 } }, (error, results) => {
                if (error) return callback(error);
                Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                    if (error) return callback(error);
                    callback(null, resultsBadge);
                });

            });
        })
    }

    getAppDiscussions(gameHasEnded, gameId, limit, skipNumber, callback) { //HOT
        let gameHasEndedCast = gameHasEnded == "true" ? true : false;
        Tdiscussion.aggregate([
            { $match: { game: ObjectId(gameId), post: gameHasEndedCast } },
            {
                $project: {
                    user: 1,
                    discussion: 1,
                    post: 1,
                    likers: 1,
                    dislikers: 1,
                    date: 1,
                    numberOfAnswers: { $size: "$answers" },
                    count: { $size: "$likers" },
                    ranking: {
                        $divide: [
                            {
                                $add: [
                                    { $size: "$likers" },
                                    -1,
                                    { $multiply: [{ $size: "$answers" }, 0.4] }
                                ]
                            },
                            { $pow: [{ $add: [{ $divide: [{ $subtract: [new Date(), "$date"] }, 3.6e+6] }, 2] }, 1.2] }
                        ]
                    }
                }
            },
            { $sort: { ranking: -1 } },
            { $skip: skipNumber },
            { $limit: limit },
        ], (err, discussions) => {
            if (err) return callback(err);
            Tdiscussion.populate(discussions, { "path": "user", "select": { 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "totalPoints": 1, "badge": 1, "coverPhoto": 1, "playerIds": 1 } }, (error, results) => {
                if (error) return callback(error);
                Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                    if (error) return callback(error);
                    callback(null, resultsBadge);
                });

            });
        })
    }

    getAppNewDiscussions(gameHasEnded, gameId, limit, skipNumber, callback) { //NEW

        let gameHasEndedCast = gameHasEnded == "true" ? true : false;
        Tdiscussion.aggregate([
            { $match: { game: ObjectId(gameId), post: gameHasEndedCast } },
            {
                $project: {
                    user: 1,
                    discussion: 1,
                    post: 1,
                    likers: 1,
                    dislikers: 1,
                    date: 1,
                    numberOfAnswers: { $size: "$answers" },
                    count: { $size: "$likers" }
                }
            },
            { $sort: { date: -1 } },
            { $skip: skipNumber },
            { $limit: limit },
        ], (err, discussions) => {
            if (err) return callback(err);

            Tdiscussion.populate(discussions, { "path": "user", "select": { 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1 } }, (error, results) => {
                if (error) return callback(error);
                Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                    if (error) return callback(error);
                    callback(null, resultsBadge);
                });

            });
        })
    }





    //Para web

    getDiscussions(userId, gameId, limit, skipNumber, callback) {

        let typeOfDiscussions;
        Game.findById(gameId, (err, game) => {
            if (err) return callback(err);
            if (game.homeTeamScore >= 0) {
                typeOfDiscussions = true;
            } else {
                typeOfDiscussions = false;
            }


            Tdiscussion.aggregate([
                { $match: { game: ObjectId(gameId), post: typeOfDiscussions } },
                {
                    $project: {
                        user: 1,
                        discussion: 1,
                        post: 1,
                        likers: 1,
                        dislikers: 1,
                        date: 1,
                        userPost: { $eq: ["$user", ObjectId(userId)] },
                        numberOfAnswers: { $size: "$answers" },
                        count: { $subtract: [{ $size: "$likers" }, { $size: "$dislikers" }] }
                    }
                },
                { $sort: { userPost: -1 /* count: -1, numberOfAnswers: -1 */, date: -1 } },
                { $skip: skipNumber },
                { $limit: limit },
            ], (err, discussions) => {
                if (err) return callback(err);


                Tdiscussion.populate(discussions, { "path": "user", "select": { 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "totalPoints": 1, "coverPhoto": 1 } }, (error, results) => {
                    if (error) return callback(error);
                    Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                        if (error) return callback(error);
                        callback(null, resultsBadge);
                    });

                });
            })
        })
    }

    postDiscussion(opinion, gameId, userId, callback) {
        var discussion = new Tdiscussion();
        let now = new Date();
        discussion.user = userId;
        discussion.game = gameId;
        discussion.discussion = opinion[0].toUpperCase() + opinion.slice(1); //Upper;

        Game.findById(gameId, (err, game) => {
            if (err) return callback(err);
            if (!game) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            if (game.awayTeamScore >= 0 && game.homeTeamScore >= 0) {
                discussion.gameMoment = "post";
                discussion.post = true;
            }
            else if (now >= new Date(game.gameDate)) {
                discussion.gameMoment = 'in';
            } else {
                discussion.gameMoment = 'pre';
            }
            game.replies += 1;
            game.save((err, game) => {
                if (err) return callback(err);
                discussion.save((err, discussion) => {
                    if (err) return callback(err);
                    User.findById(userId)
                        .populate('badge')
                        .exec((err, user) => {
                            if (err) return callback(err);
                            if (!user) {
                                var err = new Error("Not Found");
                                err.status = 404;
                                return callback(err);
                            }

                            user.totalPoints += 5;
                            if (user.badge.nextBadge) {
                                if (user.totalPoints >= user.badge.nextPoints) {
                                    user.badge = user.badge.nextBadge;
                                }
                            }

                            user.save((err) => {
                                if (err) return callback(err);
                                Tdiscussion.populate(discussion, { "path": "user", "select": { "bio": 1,"createdAt": 1,'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "totalPoints": 1, "coverPhoto": 1 } }, (error, result) => {
                                    if (error) return callback(error);
                                    Badge.populate(result, { "path": "user.badge" }, (error, resultBadge) => {
                                        if (error) return callback(error);
                                        callback(null, resultBadge);
                                    });

                                });
                            })


                        })

                })

            })
        })


    }

    getAnswers(userId, discussionId, callback) {

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!logged) {

            Tdiscussion.findById(discussionId)
                .populate("answers.user", { "bio": 1,"createdAt": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 })
                .populate({ 'path': 'answers.responding', "select": { "bio": 1,"createdAt": 1,"followingNumber": 1, "followersNumber": 1, 'username': 1, "totalPoints": 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "_id": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } })
                .exec((err, discussion) => {

                    if (err) return callback(err);
                    if (!discussion) {
                        var err = new Error("Not Found");
                        err.status = 404;
                        return callback(err);
                    }

                    Badge.populate(discussion, { "path": "answers.user.badge" }, (error, resultsBadge) => {
                        if (error) return callback(error);
                        let answers = discussion.answers;
                        callback(null, answers);
                    });


                })

        } else {

            User.findById(userId)
                .exec((err, user) => {
                    if (err) return callback(err);
                    if (!user) {
                        var err = new Error("Not Found");
                        err.status = 404;
                        return callback(err);
                    }

                    var usersFlag = user.usersBlocked.concat(user.usersBlockedBy.filter((item) => {
                        return user.usersBlocked.indexOf(item) < 0;
                    }));

                    usersFlag = usersFlag.map((item) => item.toString());

                    Tdiscussion.findById(discussionId)
                        .populate("answers.user", { "bio": 1,"createdAt": 1,"followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 })
                        .populate({ 'path': 'answers.responding', "select": { "bio": 1,"createdAt": 1,"followingNumber": 1, "followersNumber": 1, 'username': 1, "totalPoints": 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "_id": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } })
                        .exec((err, discussion) => {

                            if (err) return callback(err);
                            if (!discussion) {
                                var err = new Error("Not Found");
                                err.status = 404;
                                return callback(err);
                            }

                            Badge.populate(discussion, { "path": "answers.user.badge" }, (error, resultsBadge) => {
                                if (error) return callback(error);
                                let answers = discussion.answers.filter((item) => {
                                    return usersFlag.indexOf(item.user._id.toString()) < 0
                                });
                                callback(null, answers);
                            });

                        })

                })



        }





    }

    postAnswer(playerIds, answer, userId, discussionId, callback) {

        let now = new Date();
        Tdiscussion.findById(discussionId)
            .exec((err, discussion) => {
                if (err) return callback(err);
                if (!discussion) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }

                //Se borra la respuesta antes de mandarla
                if(answer.aId) {
                    if(!discussion.answers.id(answer.aId)) {
                        var err = new Error("Not Found");
                        err.status = 404;
                        return callback(err);
                    }
                }
                let gameId = answer.gameId;

                let responding = answer.aId ? discussion.answers.id(answer.aId).user : discussion.user;
                let inReplyTo = answer.aId ? answer.aId : discussion._id;
                var newAnswer = {
                    user: userId,
                    discussion: answer.response[0].toUpperCase() + answer.response.slice(1), //Upper;,
                    responding: responding,
                    likers: [],
                    dislikers: [],
                    inReplyTo: inReplyTo,
                    date: new Date(),
                    parent: answer.parent,
                    replyText: answer.replyText,
                    replyType: answer.aId ? "answer" : "discussion"
                }

                let content = answer.response[0].toUpperCase() + answer.response.slice(1); //Upper;,
                Game.findById(gameId, (err, game) => {
                    if (err) return callback(err);
                    if (!game) {
                        var err = new Error("Not Found");
                        err.status = 404;
                        return callback(err);
                    }

                    if (game.awayTeamScore >= 0 && game.homeTeamScore >= 0) {
                        newAnswer.gameMoment = "post";
                        newAnswer.post = true;
                    }
                    else if (now >= new Date(game.gameDate)) {
                        newAnswer.gameMoment = 'in';
                    } else {
                        newAnswer.gameMoment = 'pre';
                    }
                    discussion.answers.push(newAnswer);
                    game.replies += 1;
                    game.save((err, game) => {
                        if (err) return callback(err);
                        discussion.save((err, discussionSaved) => {
                            if (err) return callback(err);
                            User.findById(userId)
                                .populate('badge')
                                .exec((err, user) => {
                                    if (err) return callback(err);
                                    if (!user) {
                                        var err = new Error("Not Found");
                                        err.status = 404;
                                        return callback(err);
                                    }

                                    let discussionUser = user.username;


                                    user.totalPoints += 5;
                                    if (user.badge.nextBadge) {
                                        if (user.totalPoints >= user.badge.nextPoints) {
                                            user.badge = user.badge.nextBadge;
                                        }
                                    }


                                    user.save((err) => {
                                        if (err) return callback(err);

                                        //Para las notificaciones
                                        User.findById(answer.userMention)
                                            .exec((err, userMention) => {

                                                if (err) return callback(err);
                                                if (!userMention) {
                                                    var err = new Error("Not Found");
                                                    err.status = 404;
                                                    return callback(err);
                                                }

                                                let userAnswers = discussionSaved.answers.filter(answer => answer.user.toString() === userId.toString());
                                                let lastUserAnswer = userAnswers[userAnswers.length - 1];

                                                let notification = {
                                                    user: userId,
                                                    notification: lastUserAnswer,
                                                    game: gameId,
                                                    replyText: answer.replyText,
                                                    typeOf: "mention",
                                                    replyType: answer.aId ? "answer" : "discussion",
                                                    parent: answer.parent,
                                                    timeline: discussion,
                                                    timelineUser: discussion.user
                                                };
                                                notification.timeline.answers = undefined;

                                                if (userMention.notis.length > 15) userMention.notis.splice(14);
                                                if (answer.userMention != userId) userMention.notis.unshift(notification);
                                                userMention.save((err, user) => {
                                                    if (err) return callback(err);

                                                    if (Array.isArray(playerIds)) {
                                                        if (playerIds.length == 0) return callback(null, lastUserAnswer);

                                                    }

                                                    let title = discussionUser + ' replied to ' + '"' + answer.replyText + '"';

                                                    //Post notification

                                                    let body = content;
                                                    let badge = (user.notifications.length + 1).toString();

                                                    var message = {
                                                        notification: {
                                                            title,
                                                            body,
                                                            sound: 'default',
                                                            badge,
                                                            icon: 'ic_stat_notify'
                                                        },
                                                        data: {
                                                            "timelineId": discussion._id.toString(),
                                                            "answerId": lastUserAnswer._id.toString(),
                                                            "gameId": gameId.toString(),
                                                            "cr": "1" //comment or reply (para distinfuir notificaiones)

                                                        }
                                                    };
                                                    // Send a message to the device corresponding to the provided
                                                    // registration token.
                                                    if (answer.userMention != userId) agenda.now('user notification', { playerIds: playerIds, notification: message });

                                                    // Post notification
                                                    callback(null, lastUserAnswer);
                                                })
                                            })


                                    })

                                })


                        })


                    })
                })



            })
    }



    getUserDiscussions(limit, skipNumber, userId, callback) {
        Tdiscussion.aggregate([
            { $match: { user: ObjectId(userId) } },
            {
                $project: {
                    discussion: 1,
                    date: 1,
                    game: 1,
                    numberOfLikers: { $size: "$likers" },
                    numberOfDislikers: { $size: "$dislikers" },
                    numberOfAnswers: { $size: "$answers" },
                }
            },
            { $sort: { date: -1 } },
            { $skip: skipNumber },
            { $limit: limit }
        ], (err, discussions) => {


            if (err) return callback(err);

            Tdiscussion.populate(discussions, { "path": "game", "select": { 'awayTeam': 1, 'homeTeam': 1 } }, (error, results) => {
                if (error) return callback(error);
                Tdiscussion.populate(results, [{ "path": "game.awayTeam", "model": "Team", "select": { 'abbreviation': 1 } },
                { "path": "game.homeTeam", "model": "Team", "select": { 'abbreviation': 1 } }],
                    (error, discussionsPopulated) => {
                        if (error) return callback(error);
                        callback(null, discussionsPopulated);
                    });
            });
        })

    }

    getNotifications(limit, skip, userId, callback) {
        Tdiscussion.aggregate([
            { $match: { "answers.responding": ObjectId(userId) } },
            { $unwind: "$answers" },
            { $match: { "answers.responding": ObjectId(userId) } },
            {
                $project: {
                    "answers.date": 1,
                    game: 1,
                    "answers.user": 1,
                    "answers.replyText": 1,
                    "answers.discussion": 1,
                    "answers.responding": 1,
                    "answers.likers": 1,
                    "answers.dislikers": 1,
                    "answers._id": 1,
                    date: "$answers.date",
                    "answers.inReplyTo": 1
                }
            },
            { $sort: { date: -1 } }, //para acomodar notificaciones hasta arriba
            { $skip: skip },
            { $limit: limit }
        ], (err, discussions) => {

            if (err) return callback(err);
            Game.populate(discussions, { "path": "discussion.game", "select": { 'awayTeam': 1, 'homeTeam': 1, '_id': 1 } }, (error, results) => {
                if (error) return callback(error);
                User.populate(results, [{ "path": "discussion.answers.user", "select": { 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1 } }, { "path": "discussion.game.awayTeam", "model": "Team", "select": { 'abbreviation': 1 } }, { "path": "discussion.game.homeTeam", "model": "Team", "select": { 'abbreviation': 1 } }],
                    (error, discussionsPopulated) => {
                        if (error) return callback(error);
                        callback(null, discussionsPopulated);
                    });
            });
        })

    }

    getUserAnswers(limit, skipNumber, userId, callback) {
        Tdiscussion.aggregate([
            { $match: { "answers.user": ObjectId(userId) } },
            { $unwind: "$answers" },
            { $match: { "answers.user": ObjectId(userId) } },
            {
                $project: {
                    user: 1,
                    "answers.date": 1,
                    date: "$answers.date",
                    game: 1,
                    thread: 1,
                    game: 1,
                    discussion: 1,
                    likers: 1,
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
            { $skip: skipNumber },
            { $limit: limit }
        ], (err, discussions) => {

            if (err) return callback(err);
            Tdiscussion.populate(discussions, [{ "path": "thread" }, { "path": "answers.responding", "select": { 'username': 1 } }, { "path": "game" }, { "path": "user", "populate": { "path": 'badge' } }], (error, results) => {
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



    addLike(discussionOrAnswer, discussionId, username, answerId, callback) {

        Tdiscussion.findById(discussionId, (err, discussion) => {
            if (err) callback(err);
            if (!discussion) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }
            if (discussionOrAnswer == "discussion") {
                if (!discussion.likers.some(liker => liker === username)) {
                    discussion.likers.push(username);
                    User.findById(discussion.user)
                        .populate('badge')
                        .exec((err, user) => {
                            if (err) return callback(err);

                            user.totalPoints += 1;
                            if (user.badge.nextBadge) {
                                if (user.totalPoints >= user.badge.nextPoints) {
                                    user.badge = user.badge.nextBadge;
                                }

                            }
                            user.save((err) => {
                                if (err) return callback(err);
                            })

                        })
                }
            }
            else {
                if (answerId && discussion.answers.id(answerId)) {
                    if (!discussion.answers.id(answerId).likers.some(liker => liker === username)) {
                        discussion.answers.id(answerId).likers.push(username);
                    }
                    User.findById(discussion.answers.id(answerId).user)
                        .populate('badge')
                        .exec((err, user) => {
                            if (err) return callback(err);

                            user.totalPoints += 1;
                            if (user.badge.nextBadge) {
                                if (user.totalPoints >= user.badge.nextPoints) {
                                    user.badge = user.badge.nextBadge;
                                }

                            }
                            user.save((err) => {
                                if (err) return callback(err);
                            })

                        })
                }
            }
            discussion.save((error, discussionSaved) => {
                if (error) callback(err);
                callback(null, discussion);
            })
        })
    }

    deleteLike(discussionOrAnswer, discussionId, username, answerId, callback) {
        Tdiscussion.findById(discussionId, (err, discussion) => {
            if (err) callback(err);
            if (!discussion) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }
            if (discussionOrAnswer == "discussion") {
                if (discussion.likers.some(liker => liker === username)) {
                    discussion.likers = discussion.likers.filter(liker => liker !== username);
                    User.findById(discussion.user)
                        .populate('badge')
                        .exec((err, user) => {
                            if (err) return callback(err);

                            user.totalPoints -= 1;
                            if (user.badge.previousBadge) {
                                if (user.totalPoints < user.badge.previousPoints) {
                                    user.badge = user.badge.previousBadge;
                                }
                            }
                            user.save((err) => {
                                if (err) return callback(err);

                            })

                        })
                }
            } else {
                if (answerId && discussion.answers.id(answerId)) {
                    if (discussion.answers.id(answerId).likers.some(liker => liker === username)) {
                        discussion.answers.id(answerId).likers = discussion.answers.id(answerId).likers.filter(liker => liker !== username);
                        User.findById(discussion.answers.id(answerId).user)
                            .populate('badge')
                            .exec((err, user) => {
                                if (err) return callback(err);

                                user.totalPoints -= 1;
                                if (user.badge.previousBadge) {
                                    if (user.totalPoints < user.badge.previousPoints) {
                                        user.badge = user.badge.previousBadge;
                                    }
                                }
                                user.save((err) => {
                                    if (err) return callback(err);

                                })

                            })
                    }
                }

            }

            discussion.save((error, discussionSaved) => {
                if (error) callback(err);
                callback(null, discussion);
            })
        })

    }




}

module.exports = new DiscussionRepository();

