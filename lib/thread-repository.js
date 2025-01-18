

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Thread = require('../models/thread'),
    Bookmark = require('../models/bookmark'),
    User = require('../models/user'),
    Badge = require('../models/badge'),
    ObjectId = mongoose.Types.ObjectId,
    Curated = require('../models/curated'),
    DailyPoll = require('../models/poll'),
    agenda = require('./agenda'),
    sanitizeHtml = require('sanitize-html'),
    Tdiscussion = require('../models/thread-discussion');


class ThreadRepository {

    getBookmarks(userId, limit, skip, callback) {
        Bookmark.find({ user: userId, thread: { $exists: true } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('thread')
            .exec((err, bookmarks) => {
                if (err) return callback(err)
                let threads = bookmarks.map(b => b.thread).filter(t => !!t);
               
                Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);
                    callback(null, results);
                });


            })
    }


    addToBookmarks(threadId, userId, callback) {


        let bookmark = {
            user: userId,
            thread: threadId
        }


        Thread.findById(threadId, { bookmarks: 1 })
            .exec((err, thread) => {
                if (err) return callback(null, false);
                if (!thread) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(null, false);
                }

                if (thread.bookmarks.some(u => u == userId.toString())) return callback(null, true);
                thread.bookmarks.push(userId);
                thread.save((err, thread) => {
                    if (err) return callback(null, false);

                    Bookmark.create(bookmark, (err, bookmark) => {
                        console.log('finded bookmark')
                        if (err) return callback(null, false);
                        callback(null, true);
                    })

                })
            })
    }

    deleteBookmark(threadId, userId, callback) {

        Thread.findById(threadId, { bookmarks: 1 })
            .exec((err, thread) => {
                if (err) return callback(null, false);
                if (!thread) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(null, false);
                }
                let userIdString = userId.toString();
                const index = thread.bookmarks.indexOf(userIdString);
                if (index > -1) {
                    thread.bookmarks.splice(index, 1);
                }
                thread.save((err, thread) => {
                    if (err) return callback(null, false);
                    Bookmark.deleteOne({ user: userId, thread: threadId }, (err, bookmark) => {
                        if (err) return callback(null, false);
                        callback(null, true);
                    })
                })
            })
    }


    trackViews(threadId, userId, callback) {


        Thread.findById(threadId, { views: 1, userViews: 1 })
            .exec((err, thread) => {

                if (err) return callback(null, false);
                if (!thread) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(null, false);
                }
                thread.views += 1;
                thread.save((err, thread) => {
                    if (err) return callback(null, false);
                    callback(null, true);
                })
            })
    }

    boost(threadId, user, likes, callback) {

        Thread.findById(threadId)
            .exec((err, thread) => {
                if (err) return err;
                if (!thread) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }

                for (let index = 0; index < likes; index++) {
                    thread.likers.push(user);
                }

                thread.save((error) => {
                    if (error) callback(error);
                    callback(null, true);
                })

            })
    }

    editThread(threadId, thread, callback) {

        Thread.findByIdAndUpdate(threadId, thread)
            .exec((err, thread) => {
                if (err) return callback(err);
                callback(null, thread);
            })

    }

    addLike(threadId, user, callback) {

        Thread.findById(threadId, (err, thread) => {
            if (err) return callback(err);
            if (!thread) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            if (!thread.likers.some(liker => liker === user)) {
                thread.likers.push(user);

                User.findById(thread.user)
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


            thread.save((error, threadSaved) => {
                if (error) callback(error);
                callback(null, threadSaved);
            })
        })
    }

    deleteLike(threadId, user, callback) {
        Thread.findById(threadId, (err, thread) => {
            if (err) callback(err);
            if (!thread) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            if (thread.likers.some(liker => liker === user)) {
                thread.likers = thread.likers.filter(liker => liker !== user);
                User.findById(thread.user)
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


            thread.save((error, threadSaved) => {
                if (error) callback(err);
                callback(null, threadSaved);
            })
        })

    }


    postLinkThread(body, userId, callback) {
        if (body.titleL.length <= 120) {

            /* let now = new Date(); 
            let nowGap = new Date(now.getTime() - 1000*60*60*24); */
            /* User.findOne({"_id": userId, $or: [ {'threadDate': {$lt: nowGap}}, { "threadDate": { $exists: false} } ]})
                .exec((err, user) => {
                if (err) return callback(err);
                if (user) { */ //Solamente se puede subir un thread por día

            //Se actualiza el threadDate
            /* user.threadDate = new Date();
            user.save((error, user) => { */
            /* if (error) return callback(err); */

            let now = new Date();
            let nowEast = new Date((now.getTime() - 1000 * 60 * 60 * 8) + 1000 * 60 * 60 * 25); //Hasta las 3 am de east cuaenta como un día
            let month = ('0' + (nowEast.getMonth() + 1)).slice(-2);
            let day = ('0' + (nowEast.getDate() + 1)).slice(-2);
            body.groupDate = `${nowEast.getFullYear()}${month}${day}`
            body.user = userId;
            body.titleL = body.titleL[0].toUpperCase() + body.titleL.slice(1); //Upper


            let thread = {
                title: body.titleL,
                url: body.urlL,
                league: body.leagueL,
                type: "Link",
                source: body.source,
                user: body.user,
                groupDate: body.groupDate,
                picture: body.picture,
                thumbnail: body.thumbnail

            }


            Thread.create(thread, (err, thread) => {
                if (err) return callback(err);
                User.findById(userId)
                    .populate('badge')
                    .exec((err, user) => {
                        if (err) return callback(err);

                        user.totalPoints += 15;
                        user.threads.unshift(thread._id);
                        if (user.badge.nextBadge) {
                            if (user.totalPoints >= user.badge.nextPoints) {
                                user.badge = user.badge.nextBadge;
                            }

                        }
                        user.save((err) => {
                            if (err) return callback(err);
                        })
                        return callback(null, thread);
                    })

            })
            /* }) */

            /* } else {
                callback(null, null, "You can only post one thread per day");
            } */
            /*  }) */

        } else {
            callback(null, null, "Invalid thread");
        }

    }



    postThread(username, body, userId, callback) {

        if (body.title.length <= 120) {

            let now = new Date();
            let nowEast = new Date((now.getTime() - 1000 * 60 * 60 * 8) + 1000 * 60 * 60 * 25); //Hasta las 3 am de east cuaenta como un día
            let month = ('0' + (nowEast.getMonth() + 1)).slice(-2);
            let day = ('0' + (nowEast.getDate() + 1)).slice(-2);
            body.groupDate = `${nowEast.getFullYear()}${month}${day}`
            body.user = userId;
            body.title = body.title[0].toUpperCase() + body.title.slice(1); //Upper
            body.description = body.description[0].toUpperCase() + body.description.slice(1); //Upper

            let clean = sanitizeHtml(body.description, {
                allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
                    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'video', 'img'],
                disallowedTagsMode: 'discard',
                allowedAttributes: {
                    a: ['href', 'name', 'target', 'data-*'],
                    img: ['src'],
                    video: ['src', 'type', 'controls', 'poster'],
                    iframe: ['src'],
                    p: ["style"],
                    div: ["style", "data-*"],
                    h5: ["style"]
                },
                allowedClasses: {
                    '*': ['fr-embedly', 'embedly-card'],
                },
                allowedStyles: {
                    '*': {
                        'text-align': [/^left$/, /^right$/, /^center$/],
                    },
                    "td": {
                        'width': [/^(auto|0)$|^[+-]?[0-9]+.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc)$/],
                    },
                    "th": {
                        'width': [/^(auto|0)$|^[+-]?[0-9]+.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc)$/],
                    }

                },
                selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
                allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
                allowedSchemesByTag: {},
                allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
                allowProtocolRelative: true,
                allowIframeRelativeUrls: true,
                allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com', 'www.instagram.com']
            });
            body.description = clean;
            if (body.abValues) {
                for (var index = 0; index < body.abValues.length; index++) {
                    var element = body.abValues[index];
                    body.abValues[index] = element[0].toUpperCase() + element.slice(1); //Upper
                }
                body.abValues = Array.from(new Set(body.abValues));
            }
            else if (body.pollValues) {
                for (var index = 0; index < body.pollValues.length; index++) {
                    var element = body.pollValues[index];
                    body.pollValues[index] = element[0].toUpperCase() + element.slice(1); //Upper
                }
                body.pollValues = Array.from(new Set(body.pollValues));
                if (body.pollValues.length == 1) {
                    return callback(null, null, "Duplicate Values");
                }
            }

            if (process.env.SHADOW.split(' ').indexOf(username) > -1) return callback(null, body);


            Thread.create(body, (err, thread) => {
                if (err) return callback(err);
                User.findById(userId)
                    .populate('badge')
                    .exec((err, user) => {
                        if (err) return callback(err);

                        user.totalPoints += 30;
                        user.threads.unshift(thread._id);
                        if (user.badge.nextBadge) {
                            if (user.totalPoints >= user.badge.nextPoints) {
                                user.badge = user.badge.nextBadge;
                            }

                        }
                        user.save((err) => {
                            if (err) return callback(err);
                            callback(null, thread);
                        })
                        
                    })
            })
            /*   })

          } else {
              callback(null, null, "You can only post one thread per day");
          } */
            /*  }) */

        } else {
            callback(null, null, "Invalid thread");
        }
    }



    getUserThreads(limit, skip, userId, callback) {
        Thread.find({ user: userId }, { description: false, votes: false })
            .skip(skip)
            .limit(limit)
            .exec((err, threads) => {
                if (err) return callback(err);
                callback(null, threads);

            })
    }

    getThread(id, callback) {

        Thread.findById(id, { userViews: 0 })
            .populate('user', { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 })
            .exec((err, thread) => {
                if (err) return callback(err);
                if (!thread) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);

                } else {

                    thread.likesCount = thread.likers.length;
                    thread.views += 1;
                    thread.save((err, thread) => {
                        if (err) return callback(err);
                        Badge.populate(thread, { "path": "user.badge" }, (error, resultsBadge) => {
                            if (error) return callback(error);
                            callback(null, thread);
                        });
                    })
                }


            })

    }

    getNewestThreads(userId, leagues, league, limit, skip, callback) { //NEW

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
                Thread.aggregate([
                    { $match: { date: { $gte: new Date(Date.now() - 1.21e+9) }, league: { $in: leagues } } },
                    {
                        $project: {
                            'userViews': 0

                        }
                    },
                    {
                        $addFields:
                            { likesCount: { $size: "$likers" } }
                    },
                    { $sort: { date: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                ], (err, threads) => {
                    if (err) return callback(err);
                    Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                        if (error) return callback(error);
                        callback(null, results);
                    });
                })

            } else {
                Thread.aggregate([
                    { $match: { date: { $gte: new Date(Date.now() - 2.419e+9) }, league: league } },
                    {
                        $project: {
                            'userViews': 0
                        }
                    },
                    {
                        $addFields:
                            { likesCount: { $size: "$likers" } }
                    },
                    { $sort: { date: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                ], (err, threads) => {
                    if (err) return callback(err);


                    Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
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
                        Thread.aggregate([
                            { $match: { date: { $gte: new Date(Date.now() - 1.21e+9) }, league: { $in: leagues }, user: { $nin: usersFlag } } },
                            {
                                $project: {
                                    'userViews': 0
                                }
                            },
                            {
                                $addFields:
                                    { likesCount: { $size: "$likers" } }
                            },
                            { $sort: { date: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ], (err, threads) => {
                            if (err) return callback(err);
                            Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                if (error) return callback(error);
                                callback(null, results);
                            });
                        })

                    } else {

                        Thread.aggregate([
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
                            { $sort: { date: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ], (err, threads) => {
                            if (err) return callback(err);
                            Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                if (error) return callback(error);
                                callback(null, results);
                            });
                        })

                    }
                })
        }

    }


    getTopThreads(userId, leagues, league, limit, skip, callback) { //TOP 24 hrs

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
                Thread.find({ date: { $gte: new Date() - 8.64e+7 }, league: { $in: leagues } }, { userViews: 0 })
                    .sort({ rankingTop: -1 })
                    .skip(skip)
                    .limit(limit)
                    .exec((err, threads) => {
                        if (err) return callback(err);
                        Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                            if (error) return callback(error);
                            callback(null, results);
                        });
                    })
            } else {
                Thread.find({ date: { $gte: new Date() - 8.64e+7 }, league: league }, { userViews: 0 })
                    .sort({ rankingTop: -1 })
                    .skip(skip)
                    .limit(limit)
                    .exec((err, threads) => {
                        if (err) return callback(err);
                        Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
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
                        Thread.find({ date: { $gte: new Date() - 8.64e+7 }, league: { $in: leagues }, user: { $nin: usersFlag } }, { userViews: 0 })
                            .sort({ rankingTop: -1 })
                            .skip(skip)
                            .limit(limit)
                            .exec((err, threads) => {
                                if (err) return callback(err);
                                Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                    if (error) return callback(error);
                                    callback(null, results);
                                });
                            })
                    } else {
                        Thread.find({ date: { $gte: new Date() - 8.64e+7 }, league: league, user: { $nin: usersFlag } }, { userViews: 0 })
                            .sort({ rankingTop: -1 })
                            .skip(skip)
                            .limit(limit)
                            .exec((err, threads) => {
                                if (err) return callback(err);
                                Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                    if (error) return callback(error);
                                    callback(null, results);
                                });
                            })
                    }

                })

        }


    }


    getFollowingThreads(user, league, leagues, limit, skip, callback) { //HOT

        if (league == "TOP") {
            if (!leagues.includes("General")) {
                leagues.push('General')
            }
            Thread.aggregate([
                { $match: { date: { $gte: new Date(Date.now() - 1.814e+9) }, user: { $in: user.following }, league: { $in: leagues } } },
                {
                    $project: {
                        'userViews': 0
                    }
                },
                {
                    $addFields:
                        { likesCount: { $size: "$likers" } }
                },
                { $sort: { date: -1 } },
                { $skip: skip },
                { $limit: limit },
            ], (err, threads) => {
                if (err) return callback(err);
                Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);

                    callback(null, results);
                });
            })

        } else {
            Thread.aggregate([
                { $match: { date: { $gte: new Date(Date.now() - 1.814e+9) }, user: { $in: user.following }, league: league, } },
                {
                    $project: {
                        'userViews': 0
                    }
                },
                {
                    $addFields:
                        { likesCount: { $size: "$likers" } }
                },
                { $sort: { date: -1 } },
                { $skip: skip },
                { $limit: limit },
            ], (err, threads) => {
                if (err) return callback(err);

                Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);
                    callback(null, results);

                });
            })
        }
    }

    getOtherUserThreads(skip, userId, league, leagues, callback) { //user page

        if (league == 'TOP') {
            Thread.find({ user: userId, league: { $in: leagues } }, { userViews: false })
                .sort({ date: -1 })
                .skip(skip)
                .limit(15)
                .exec((err, threads) => {
                    if (err) return callback(err);
                    callback(null, threads);

                })
        } else {
            Thread.find({ user: userId, league: league }, { userViews: false })
                .sort({ date: -1 })
                .skip(skip)
                .limit(15)
                .exec((err, threads) => {
                    if (err) return callback(err);
                    callback(null, threads);

                })
        }

    }

    getTeamThreads(userId, team, limit, skip, callback) {

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

                    Thread.aggregate([
                        { $match: { date: { $gte: new Date(Date.now() - 3.888e+9) }, teams: { $in: user.favAllTeams }, user: { $nin: usersFlag } } },
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
                    ], (err, threads) => {


                        Thread.populate(threads, { path: 'user', select: { "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                            if (error) {

                                return callback(error);
                            }

                            callback(null, results);
                        });
                    })

                } else {

                    Thread.aggregate([
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
                    ], (err, threads) => {
                        if (err) return callback(err);
                        Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                            if (error) return callback(error);
                            callback(null, results);
                        });
                    })

                }
            })


    }

    searchThreads(searchTerm, limit, skip, callback) { //TOP 24 hrs

        Thread.find({ $text: { $search: searchTerm } })
            .sort({ ranking: -1 })
            .skip(skip)
            .limit(limit)
            .exec((err, threads) => {
                if (err) return callback(err);
                Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                    if (error) return callback(error);
                    callback(null, results);
                });
            })


    }

    getFeatured(limitDate, userId, league, leagues, limit, skip, callback) {

        let logged;
        if (userId != "0" && userId != null) logged = true;
        else {
            logged = false;
        }

        if (!leagues.length) leagues = ["NBA", "NFL", "Soccer", "MLB", "NHL", "NCAAF", "NCAAB", "NFL Fantasy", "MMA", "Boxing", "Tennis", "Golf", "Motorsports", "General"]
        if (!logged) {
            if (league == "TOP") {
                if (!leagues.includes("General")) {
                    leagues.push('General')
                }

                Thread.aggregate([
                    { $match: { date: { $gte: new Date(Date.now() - limitDate) }, league: { $in: leagues }, featured: true } }, //3 DAYS
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
                ], (err, threads) => {
                    if (err) return callback(err);
                    Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                        if (error) return callback(error);
                        callback(null, results);
                    });
                })

            } else {
                Thread.aggregate([
                    { $match: { date: { $gte: new Date(Date.now() - limitDate) }, league: league, featured: true } },
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
                ], (err, threads) => {
                    if (err) return callback(err);
                    Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
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

                    //BUGH


                    if (league == "TOP") {
                        if (!leagues.includes("General")) {
                            leagues.push('General')
                        }

                        Thread.aggregate([
                            { $match: { date: { $gte: new Date(Date.now() - limitDate) }, league: { $in: leagues }, user: { $nin: usersFlag }, featured: true } },
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
                        ], (err, threads) => {


                            Thread.populate(threads, { path: 'user', select: { "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                if (error) {

                                    return callback(error);
                                }

                                callback(null, results);
                            });
                        })

                    } else {

                        Thread.aggregate([
                            { $match: { date: { $gte: new Date(Date.now() - limitDate) }, league: league, user: { $nin: usersFlag }, featured: true } },
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
                        ], (err, threads) => {
                            if (err) return callback(err);
                            Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                if (error) return callback(error);
                                callback(null, results);
                            });
                        })

                    }
                })
        }

    }



    getThreads(userId, league, leagues, limit, skip, callback) { //HOT

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
                Thread.aggregate([
                    { $match: { date: { $gte: new Date(Date.now() - 1.21e+9) }, league: { $in: leagues } } },
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
                ], (err, threads) => {
                    if (err) return callback(err);
                    Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                        if (error) return callback(error);
                        callback(null, results);
                    });
                })

            } else {
                Thread.aggregate([
                    { $match: { date: { $gte: new Date(Date.now() - 2.419e+9) }, league: league } },
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
                ], (err, threads) => {
                    if (err) return callback(err);
                    Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
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


                        //14 dias
                        Thread.aggregate([
                            { $match: { date: { $gte: new Date(Date.now() - 1.21e+9) }, league: { $in: leagues }, user: { $nin: usersFlag } } },
                            {
                                $project: {
                                    'userViews': 0
                                }
                            },
                            {
                                $addFields: { likesCount: { $size: "$likers" } }
                            },
                            { $sort: { ranking: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ], (err, threads) => {
                            if (err) {
                                return callback(err);
                            }

                            Thread.populate(threads, { path: 'user', select: { "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                if (error) {

                                    return callback(error);
                                }

                                callback(null, results);
                            });
                        })

                    } else {

                        Thread.aggregate([
                            { $match: { date: { $gte: new Date(Date.now() - 2.592e+9) }, league: league, user: { $nin: usersFlag } } },
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
                        ], (err, threads) => {
                            if (err) return callback(err);
                            Thread.populate(threads, { path: 'user', select: { "verified": 1, "bio": 1, "createdAt": 1, "followingNumber": 1, "followersNumber": 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'totalPoints': 1, 'coverPhoto': 1, "_id": 1, "badge": 1, "playerIds": 1 }, populate: { path: 'badge' } }, (error, results) => {
                                if (error) return callback(error);
                                callback(null, results);
                            });
                        })

                    }
                })
        }

    }

    boostVotes(id, userId, numberOfVotes, option, callback) {

        Thread.findById(id, (err, thread) => {
            if (err) return callback(err);
            if (!thread) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            if (option) {

                for (let index = 0; index < numberOfVotes; index++) {
                    let vote = {
                        user: userId,
                        option
                    }
                    thread.votes.push(vote);

                }
                thread.views += numberOfVotes + 2;
            } else {
                for (let index = 0; index < numberOfVotes; index++) {
                    const element = thread.pollValues[Math.floor(Math.random() * thread.pollValues.length)];
                    let vote = {
                        user: userId,
                        option: element
                    }
                    thread.votes.push(vote);
                }
                thread.views += numberOfVotes + 7;
            }



            thread.save((err, thread) => {
                if (err) return callback(err);
                callback(null, thread);
            })
        })
    }

    boostViews(id, views, callback) {

        Thread.findById(id, (err, thread) => {
            if (err) return callback(err);
            if (!thread) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }

            thread.views += views;
            thread.save((err, thread) => {
                if (err) return callback(err);
                callback(null, thread);
            })
        })
    }

    feature(id, callback) {

        Thread.findById(id)
            .exec((err, thread) => {
                if (err) return callback(err);
                if (!thread) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }

                if (thread.featured) thread.featured = false;
                else {
                    thread.featured = true;
                }

                thread.save((err, threadSaved) => {

                    User.findById(thread.user)
                        .populate('badge')
                        .exec((err, user) => {
                            if (err) return callback(err);
                            if (!user) {
                                var err = new Error("Not Found");
                                err.status = 404;
                                return callback(err);
                            }

                            if (thread.featured) {

                                user.totalPoints += 50;
                                if (user.badge.nextBadge) {
                                    if (user.totalPoints >= user.badge.nextPoints) {
                                        user.badge = user.badge.nextBadge;
                                    }
                                }
                                user.featured += 1;

                            } else {
                                user.totalPoints -= 50;
                                if (user.badge.previousBadge) {
                                    if (user.totalPoints < user.badge.previousPoints) {
                                        user.badge = user.badge.previousBadge;
                                    }
                                }

                                user.featured -= 1;
                            }

                            if (err) return callback(err);
                            let reducedText = thread.title.substring(0, 40);
                            if (reducedText.length < thread.title.length) {
                                reducedText = thread.title.substring(0, 40) + "...";
                            } else {
                                reducedText = thread.title;
                            }
                            let body = `Your post "${reducedText}" has been featured`
                            var message = {
                                notification: {
                                    body,
                                    sound: 'default',
                                    icon: 'ic_stat_notify'
                                },
                                data: {
                                    "threadId": thread._id.toString(),
                                    "post": "1"
                                }
                            };
                            if (Array.isArray(user.playerIds)) {
                                if (user.playerIds.length == 0) return callback(null, true);
                            }
                            agenda.now('user notification', { playerIds: user.playerIds, notification: message });
                            callback(null, true);
                        })
                })

            })
    }

    postVote(id, vote, userId, callback) {
        Thread.findById(id, (err, thread) => {
            if (err) return callback(err);
            if (!thread) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }


            if (!thread.votes.some(voter => voter.user === userId)) {
                if (thread.pollValues.some(option => option == vote.option)) {
                    thread.votes.push(vote);
                }

            }

            thread.save((err, thread) => {
                if (err) return callback(err);
                callback(null, thread);
            })
        })
    }


    deleteThread(isAdmin, userId, body, callback) {

        Thread.findById(body.tId, (err, thread) => {
            if (err) return callback(err);
            if (!thread) {
                var err = new Error("Not Found");
                err.status = 404;
                return callback(err);
            }
            if (thread.user.toString() == userId || isAdmin) {
                thread.remove((err, thread) => {
                    if (err) return callback(err);
                    Tdiscussion.remove({ 'thread': body.tId }, (err, discussions) => {
                        if (err) return callback(err);
                        User.findById(thread.user)
                            .populate('badge')
                            .exec((err, user) => {
                                if (err) return callback(err);
                                user.totalPoints -= 10;
                                if (user.badge.previousBadge) {
                                    if (user.totalPoints < user.badge.previousPoints) {
                                        user.badge = user.badge.previousBadge;
                                    }

                                }
                                user.threads = user.threads.filter(thread => thread != body.tId);
                                user.save((err) => {
                                    if (err) return callback(err);
                                    Bookmark.deleteMany({thread: body.tId}, (err, bookmarks) => {
                                        if (err) return callback(null, false);
                                        callback(null, true);
                                    })
                                })

                            })
                    })
                })

            } else {


            }
        })
    }

}



module.exports = new ThreadRepository();

