const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Types.ObjectId,
    Tdiscussion = require('../models/thread-discussion'),
    User = require('../models/user'),
    Badge = require('../models/badge'),
    Trivia = require('../models/trivia'),
    agenda = require('./agenda');
gameRepo = require('./game-repository');

class PlayDiscussionRepository {

    deleteTriviaAnswer(isAdmin, userId, body, callback) {
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
                }

            } else {

                if (discussion.user.toString() == userId || isAdmin) {
                    discussion.remove((err) => {
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
                }
            }
        })
    }



    deleteTriviaComment(isAdmin, userId, body, callback) {

        Tdiscussion.findById(body.dId, (err, discussion) => {
            if (err) return callback(err);
            if (!discussion) return callback(null, false);

            if (isAdmin || discussion.user.toString() == userId) {

                discussion.remove((err) => {
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


            }




        })


    }

    getTriviaDiscussions(userId, triviaId, limit, skipNumber, callback) { //HOT

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
                    { $match: { trivia: ObjectId(triviaId), user: { $nin: usersFlag } } },
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
                    Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1, "createdAt": 1, "followersNumber": 1, "followingNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1 } }, (error, results) => {
                        if (error) return callback(error);

                        Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                            if (error) return callback(error);
                            callback(null, resultsBadge);

                        });

                    });
                })
            })



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
                let triviaId = answer.triviaId;
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
                    parent: answer.parent,
                    replyType: answer.aId ? "answer" : "discussion"
                }

                /* if (process.env.SHADOW.split(' ').indexOf(userDb.username) > -1) {
                    return callback(null, newAnswer);
                } */

                discussion.answers.push(newAnswer);

                let timeline = discussion;
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
                                            trivia: triviaId,
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
                                                    "triviaId": triviaId.toString(),
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
    }

    getTopDiscussions(userId, triviaId, limit, skipNumber, callback) { // TOP

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
                    { $match: { trivia: ObjectId(triviaId), user: { $nin: usersFlag } } },
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
                    Tdiscussion.populate(discussions, { "path": "user", "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 } }, (error, results) => {
                        if (error) return callback(error);
                        Badge.populate(results, { "path": "user.badge" }, (error, resultsBadge) => {
                            if (error) return callback(error);
                            callback(null, resultsBadge);
                        });
                    });
                })

            });



    }

    getNewestDiscussions(userId, triviaId, limit, skipNumber, callback) { //NEW

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
                    { $match: { trivia: ObjectId(triviaId), user: { $nin: usersFlag } } },
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

    postTriviaDiscussion(userId, opinion, triviaId, callback) {

        Trivia.findById(triviaId, (err, trivia) => {

            if (err) return callback(err);
            if (!trivia) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            var discussion = new Tdiscussion();
            discussion.user = userId;
            discussion.trivia = triviaId;
            discussion.discussion = opinion[0].toUpperCase() + opinion.slice(1); //Upper;;
            /* if (process.env.SHADOW.split(' ').indexOf(userDb.username) > -1) {
                discussion.user = userDb;
                return callback(null, discussion);
            } */
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
                            Tdiscussion.populate(discussion, { "path": "user", "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 } }, (error, result) => {
                                Badge.populate(result, { "path": "user.badge" }, (error, resultsBadge) => {
                                    if (error) return callback(error);
                                    callback(null, resultsBadge);
                                });
                            });

                        })
                    })
            });

        })

    }
}

module.exports = new PlayDiscussionRepository();

