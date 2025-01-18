const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Types.ObjectId,
    Tdiscussion = require('../models/thread-discussion'),
    Team = require('../models/team'),
    User = require('../models/user'),
    Badge = require('../models/badge'),
    Game = require('../models/game'),
    Thread = require('../models/thread'),
    agenda = require('./agenda');
gameRepo = require('./game-repository');

class ThreadDiscussionRepository {


    editDiscussion(data, callback) {

        let update = {
            discussion: data.discussion
        }

        //GIVEAWAY UNTIL 2 PM EST
        Tdiscussion.findById(data.commentId)
            .populate({ 'path': 'thread', "select": { "title": 1 } })
            .exec((err, comment) => {
                if (!comment) return callback(null, null);
                if (err) return callback(err);
                if (comment.thread) {
                    if (comment.thread.title == "DTG Super Bowl LIV Giveaway!") {
                        callback(null, 'trampa')
                    } else {
                        comment.discussion = data.discussion
                        comment.save((err, d) => {
                            if (err) return callback(err);
                            callback(null, d)
                        })
                    }
                } else {
                    comment.discussion = data.discussion
                    comment.save((err, d) => {
                        if (err) return callback(err);
                        callback(null, d)
                    })
                }

            })
        /* Tdiscussion.findByIdAndUpdate(data.commentId, update, { new: true }, (err, comment) => {

            if (!comment) return callback(null, null);
            if (err) {
                return callback(err)
            };
            callback(null, comment);

        }) */
    }

    editAnswer(data, callback) {

        Tdiscussion.findById(data.commentId)
            .exec((err, discussion) => {
                if (!discussion) return callback(null, null);
                if (err) {
                    return callback(err)
                };

                //Find index of specific object using findIndex method.    
                let objIndex = discussion.answers.findIndex((answer => answer.id == data.answerId));
                //Update object's discussion property.
                discussion.answers[objIndex].discussion = data.discussion;
                discussion.save((err, discussion) => {
                    if (err) {
                        return callback(err)
                    };
                    callback(null, discussion)
                })

            })

    }

    getDiscussion(id, callback) {
        Tdiscussion.findById(id)
            .populate({ 'path': 'trivia', "populate": { "path": 'user', "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { "path": 'badge' } } })
            .populate({ 'path': 'thread', "populate": { "path": 'user', "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { "path": 'badge' } } })
            .populate({ 'path': 'take', "populate": { "path": 'user', "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { "path": 'badge' } } })
            .populate({ 'path': 'user', "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1 } })
            .populate("answers.user", { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 })
            .populate({ 'path': 'answers.responding', "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'totalPoints': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "_id": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } })
            .exec((err, discussion) => {
                if (err) return callback(err);
                if (!discussion) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }


                if (discussion.game) {

                    Tdiscussion.populate(discussion, [{ "path": "game.awayTeam", "model": "Team" },
                    { "path": "game.homeTeam", "model": "Team" }],
                        (error, discussionsPopulated) => {
                            if (error) return callback(error);
                            callback(null, discussionsPopulated);


                        });

                } else {
                    Badge.populate(discussion, [{ "path": "user.badge" }, { "path": "answers.user.badge" }], (error, resultBadge) => {
                        if (error) return callback(error);
                        callback(null, resultBadge);
                    });
                }
            })
    }


    getUserThreadAnswers(limit, skipNumber, userId, callback) {
        Tdiscussion.aggregate([
            { $match: { "answers.user": ObjectId(userId) } },
            { $unwind: "$answers" },
            { $match: { "answers.user": ObjectId(userId) } },
            {
                $project: {
                    "answers.date": 1,
                    date: "$answers.date",
                    game: 1,
                    thread: 1,
                    take: 1,
                    trivia: 1,
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
            { $skip: skipNumber },
            { $limit: limit }
        ], (err, discussions) => {

            if (err) return callback(err);
            Tdiscussion.populate(discussions, [
                { "path": "thread", "populate": {'path': 'user', "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } } }, 
                { "path": "answers.responding", "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } }, 
                { "path": "user", "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } }], (error, results) => {
                if (error) return callback(error);
                callback(null, results);
            });
        })
    }

    getUserThreadDiscussions(limit, skipNumber, userId, callback) {
        Tdiscussion.aggregate([
            { $match: { user: ObjectId(userId) } },
            {
                $project: {
                    discussion: 1,
                    date: 1,
                    thread: 1,
                    take: 1,
                    trivia: 1,
                    game: 1,
                    likers: 1,
                    count: { $size: "$likers" },
                    numberOfDislikers: { $size: "$dislikers" },
                    numberOfAnswers: { $size: "$answers" },
                }
            },
            { $sort: { date: -1 } },
            { $skip: skipNumber },
            { $limit: limit }
        ], (err, discussions) => {

            if (err) return callback(err);
            Tdiscussion.populate(discussions, { "path": "thread", "populate": { 'path': 'user', "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } } }, (error, results) => {
                if (error) return callback(error);
                callback(null, results);

            });
        })

    }


    deleteCommentFromMyThread(isAdmin, userId, body, callback) {

        Tdiscussion.findById(body.dId, (err, discussion) => {
            if (err) return callback(err);
            if (!discussion) return callback(null, false);

            Thread.findById(body.tId, (err, thread) => {
                if (err) return callback(err);
                if (!thread) return callback(null, false);

                if (thread.user.toString() == userId || isAdmin || discussion.user.toString() == userId) {

                    discussion.remove((err) => {
                        if (err) return callback(err);

                        thread.replies -= (discussion.answers.length + 1);
                        thread.save((err, thread) => {
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
                                        User.findById(thread.user)
                                            .populate('badge')
                                            .exec((err, user) => {
                                                if (err) return callback(err);
                                                if (!user) {
                                                    var err = new Error("Not Found");
                                                    err.status = 404;
                                                    return callback(err);
                                                }
                                                if (userId != thread.user) {

                                                    user.totalPoints -= 1;
                                                    if (user.badge.previousBadge) {
                                                        if (user.totalPoints < user.badge.previousPoints) {
                                                            user.badge = user.badge.previousBadge;
                                                        }
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
                    })


                }



            })
        })


    }

    deletePost(isAdmin, userId, body, callback) {
        Tdiscussion.findById(body.dId, (err, discussion) => {
            if (err) return callback(err);
            if (!discussion) return callback(null, false);
            if (body.aId) {

                let answer = discussion.answers.filter(answer => answer.id == body.aId);
                if (!answer[0]) return callback(null, false);
                if (answer[0].user.toString() == userId || isAdmin) {
                    let userToDelete = answer[0].user;
                    discussion.answers = discussion.answers.filter(answer => answer.id != body.aId);

                    discussion.save((err, discussion) => {
                        if (err) return callback(err);
                        Thread.findById(body.tId, (err, thread) => {
                            if (err) return callback(err);
                            thread.replies -= 1;
                            thread.save((err, thread) => {
                                if (err) return callback(err);


                                //Usuario del thread
                                User.findById(thread.user)
                                    .populate('badge')
                                    .exec((err, userT) => {
                                        if (err) return callback(err);
                                        if (!userT) {
                                            var err = new Error("Not Found");
                                            err.status = 404;
                                            return callback(err);
                                        }
                                        userT.points -= 1;
                                        userT.totalPoints -= 1;
                                        if (userT.badge.previousBadge) {
                                            if (userT.totalPoints < userT.badge.previousPoints) {
                                                userT.badge = userT.badge.previousBadge;
                                            }
                                        }
                                        userT.save((err) => {
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

                        })

                    })
                }

            } else {

                if (discussion.user.toString() == userId || isAdmin) {
                    discussion.remove((err) => {
                        if (err) return callback(err);
                        Thread.findById(body.tId, (err, thread) => {
                            if (err) return callback(err);
                            thread.replies -= (discussion.answers.length + 1);
                            thread.save((err, thread) => {
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
                                            User.findById(thread.user)
                                                .populate('badge')
                                                .exec((err, user) => {
                                                    if (err) return callback(err);
                                                    if (!user) {
                                                        var err = new Error("Not Found");
                                                        err.status = 404;
                                                        return callback(err);
                                                    }
                                                    if (userId != thread.user) {

                                                        user.totalPoints -= 1;
                                                        if (user.badge.previousBadge) {
                                                            if (user.totalPoints < user.badge.previousPoints) {
                                                                user.badge = user.badge.previousBadge;
                                                            }
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

                        })

                    })

                }

            }
        })
    }

    getTopDiscussions(userId, threadId, limit, skipNumber, callback) { // TOP

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!logged) {

            Tdiscussion.aggregate([
                { $match: { thread: ObjectId(threadId) } },
                {
                    $project: {
                        user: 1,
                        discussion: 1,
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
                Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 } }, (error, results) => {
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
                        { $match: { thread: ObjectId(threadId), user: { $nin: usersFlag } } },
                        {
                            $project: {
                                user: 1,
                                discussion: 1,
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
                        Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 } }, (error, results) => {
                            if (error) return callback(error);
                            Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                                if (error) return callback(error);
                                callback(null, resultsBadge);
                            });
                        });
                    })

                });

        }

    }


    getNewestDiscussions(userId, threadId, limit, skipNumber, callback) { //NEW
        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!logged) {
            Tdiscussion.aggregate([
                { $match: { thread: ObjectId(threadId) } },
                {
                    $project: {
                        user: 1,
                        discussion: 1,
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
                Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 } }, (error, results) => {
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
                        { $match: { thread: ObjectId(threadId), user: { $nin: usersFlag } } },
                        {
                            $project: {
                                user: 1,
                                discussion: 1,
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
                        Tdiscussion.populate(discussions, { "path": "user", "select": { "bio":1, "createdAt": 1, 'followingNumber': 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 } }, (error, results) => {
                            if (error) return callback(error);
                            Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                                if (error) return callback(error);
                                callback(null, resultsBadge);
                            });
                        });
                    })
                })

        }


        ///


    }

    getDiscussions(userId, threadId, limit, skipNumber, callback) { //HOT

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }


        if (!logged) {

            Tdiscussion.aggregate([
                { $match: { thread: ObjectId(threadId) } },
                {
                    $project: {
                        user: 1,
                        discussion: 1,
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
                                        { $multiply: [{ $size: "$answers" }, 0.1] }
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
                Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1 } }, (error, results) => {
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
                        { $match: { thread: ObjectId(threadId), user: { $nin: usersFlag } } },
                        {
                            $project: {
                                user: 1,
                                discussion: 1,
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
                                                { $multiply: [{ $size: "$answers" }, 0.1] }
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
                        Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1,"createdAt": 1, "followersNumber": 1, "followingNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1 } }, (error, results) => {
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

    postDiscussion(userDb, playerIds, threadUser, opinion, threadId, userId, callback) {

        Thread.findById(threadId, (err, thread) => {
            if (err) return callback(err);
            if (!thread) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            thread.replies += 1;
            thread.save((err, thread) => {
                if (err) return callback(err);

                var discussion = new Tdiscussion();
                discussion.user = userId;
                discussion.thread = threadId;
                discussion.threadUser = threadUser;
                discussion.discussion = opinion[0].toUpperCase() + opinion.slice(1); //Upper;;
                let discussionContent = discussion.discussion;


                if (process.env.SHADOW.split(' ').indexOf(userDb.username) > -1) {
                    discussion.user = userDb;
                    return callback(null, discussion);
                } 


            
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

                            let discussionUser = user.username;
                            user.totalPoints += 5;
                            if (user.badge.nextBadge) {
                                if (user.totalPoints >= user.badge.nextPoints) {
                                    user.badge = user.badge.nextBadge;
                                }
                            }
                            user.save((err) => {
                                if (err) return callback(err);
                                User.findById(threadUser)
                                    .populate('badge')
                                    .exec((err, user) => {
                                        if (err) return callback(err);
                                        if (!user) {
                                            var err = new Error("Not Found");
                                            err.status = 404;
                                            return callback(err);
                                        }

                                        //rechazar de usuarios bloqueados

                                        if (user.usersBlocked.map(u => u.toString()).indexOf(userId.toString()) > -1) {
                                            var err = new Error("Error");
                                            err.status = 404;
                                            return callback(err);
                                        }



                                        if (threadUser != userId) {

                                            user.totalPoints += 1;
                                            if (user.badge.nextBadge) {
                                                if (user.totalPoints >= user.badge.nextPoints) {
                                                    user.badge = user.badge.nextBadge;
                                                }


                                            }
                                        }
                                        let notification = {
                                            user: userId,
                                            notification: discussion,
                                            thread: threadId,
                                            threadTitle: thread.title,
                                            typeOf: "comment",
                                            timeline: discussion

                                        };

                                      
                                        notification.timeline.answers = undefined;
                                        //notification.notification.answers = undefined;
                                        if (user.notis.length > 15) user.notis.splice(14);
                                        if (threadUser != userId) user.notis.unshift(notification);
                                        user.save((err, user) => {
                                            if (err) return callback(err);
                                            Tdiscussion.populate(discussion, { "path": "user", "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 } }, (error, result) => {
                                                Badge.populate(result, { "path": "user.badge" }, (error, resultsBadge) => {
                                                    if (error) return callback(error);

                                                    if (Array.isArray(playerIds)) {
                                                        if (playerIds.length == 0) return callback(null, resultsBadge);
                                                    }
                                                    //Post notification
                                                    let title = discussionUser + ' commented in ' + '"' + thread.title + '"';
                                                    let body = discussionContent;
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
                                                            "timelineId": discussion.id.toString(),
                                                            "threadId": thread._id.toString(),
                                                            "cr": "1"

                                                        }
                                                    };
                                                    // Send a message to the device corresponding to the provided
                                                    // registration token.
                                                    if (threadUser != userId) agenda.now('user notification', { playerIds: playerIds, notification: message });

                                                    // Post notification

                                                    callback(null, resultsBadge);
                                                });

                                            });
                                        })
                                    })
                            })
                        })
                });










            })
        })

    }

    //Respuestas a threads (no respuestas a discusiones)

    /* getThreadPostsNotifications(limit, skip, userId, callback) {
        Tdiscussion.aggregate([
            {$match: { $and: [ { user: { $ne: ObjectId(userId) } }, { threadUser: ObjectId(userId) } ] }},
            {$sort: {date: 1 }}, //para acomodar notificaciones hasta arriba
            {$skip: skip}, 
            {$limit: limit}
        ], (err, discussions) => {
            console.log(discussions)
            if (err) return callback(err);    
            Thread.populate(discussions, { "path": "discussion.thread" , "select": { 'title': 1}}, (error, results) => {
                if(error) return callback(error);
                User.populate(results, [{"path": "discussion.answers.user", "select": { 'username': 1, 'fullName': 1, 'profilePicture': 1}},{ "path": "discussion.game.awayTeam" , "model": "Team", "select": { 'abbreviation': 1}}, {"path": "discussion.game.homeTeam", "model": "Team", "select": {'abbreviation': 1}}], 
                                            (error, discussionsPopulated) => {
                                                if(error) return callback(error);
                                                callback(null, discussionsPopulated);
                                            });  
            }); 
        })
 
    } */

    //Respuestas a discusiones (no respuestas a threads)
    getThreadNotifications(limit, skip, userId, callback) {
        Tdiscussion.aggregate([
            { $match: { "answers.responding": ObjectId(userId) } },
            { $unwind: "$answers" },
            { $match: { "answers.responding": ObjectId(userId) } },
            {
                $project: {
                    "answers.date": 1,
                    thread: 1,
                    "answers.user": 1,
                    "answers.replyText": 1,
                    "answers.discussion": 1,
                    "answers.responding": 1,
                    "answers.likers": 1,
                    "answers.dislikers": 1,
                    "answers._id": 1,
                    "answers.inReplyTo": 1,
                    "date": "$answers.date",

                }
            },

            { $sort: { date: -1 } }, //para acomodar notificaciones hasta arriba

            { $skip: skip },
            { $limit: limit }
        ], (err, discussions) => {

            if (err) return callback(err);
            Thread.populate(discussions, { "path": "thread", "select": { 'title': 1 } }, (error, results) => {
                if (error) return callback(error);
                User.populate(results, [{ "path": "answers.user", "select": { 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1 } }, { "path": "game.awayTeam", "model": "Team", "select": { 'abbreviation': 1 } }, { "path": "game.homeTeam", "model": "Team", "select": { 'abbreviation': 1 } }],
                    (error, discussionsPopulated) => {
                        if (error) return callback(error);
                        callback(null, discussionsPopulated);
                    });
            });
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
                .populate("answers.user", { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 })
                .populate({ 'path': 'answers.responding', "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'totalPoints': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "_id": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } })
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
                        .populate("answers.user", { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 })
                        .populate({ 'path': 'answers.responding', "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'totalPoints': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "_id": 1, "coverPhoto": 1 }, "populate": { 'path': 'badge' } })
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

    postAnswer(userDb, playerIds, answer, userId, discussionId, callback) {

        Tdiscussion.findById(discussionId)
            .populate('answers')
            .exec((err, discussion) => {
                if (err) return callback(err);
                if (!discussion) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }


                //por si borra la respuesta antes de mandar reply

                if (answer.aId) {
                    if (!discussion.answers.id(answer.aId)) {
                        var err = new Error("Not Found");
                        err.status = 404;
                        return callback(err);
                    }

                    if (userDb.usersBlockedBy.map(u => u.toString()).indexOf(discussion.answers.id(answer.aId).user.toString()) > -1) {
                        var err = new Error("Error");
                        err.status = 404;
                        return callback(err);
                    }
                } else {
                    if (userDb.usersBlockedBy.map(u => u.toString()).indexOf(discussion.user.toString()) > -1) {
                        var err = new Error("Error");
                        err.status = 404;
                        return callback(err);
                    }
                }

                answer.response = answer.response[0].toUpperCase() + answer.response.slice(1); //Upper;

                let content = answer.response;
                let threadId = answer.threadId;
                let responding = answer.aId ? discussion.answers.id(answer.aId).user : discussion.user;
                let inReplyTo = answer.aId ? answer.aId : discussion._id;
                var newAnswer = {
                    user: userId,
                    discussion: answer.response,
                    responding: responding, //User
                    likers: [],
                    dislikers: [],
                    inReplyTo: inReplyTo,
                    date: new Date(),
                    replyText: answer.replyText,
                    parent: answer.parent, //para ui de app
                    replyType: answer.aId ? "answer" : "discussion"
                }

            
                discussion.answers.push(newAnswer);

                if (process.env.SHADOW.split(' ').indexOf(userDb.username) > -1) {
                    newAnswer.user = userDb;
                    return callback(null, newAnswer);
                } 


                let timeline = discussion;
                discussion.save((err, discussionSaved) => {
                    if (err) return callback(err);
                    Thread.findById(threadId, (err, thread) => {
                        if (err) return callback(err);
                        if (!thread) {
                            var err = new Error("Not Found");
                            err.status = 404;
                            return callback(err);
                        }
                        thread.replies += 1;
                        thread.save((err, thread) => {
                            if (err) return callback(err);

                            //Puntos para el usuario del thread
                            User.findById(thread.user)
                                .populate('badge')
                                .exec((err, userT) => {
                                    if (err) return callback(err);
                                    if (!userT) {
                                        var err = new Error("Not Found");
                                        err.status = 404;
                                        return callback(err);
                                    }
                                    userT.points += 1;
                                    userT.totalPoints += 1;
                                    if (userT.badge.nextBadge) {
                                        if (userT.totalPoints >= userT.badge.nextPoints) {
                                            userT.badge = userT.badge.nextBadge;
                                        }

                                    }
                                    userT.save((err) => {
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
                                                                thread: threadId,
                                                                replyText: answer.replyText,
                                                                typeOf: "mention",
                                                                parent: answer.parent,
                                                                replyType: answer.aId ? "answer" : "discussion",
                                                                timeline: timeline,
                                                                timelineUser: timeline.user
                                                            };
                                                            notification.timeline.user = timeline.user;
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
                                                                        icon: 'ic_stat_notify',
                                                                    },
                                                                    data: {
                                                                        "timelineId": timeline._id.toString(),
                                                                        "answerId": lastUserAnswer._id.toString(),
                                                                        "threadId": threadId.toString(),
                                                                        "cr": "1"


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

                })


            })
    }





    addLike(discussionOrAnswer, discussionId, username, answerId, callback) {

        Tdiscussion.findById(discussionId, (err, discussion) => {

            if (err) return callback(err);
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
            }
            discussion.save((error, discussionSaved) => {
                if (error) return callback(error);
                callback(null, discussionSaved);
            })
        })
    }

    deleteLike(discussionOrAnswer, discussionId, username, answerId, callback) {
        Tdiscussion.findById(discussionId, (err, discussion) => {
            if (err) return callback(err);
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
                if (error) return callback(error);
                callback(null, discussionSaved);
            })
        })

    }




}

module.exports = new ThreadDiscussionRepository();

