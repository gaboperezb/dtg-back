const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Types.ObjectId,
    Tdiscussion = require('../models/thread-discussion'),
    Bookmark = require('../models/bookmark'),
    Team = require('../models/team'),
    User = require('../models/user'),
    Badge = require('../models/badge'),
    Game = require('../models/game'),
    Take = require('../models/take'),
    agenda = require('./agenda');

class TakeRepository {


    getBookmarks(userId, limit, skip, callback) {
        console.log('jo')
        Bookmark.find({ user: userId, take: { $exists: true } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('take')
            .exec((err, bookmarks) => {
                if (err) return callback(err)
                let takes = bookmarks.map(b => b.take).filter(t => !!t);
        
                Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);
                    callback(null, results);
                });


            })
    }


    addToBookmarks(takeId, userId, callback) {

        let bookmark = {
            user: userId,
            take: takeId
        }

        Take.findById(takeId, { bookmarks: 1 })
            .exec((err, take) => {
                if (err) return callback(null, false);
                if (!take) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(null, false);
                }
                if (take.bookmarks.some(u => u == userId.toString())) return callback(null, true);
                take.bookmarks.push(userId);
                take.save((err, take) => {
                    if (err) return callback(null, false);

                    Bookmark.create(bookmark, (err, bookmark) => {
                        if (err) return callback(null, false);
                        callback(null, true);
                    })

                })
            })
    }

    deleteBookmark(takeId, userId, callback) {

        Take.findById(takeId, { bookmarks: 1 })
            .exec((err, take) => {
                if (err) return callback(null, false);
                if (!take) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(null, false);
                }
                const index = take.bookmarks.indexOf(userId);
                if (index > -1) {
                    take.bookmarks.splice(index, 1);
                }
                take.save((err, take) => {
                    if (err) return callback(null, false);
                    Bookmark.deleteOne({ user: userId, take: takeId }, (err, bookmark) => {
                        if (err) return callback(null, false);
                        callback(null, true)

                    })
                })
            })
    }

    boost(takeId, user, likes, callback) {

        Take.findById(takeId)
            .exec((err, take) => {
                if (err) return err;
                if (!take) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }

                for (let index = 0; index < likes; index++) {
                    take.likers.push(user);
                }

                take.save((error) => {
                    if (error) callback(error);
                    callback(null, true);
                })

            })
    }

    editTake(takeId, take, callback) {

        Take.findByIdAndUpdate(takeId, take)
            .exec((err, take) => {
                if (err) return callback(err);
                callback(null, take);
            })

    }

    deleteTake(isAdmin, userId, body, callback) {

        Take.findById(body.takeId, (err, take) => {
            if (err) return callback(err);
            if (!take) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }
            if (take.user.toString() == userId || isAdmin) {
                take.remove((err, take) => {
                    if (err) return callback(err);
                    Tdiscussion.remove({ 'take': body.takeId }, (err, discussions) => {
                        if (err) return callback(err);
                        User.findById(take.user)
                            .populate('badge')
                            .exec((err, user) => {
                                if (err) return callback(err);
                                user.totalPoints -= 5;
                                if (user.badge.previousBadge) {
                                    if (user.totalPoints < user.badge.previousPoints) {
                                        user.badge = user.badge.previousBadge;
                                    }

                                }
                                user.save((err) => {
                                    if (err) return callback(err);
                                    Bookmark.deleteMany({take: body.takeId }, (err, bookmarks) => {
                                        if (err) return callback(null, false);
                                        callback(null, true)
                                    })
                                 
                                })

                            })
                    })
                })

            } else {


            }
        })
    }

    getTeamTakes(userId, team, limit, skip, callback) {

        User.findById(userId, { usersBlocked: 1, usersBlockedBy: 1, username: 1, favAllTeams: 1 })
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

                if (team == "All") {

                    Take.aggregate([
                        { $match: { date: { $gte: new Date(Date.now() - 3.888e+9) }, teams: { $in: user.favAllTeams }, user: { $nin: usersFlag } } },

                        {
                            $addFields:
                                { likesCount: { $size: "$likers" } }
                        },
                        { $sort: { ranking: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                    ], (err, takes) => {


                        Take.populate(takes, { path: 'user', select: { "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                            if (error) {

                                return callback(error);
                            }

                            callback(null, results);
                        });
                    })

                } else {

                    Take.aggregate([
                        { $match: { date: { $gte: new Date(Date.now() - 3.888e+9) }, teams: ObjectId(team), user: { $nin: usersFlag } } },
                        {
                            $project: {
                                'userViews': 0
                            }
                        },
                        {
                            $addFields:
                                { likesCount: { $size: "$likers" } }
                        },
                        { $sort: { ranking: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                    ], (err, takes) => {
                        if (err) return callback(err);
                        Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                            if (error) return callback(error);
                            callback(null, results);
                        });
                    })

                }
            })


    }

    getOtherUserTakes(skip, userId, league, leagues, callback) { //user page

        if (league == 'TOP') {
            Take.find({ user: userId, league: { $in: leagues } })
                .sort({ date: -1 })
                .skip(skip)
                .limit(10)
                .exec((err, takes) => {
                    if (err) return callback(err);
                    callback(null, takes);

                })
        } else {
            Take.find({ user: userId, league: league })
                .sort({ date: -1 })
                .skip(skip)
                .limit(10)
                .exec((err, takes) => {
                    if (err) return callback(err);
                    callback(null, takes);

                })
        }

    }

    getUserTakes(limit, skip, userId, callback) { //HOT


        Take.aggregate([
            { user: userId },
            { $sort: { date: -1 } },
            { $skip: skip },
            { $limit: limit },
        ], (err, takes) => {
            if (err) {

                return callback(err);
            }
            callback(takes)
        })
    }

    postVote(id, vote, userId, callback) {
        Take.findById(id, (err, take) => {
            if (err) return callback(err);
            if (!take) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            if (!take.votes.some(voter => voter.user === userId)) {
                if (take.pollValues.some(option => option == vote.option)) {
                    take.votes.push(vote);
                }
            }
            take.save((err, take) => {
                if (err) return callback(err);
                callback(null, take);
            })
        })
    }


    postTake(username, body, userId, callback) {

        if (body.take.length <= 300) {

            let now = new Date();
            let nowEast = new Date((now.getTime() - 1000 * 60 * 60 * 8) + 1000 * 60 * 60 * 25); //Hasta las 3 am de east cuaenta como un día
            let month = ('0' + (nowEast.getMonth() + 1)).slice(-2);
            let day = ('0' + (nowEast.getDate() + 1)).slice(-2);
            body.groupDate = `${nowEast.getFullYear()}${month}${day}`
            body.user = userId;
            body.take = body.take[0].toUpperCase() + body.take.slice(1); //Upper

            if(body.urlTitle) {
                body.urlTitle = body.urlTitle == "JavaScript is not available." ? body.urlDescription : body.urlTitle;
            }

            if (body.pollValues) {
                for (var index = 0; index < body.pollValues.length; index++) {
                    var element = body.pollValues[index];
                    body.pollValues[index] = element[0].toUpperCase() + element.slice(1); //Upper
                }
                body.pollValues = Array.from(new Set(body.pollValues));
                if (body.pollValues.length == 1) {
                    return callback(null, null, "Duplicate Values");
                }
            }

            //if (process.env.SHADOW.split(' ').indexOf(username) > -1) return callback(null, body);
            Take.create(body, (err, take) => {
                if (err) return callback(err);
                User.findById(userId)
                    .populate('badge')
                    .exec((err, user) => {
                        if (err) return callback(err);

                        user.totalPoints += 5;
                        if (user.badge.nextBadge) {
                            if (user.totalPoints >= user.badge.nextPoints) {
                                user.badge = user.badge.nextBadge;
                            }

                        }
                        user.save((err) => {
                            if (err) return callback(err);
                        })
                        return callback(null, take);
                    })


            })


        } else {
            callback(null, null, "Invalid take");
        }
    }

    getTakes(userId, league, leagues, limit, skip, callback) { //HOT

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }


        if (!logged) {
            if (league == "TOP") {
                if (!leagues.includes("General")) {
                    leagues.push('General')
                }
                Take.aggregate([
                    { $match: { date: { $gte: new Date(Date.now() - 6.048e+8) }, league: { $in: leagues } } },
                    {
                        $addFields:
                            { likesCount: { $size: "$likers" } }
                    },
                    { $sort: { ranking: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                ], (err, takes) => {
                    if (err) return callback(err);
                    Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                        if (error) return callback(error);
                        callback(null, results);
                    });
                })

            } else {
                Take.aggregate([
                    { $match: { date: { $gte: new Date(Date.now() - 2.419e+9) }, league: league } },

                    {
                        $addFields:
                            { likesCount: { $size: "$likers" } }
                    },
                    { $sort: { ranking: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                ], (err, takes) => {
                    if (err) return callback(err);
                    Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                        if (error) return callback(error);
                        callback(null, results);
                    });
                })

            }

        } else {

            User.findById(userId, { usersBlocked: 1, usersBlockedBy: 1, username: 1 })
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

                    if (league == "TOP") {
                        if (!leagues.includes("General")) {
                            leagues.push('General')
                        }
                        Take.aggregate([
                            { $match: { date: { $gte: new Date(Date.now() - 6.048e+8) }, league: { $in: leagues }, user: { $nin: usersFlag } } },

                            {
                                $addFields:
                                    { likesCount: { $size: "$likers" } }
                            },
                            { $sort: { ranking: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ], (err, takes) => {
                            if (err) {

                                return callback(err);
                            }

                            Take.populate(takes, { path: 'user', select: { "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                if (error) {

                                    return callback(error);
                                }

                                callback(null, results);
                            });
                        })

                    } else {

                        Take.aggregate([
                            { $match: { date: { $gte: new Date(Date.now() - 2.419e+9) }, league: league, user: { $nin: usersFlag } } },
                            {
                                $project: {
                                    'userViews': 0
                                }
                            },
                            {
                                $addFields:
                                    { likesCount: { $size: "$likers" } }
                            },
                            { $sort: { ranking: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ], (err, takes) => {
                            if (err) return callback(err);
                            Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                if (error) return callback(error);
                                callback(null, results);
                            });
                        })

                    }
                })
        }

    }

    getNewestTakes(userId, leagues, league, limit, skip, callback) { //NEW

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!logged) {

            if (league == "TOP") {
                if (!leagues.includes("General")) {
                    leagues.push('General')
                }
                Take.aggregate([
                    { $match: { date: { $gte: new Date(Date.now() - 2.419e+9) }, league: { $in: leagues } } },

                    {
                        $addFields:
                            { likesCount: { $size: "$likers" } }
                    },
                    { $sort: { date: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                ], (err, takes) => {
                    if (err) return callback(err);
                    Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                        if (error) return callback(error);
                        callback(null, results);
                    });
                })

            } else {
                Take.aggregate([
                    { $match: { date: { $gte: new Date(Date.now() - 2.419e+9) }, league: league } },

                    {
                        $addFields:
                            { likesCount: { $size: "$likers" } }
                    },
                    { $sort: { date: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                ], (err, takes) => {
                    if (err) return callback(err);


                    Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                        if (error) return callback(error);
                        callback(null, results);


                    });
                })

            }

        } else {

            User.findById(userId, { usersBlocked: 1, usersBlockedBy: 1 })
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

                    if (league == "TOP") {
                        if (!leagues.includes("General")) {
                            leagues.push('General')
                        }
                        Take.aggregate([
                            { $match: { date: { $gte: new Date(Date.now() - 6.048e+8) }, league: { $in: leagues }, user: { $nin: usersFlag } } },
                            { $sort: { date: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ], (err, takes) => {
                            if (err) return callback(err);
                            Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                if (error) return callback(error);
                                callback(null, results);
                            });
                        })

                    } else {

                        Take.aggregate([
                            { $match: { date: { $gte: new Date(Date.now() - 2.419e+9) }, league: league, user: { $nin: usersFlag } } },

                            {
                                $addFields:
                                    { likesCount: { $size: "$likers" } }
                            },
                            { $sort: { date: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ], (err, takes) => {
                            if (err) return callback(err);
                            Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                if (error) return callback(error);
                                callback(null, results);
                            });
                        })

                    }
                })
        }

    }

    addLike(takeId, user, callback) {

        Take.findById(takeId, (err, take) => {
            if (err) return callback(err);
            if (!take) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            if (!take.likers.some(liker => liker === user)) {
                take.likers.push(user);

                User.findById(take.user)
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


            take.save((error, takeSaved) => {
                if (error) callback(error);
                callback(null, takeSaved);
            })
        })
    }

    deleteLike(takeId, user, callback) {
        Take.findById(takeId, (err, take) => {
            if (err) callback(err);
            if (!take) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            if (take.likers.some(liker => liker === user)) {
                take.likers = take.likers.filter(liker => liker !== user);
                User.findById(take.user)
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


            take.save((error, takeSaved) => {
                if (error) callback(err);
                callback(null, takeSaved);
            })
        })
    }

    getFollowingTakes(user, league, leagues, limit, skip, callback) { //HOT

        if (league == "TOP") {
            if (!leagues.includes("General")) {
                leagues.push('General')
            }
            Take.aggregate([
                { $match: { date: { $gte: new Date(Date.now() - 1.814e+9) }, user: { $in: user.following }, league: { $in: leagues } } },
                {
                    $addFields:
                        { likesCount: { $size: "$likers" } }
                },
                { $sort: { date: -1 } },
                { $skip: skip },
                { $limit: limit },
            ], (err, takes) => {
                if (err) return callback(err);
                Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);

                    callback(null, results);
                });
            })

        } else {
            Take.aggregate([
                { $match: { date: { $gte: new Date(Date.now() - 1.814e+9) }, user: { $in: user.following }, league: league, } },
                {
                    $addFields:
                        { likesCount: { $size: "$likers" } }
                },
                { $sort: { date: -1 } },
                { $skip: skip },
                { $limit: limit },
            ], (err, takes) => {
                if (err) return callback(err);

                Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);
                    callback(null, results);

                });
            })
        }
    }


    getTopTakes(userId, leagues, league, limit, skip, callback) { //TOP 24 hrs

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!logged) {
            if (league == "TOP") {
                if (!leagues.includes("General")) {
                    leagues.push('General')
                }
                Take.find({ date: { $gte: new Date() - 8.64e+7 }, league: { $in: leagues } }, { userViews: 0 })
                    .sort({ rankingTop: -1 })
                    .skip(skip)
                    .limit(limit)
                    .exec((err, takes) => {
                        if (err) return callback(err);
                        Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                            if (error) return callback(error);
                            callback(null, results);
                        });
                    })
            } else {
                Take.find({ date: { $gte: new Date() - 8.64e+7 }, league: league }, { userViews: 0 })
                    .sort({ rankingTop: -1 })
                    .skip(skip)
                    .limit(limit)
                    .exec((err, takes) => {
                        if (err) return callback(err);
                        Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                            if (error) return callback(error);
                            callback(null, results);
                        });
                    })
            }

        } else {

            User.findById(userId, { usersBlocked: 1, usersBlockedBy: 1 })
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

                    if (league == "TOP") {
                        if (!leagues.includes("General")) {
                            leagues.push('General')
                        }
                        Take.find({ date: { $gte: new Date() - 8.64e+7 }, league: { $in: leagues }, user: { $nin: usersFlag } }, { userViews: 0 })
                            .sort({ rankingTop: -1 })
                            .skip(skip)
                            .limit(limit)
                            .exec((err, takes) => {
                                if (err) return callback(err);
                                Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                    if (error) return callback(error);
                                    callback(null, results);
                                });
                            })
                    } else {
                        Take.find({ date: { $gte: new Date() - 8.64e+7 }, league: league, user: { $nin: usersFlag } }, { userViews: 0 })
                            .sort({ rankingTop: -1 })
                            .skip(skip)
                            .limit(limit)
                            .exec((err, takes) => {
                                if (err) return callback(err);
                                Take.populate(takes, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                    if (error) return callback(error);
                                    callback(null, results);
                                });
                            })
                    }

                })

        }


    }

    getTake(id, callback) {

        Take.findById(id)
            .populate('user', { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 })
            .exec((err, take) => {
                if (err) return callback(err);
                if (!take) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);

                } else {
                    take.likesCount = take.likers.length;
                    take.save((err, take) => {
                        if (err) return callback(err);
                        Badge.populate(take, { "path": "user.badge" }, (error, resultsBadge) => {
                            if (error) return callback(error);
                            callback(null, resultsBadge);
                        });
                    })
                }


            })

    }




}

module.exports = new TakeRepository();

