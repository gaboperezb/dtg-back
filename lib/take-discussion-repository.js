const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Types.ObjectId,
    Tdiscussion = require('../models/thread-discussion'),
    User = require('../models/user'),
    Badge = require('../models/badge'),
    Take = require('../models/take'),
    agenda = require('./agenda');
gameRepo = require('./game-repository');

class TakeDiscussionRepository {



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
                        Take.findById(body.takeId, (err, take) => {
                            if (err) return callback(err);
                            if (!take) return callback(null, false);
                            take.replies -= 1;
                            take.save((err, take) => {
                                if (err) return callback(err);


                                //Usuario del take
                                User.findById(take.user)
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
                        Take.findById(body.takeId, (err, take) => {
                            if (err) return callback(err);
                            take.replies -= (discussion.answers.length + 1);
                            take.save((err, take) => {
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
                                            User.findById(take.user)
                                                .populate('badge')
                                                .exec((err, user) => {
                                                    if (err) return callback(err);
                                                    if (!user) {
                                                        var err = new Error("Not Found");
                                                        err.status = 404;
                                                        return callback(err);
                                                    }
                                                    if (userId != take.user) {

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
                let takeId = answer.takeId;
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

                if (process.env.SHADOW.split(' ').indexOf(userDb.username) > -1) {
                    newAnswer.user = userDb;
                    return callback(null, newAnswer);
                } 

                discussion.answers.push(newAnswer);

                let timeline = discussion;
                discussion.save((err, discussionSaved) => {
                    if (err) return callback(err);
                    Take.findById(takeId, (err, take) => {
                        if (err) return callback(err);
                        if (!take) {
                            var err = new Error("Not Found");
                            err.status = 404;
                            return callback(err);
                        }
                        take.replies += 1;
                        take.save((err, take) => {
                            if (err) return callback(err);

                            //Puntos para el usuario del take
                            User.findById(take.user)
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
                                                                take: takeId,
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
                                                                        "takeId": takeId.toString(),
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


    deleteCommentFromMyTake(isAdmin, userId, body, callback) {

        Tdiscussion.findById(body.dId, (err, discussion) => {
            if (err) return callback(err);
            if (!discussion) return callback(null, false);

            Take.findById(body.takeId, (err, take) => {
                if (err) return callback(err);
                if (!take) return callback(null, false);

                if (take.user.toString() == userId || isAdmin || discussion.user.toString() == userId) {

                    discussion.remove((err) => {
                        if (err) return callback(err);

                        take.replies -= (discussion.answers.length + 1);
                        take.save((err, take) => {
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
                                        User.findById(take.user)
                                            .populate('badge')
                                            .exec((err, user) => {
                                                if (err) return callback(err);
                                                if (!user) {
                                                    var err = new Error("Not Found");
                                                    err.status = 404;
                                                    return callback(err);
                                                }
                                                if (userId != take.user) {

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

    postDiscussion(userDb, playerIds, takeUser, opinion, takeId, userId, callback) {

        Take.findById(takeId, (err, take) => {
            if (err) return callback(err);
            if (!take) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            take.replies += 1;
            take.save((err, take) => {
                if (err) return callback(err);

                var discussion = new Tdiscussion();
                discussion.user = userId;
                discussion.take = takeId;
                discussion.takeUser = takeUser;
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
                                User.findById(takeUser)
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



                                        if (takeUser != userId) {

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
                                            take: takeId,
                                            takeTitle: take.take,
                                            typeOf: "comment",
                                            timeline: discussion

                                        };

                                        notification.timeline.answers = undefined;
                                        //notification.notification.answers = undefined;
                                        if (user.notis.length > 15) user.notis.splice(14);
                                        if (takeUser != userId) user.notis.unshift(notification);
                                        user.save((err, user) => {
                                            if (err) return callback(err);
                                            Tdiscussion.populate(discussion, { "path": "user", "select": { "bio": 1,"createdAt": 1, 'followingNumber': 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "_id": 1, "badge": 1, "coverPhoto": 1, "totalPoints": 1, "playerIds": 1, "coverPhoto": 1 } }, (error, result) => {
                                                Badge.populate(result, { "path": "user.badge" }, (error, resultsBadge) => {
                                                    if (error) return callback(error);

                                                    if (Array.isArray(playerIds)) {
                                                        if (playerIds.length == 0) return callback(null, resultsBadge);
                                                    }
                                                    //Post notification
                                                    let title = discussionUser + ' commented in ' + '"' + take.take + '"';
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
                                                            "takeId": take._id.toString(),
                                                            "cr": "1"

                                                        }
                                                    };
                                                    // Send a message to the device corresponding to the provided
                                                    // registration token.
                                                    if (takeUser != userId) agenda.now('user notification', { playerIds: playerIds, notification: message });

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

    getTopDiscussions(userId, takeId, limit, skipNumber, callback) { // TOP

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!logged) {

            Tdiscussion.aggregate([
                { $match: { take: ObjectId(takeId) } },
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
                        { $match: { take: ObjectId(takeId), user: { $nin: usersFlag } } },
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

    getNewestDiscussions(userId, takeId, limit, skipNumber, callback) { //NEW
        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!logged) {
            Tdiscussion.aggregate([
                { $match: { take: ObjectId(takeId) } },
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
                        { $match: { take: ObjectId(takeId), user: { $nin: usersFlag } } },
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

    getDiscussions(userId, takeId, limit, skipNumber, callback) { //HOT

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }


        if (!logged) {

            Tdiscussion.aggregate([
                { $match: { take: ObjectId(takeId) } },
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
                        { $match: { take: ObjectId(takeId), user: { $nin: usersFlag } } },
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


}

module.exports = new TakeDiscussionRepository();

