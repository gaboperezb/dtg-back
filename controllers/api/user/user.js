const userRepo = require('../../../lib/user-repository'),
    discussionRepo = require('../../../lib/discussion-repository'),
    threadsRepo = require('../../../lib/thread-repository'),
    takeRepo = require('../../../lib/take-repository'),
    threadsDiscussionsRepo = require('../../../lib/thread-discussion-repository'),
    aws = require('aws-sdk'),
    User = require('../../../models/user'),
    mid = require('../../../middleware/index'),
    async = require('async'),
    passport = require('passport'),
    rateLimit = require("../../../lib/rates/create-account"),
    ipBanned = ["73.31.243.43","99.203.64.154","174.244.210.74","24.126.250.245","24.209.193.130","99.203.72.174","174.255.68.28","99.203.73.222","174.193.15.131","172.4.5.41","172.58.111.195","174.200.6.41","98.1.64.188","174.224.128.131","71.58.20.53", "47.148.164.116", "98.14.220.67", "174.200.37.179", "167.71.248.251", "108.11.28.106", "174.200.6.26", "107.77.203.59", "65.32.76.4", "107.77.203.83", "47.61.82.125", "67.84.186.35"],
    jwt = require('jsonwebtoken');


var requireAuth = passport.authenticate('jwt', { session: false }),
    requireLogin = passport.authenticate('local', { session: false });


class UserController {

    constructor(router, io) {
        this.io = io;

        router.route('/auth/facebook')
            .post(passport.authenticate('facebook-token', { session: false }), this.fbsuccess.bind(this))
        router.get("/notifications", requireAuth, this.getNotifications.bind(this));

        router.put("/follow/:id", requireAuth, this.follow.bind(this));
        router.put("/unfollow/:id", requireAuth, this.unfollow.bind(this));
        router.get("/resume", requireAuth, this.resumeNotifications.bind(this));
        router.get("/notis", requireAuth, this.getNotis.bind(this));
        router.get("/profile", requireAuth, this.getProfile.bind(this));
        router.put("/chat-last-message", requireAuth, this.lastMessage.bind(this)); //añadir ultimo mensage de chat para determinar unreadmessages (rooms)
        router.get("/user-fcm/:id", requireAuth, this.getUserFcm.bind(this)); //notificaciones de follow
        router.get("/user-fcm-username/:id", this.getUserFcmUsername.bind(this)); //notificaciones de follow
        router.get("/followers/:user", requireAuth, this.getFollowers.bind(this));
        router.get("/following/:user", requireAuth, this.getFollowing.bind(this));
        router.get("/search/:searchTerm", requireAuth, this.searchUsers.bind(this));
        router.get("/search-logged-out/:searchTerm", this.searchUsersLoggedOut.bind(this));
        router.get("/trivias", requireAuth, this.getTrivias.bind(this));
        router.get("/other-user-takes", this.getOtherUserTakes.bind(this)); //De los demás usuarios v3
        router.get("/other-user-threads", this.getOtherUserThreads.bind(this)); //De los demás usuarios v3
        router.get("/user-profile", this.getUserProfile.bind(this)); //De los demás usuarios
        router.get("/takes",requireAuth ,this.getTakes.bind(this)); 
        router.get("/user-trivias", this.getUserTrivias.bind(this)); //De los demás usuarios
        router.get("/thread-notifications", requireAuth, this.getThreadNotifications.bind(this));
        router.post("/signup",this.signup.bind(this));
        router.post("/time-spent", requireAuth, this.saveTimeSpent.bind(this));
        router.post("/save-version-number", requireAuth, this.saveVersionNumber.bind(this));
        router.post("/save-leagues", requireAuth, this.saveLeagues.bind(this));
        router.post("/save-fcm", requireAuth, this.saveFcmToken.bind(this));
        router.post("/edit", requireAuth, this.editProfile.bind(this));
        router.delete("/file/:fileName", requireAuth, this.deleteFile.bind(this));
        router.delete("/files/:fileName/:fileNameThumbnail", requireAuth, this.deleteFiles.bind(this));
        router.post("/change-password", requireAuth, this.changePassword.bind(this));
        router.get("/session", requireAuth, this.isLoggedIn.bind(this));
        router.post("/login", requireLogin, this.login.bind(this));
        router.get("/discussions", requireAuth, this.getUserDiscussions.bind(this));
        router.get("/answers", requireAuth, this.getUserAnswers.bind(this));
        router.get("/sign-s3", requireAuth, this.signS3AWS.bind(this));
        router.post("/log-out", requireAuth, this.logOut.bind(this));
        router.post('/forgot', this.forgot.bind(this));
        router.get("/reset/:token", this.reset.bind(this));
        router.post("/reset/:token", this.postReset.bind(this));
        router.put("/allow-dms", requireAuth, this.allowDMS.bind(this));
        router.put("/clear-notifications", requireAuth, this.clearNotifications.bind(this));
        router.put("/clear-one-notification", requireAuth, this.clearOneNotification.bind(this));
        router.put("/clear-thread-notifications", requireAuth, this.clearThreadNotifications.bind(this));
        router.post("/report", requireAuth, this.reportUser.bind(this));
        router.post("/block", requireAuth, this.blockUser.bind(this));
        router.post("/unblock", requireAuth, this.unblockUser.bind(this));

        //threads
        router.get("/threads", requireAuth, this.getUserThreads.bind(this));
        router.get("/thread-discussions", requireAuth, this.getUserThreadDiscussions.bind(this));
        router.get("/thread-answers", requireAuth, this.getUserThreadAnswers.bind(this));

    }


    //FACEBOOK

    getClientIp(req){
        var ipAddress = req.headers['x-forwarded-for'];
      if (!ipAddress) {
          return '';
        }
      // convert from "::ffff:192.0.0.1"  to "192.0.0.1"
        if (ipAddress.substr(0, 7) == "::ffff:") {
          ipAddress = ipAddress.substr(7)
        }
      return ipAddress;
      };

    generateToken(user) {
        return jwt.sign(user, "speedygonzales", {
            expiresIn: 20
        });
    }

    setUserInfo(user) {
        return {
            username: user.username,
            profilePicture: user.profilePicture,
            profilePictureThumbnail: user.profilePictureThumbnail,
            profilePictureName: user.profilePictureName,
            profilePictureNameThumbnail: user.profilePictureNameThumbnail,
            coverPhoto: user.coverPhoto,
            coverPhotoName: user.coverPhotoName,
            leagues: user.leagues,
            rooms: user.rooms,
            blocked: user.blocked,
            blockedReason: user.blockedReason,
            notifications: user.notifications,
            totalPoints: user.totalPoints,
            isAdmin: null,
            createdAt: user.createdAt,
            favAllTeams: user.favAllTeams,
            favMainTeams: user.favMainTeams,
            badge: user.badge,
            dailyTrivias: user.dailyTrivias,
            verified: user.verified,
            versionNumber: user.versionNumber,
            following: user.following,
            followingNumber: user.followingNumber,
            followersNumber: user.followersNumber,
            playerIds: user.playerIds,
            bio: user.bio,
            dmsOpen: user.dmsOpen,
            timeSpent: user.timeSpent,
            usersBlocked: user.usersBlocked,
            _id: user._id
        };
    }

    setUserInfoForAdmin(user) {
        return {
            username: user.username,
            profilePicture: user.profilePicture,
            profilePictureThumbnail: user.profilePictureThumbnail,
            profilePictureName: user.profilePictureName,
            createdAt: user.createdAt,
            profilePictureNameThumbnail: user.profilePictureNameThumbnail,
            coverPhoto: user.coverPhoto,
            coverPhotoName: user.coverPhotoName,
            favAllTeams: user.favAllTeams,
            rooms: user.rooms,
            dailyTrivias: user.dailyTrivias,
            favMainTeams: user.favMainTeams,
            leagues: user.leagues,
            dmsOpen: user.dmsOpen,
            blocked: user.blocked,
            blockedReason: user.blockedReason,
            notifications: user.notifications,
            totalPoints: user.totalPoints,
            isAdmin: true,
            badge: user.badge,
            versionNumber: user.versionNumber,
            following: user.following,
            bio: user.bio,
            followingNumber: user.followingNumber,
            followersNumber: user.followersNumber,
            usersBlocked: user.usersBlocked,
            playerIds: user.playerIds,
            timeSpent: user.timeSpent,
            _id: user._id
        };
    }


    fbsuccess(req, res, next) {

        if (!req.user) {
            return res.send(401, 'User Not Authenticated');
        }

        var str = req.user;
        if (typeof str != 'object') {
            var n = str.search("[Message]");
            if (n != -1) return res.json({ error: req.user, user: null });
        }

        if (typeof str != 'object') {
            var n = str.search("[NOT]");
            if (n != -1) return res.json({ error: "You havn't register with us.", user: null });
        }

        let user = req.user;


        var userFiltered = {
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            profilePictureName: user.profilePictureName,
            isAdmin: null,
            totalPoints: user.totalPoints,
            notifications: user.notifications,
            badge: user.badge,
            leagues: user.leagues,
            _id: user._id
        };

        res.json({ error: null, user: userFiltered });
    }

    lastMessage(req, res, next) {
        
        let userId = req.user._id;
        let chat = req.body.chat;
        let lastMessage = req.body.lastMessage;
      

        userRepo.lastMessage(userId, chat, lastMessage, (err, succeeded) => {
            if (err) return next(err);
            res.json({});
        })

    }

    reportUser(req, res, next) {

        let userReporting = req.user._id;
        let userReported = req.body.user;
        let reason = req.body.reason;
        let chat = req.body.chat;

        let data = {
            userReporting,
            userReported,
            reason,
            chat
        }

        userRepo.reportUser(data, (err, succeeded) => {
            if (err) return next(err);
            res.json({});
        })
    }

    blockUser(req, res, next) {

        let blockedBy = req.user._id;
        let userBlocked = req.body.user;
 
        userRepo.blockUser(blockedBy, userBlocked, (err, succeeded) => {
            if (err) return next(err);
            res.json({});
        })
    }

    allowDMS(req, res, next) {

        userRepo.allowDMS(req.user, (err, succeeded) => {
            if (err) return next(err);
            res.json({succeeded});
        })
    }

    unblockUser(req, res, next) {

        let unblockedBy = req.user._id;
        let userUnblocked = req.body.user;
 
        userRepo.unblockUser(unblockedBy, userUnblocked, (err, succeeded) => {
            if (err) return next(err);
            res.json({});
        })
    }


    searchUsers(req, res, next) {


        let searchTerm = req.params.searchTerm.toLowerCase();
        let skip = +req.query.skip;
        let user = req.user;
        var usersFlag = user.usersBlockedBy;
        userRepo.searchUsers(usersFlag, searchTerm, skip, (err, users) => {
            if (err) return next(err);
            res.json(users);
        })

    }

    searchUsersLoggedOut(req, res, next) {

        let searchTerm = req.params.searchTerm.toLowerCase();
        let skip = +req.query.skip;
        userRepo.searchUsersLoggedOut(searchTerm, skip, (err, users) => {
            if (err) return next(err);
            res.json(users);
        })

    }

    getUserFcm(req, res, next) {
        let userId = req.params.id;
        userRepo.getUserProfile(userId, (err, user) => {
            if (err) return next(err);
            res.json(user);
        })
    }

    getUserFcmUsername(req, res, next) {
        let userId = req.params.id;
        userRepo.getUserProfileUsername(userId, (err, user) => {
            if (err) return next(err);
            res.json(user);
        })
    }

    follow(req, res, next) {

        let userId = req.params.id;
        userRepo.follow(userId, req.user, (err, user) => {
            if (err) return next(err);
            res.json({});
        })

    }

    unfollow(req, res, next) {

        let userId = req.params.id;
        userRepo.unfollow(userId, req.user, (err, user) => {
            if (err) return next(err);
            res.json({});
        })
    }

    saveTimeSpent(req, res, next) {

        if(req.user.username == 'discussthegame') {
            console.log('hola')
            return res.json({});
        }
        userRepo.saveTimeSpent(req.user, req.body, (err, data) => {
            if (err) return next(err);
            res.json(data);
        })
    }

    saveVersionNumber(req, res, next) {

        userRepo.saveVersionNumber(req.user, req.body, (err, data) => {
            if (err) return next(err);
            res.json(data);
        })
    }

    getFollowers(req, res, next) {

        let skip = +req.query.skip;
        let user = req.params.user;
        userRepo.getFollowers(skip, user, (err, followers) => {
            if (err) return next(err);
            res.json({followers});
        })
    }

    getFollowing(req, res, next) {

        let skip = +req.query.skip;
        let user = req.params.user;
        userRepo.getFollowing(skip, user, (err, following) => {
            if (err) return next(err);
            res.json({following});
        })
    }

    
    getProfile(req, res, next) {

        let skip = +req.query.skip;
        userRepo.getProfile(skip, req.user._id, (err, user) => {
            if (err) return next(err);
            res.json(user);
        })
    }

    getTrivias(req, res, next) {

        let skip = +req.query.skip;
        userRepo.getTrivias(skip, req.user._id, (err, user) => {
            if (err) return next(err);
            res.json(user.trivias);
        })
    }

    getUserTrivias(req, res, next) {
        
        let skip = +req.query.skip;
        let user = req.query.user;
        userRepo.getTrivias(skip, user, (err, user) => {
            if (err) return next(err);
            res.json(user.trivias);
        })

    }

    getUserProfile(req, res, next) {
        
        let skip = +req.query.skip;
        let user = req.query.user;
        userRepo.getProfile(skip, user, (err, user) => {
            if (err) return next(err);
            res.json(user.threads);
        })

    }

    getOtherUserThreads(req, res, next) {
        let skip = +req.query.skip;
        let user = req.query.user;
        let league = req.query.league;
        let leaguesForTop;
        if(req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }
        threadsRepo.getOtherUserThreads(skip, user, league, leaguesForTop, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })
    }

    getOtherUserTakes(req, res, next) {
        let skip = +req.query.skip;
        let user = req.query.user;
        let league = req.query.league;
        let leaguesForTop;
        if(req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }
        takeRepo.getOtherUserTakes(skip, user, league, leaguesForTop, (err, takes) => {
            if (err) return next(err);
            res.json(takes);
        })
    }

    getUserThreads(req, res, next) {

        let limit = 20;
        let skip = +req.query.skip;

        threadsRepo.getUserThreads(limit, skip, req.user._id, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })


    }

    saveFcmToken(req, res, next) {

        userRepo.saveFcmToken(req.user._id, req.body.playerId, (err, updated) => {
            if (err) return next(err);
            res.json({ updated });
        })

    }

    saveLeagues(req, res, next) {

        if (req.body.leagues) {
            userRepo.saveLeagues(req.body.leagues, req.user, (err, leagues) => {
                if (err) return next(err);
                res.json(leagues);
            })
        }


    }

    getUserThreadDiscussions(req, res, next) {

        let limit = 15; //cambiar en pagina
        let skip = +req.query.skip;

        threadsDiscussionsRepo.getUserThreadDiscussions(limit, skip, req.user._id, (err, discussions) => {
            if (err) return next(err);
            res.json(discussions);
        })


    }

    getUserThreadAnswers(req, res, next) {

        let limit = 15; //cambiar en pagina
        let skip = +req.query.skip;

        threadsDiscussionsRepo.getUserThreadAnswers(limit, skip, req.user._id, (err, answers) => {
            if (err) return next(err);
            res.json(answers);
        })


    }


    clearNotifications(req, res, next) {

        userRepo.clearNotifications(req.user, req.body, (err, success) => {
            if (err) return next(err);
            res.json({ success: success })
        })

    }

    clearOneNotification(req, res, next) {
        userRepo.clearOneNotification(req.user._id, (err, success) => {
            if (err) return next(err);
            res.json({ success: success })
        })

    }

    clearThreadNotifications(req, res, next) {
        userRepo.clearThreadNotifications(req.user._id, (err, success) => {
            if (err) return next(err);
            res.json({ success: success })
        })

    }

    getNotifications(req, res, next) {
        let limit = 30;
        let skip = +req.query.skip;

        discussionRepo.getNotifications(limit, skip, req.user._id, (err, answers) => {
            if (err) return next(err);
            res.json(answers);
        })

    }

    resumeNotifications(req, res, next) {

        let userInfo;

        if (req.user.role === "admin") {
            userInfo = this.setUserInfoForAdmin(req.user);
        } else {
            userInfo = this.setUserInfo(req.user);
        }

        userInfo.blockedReason = userInfo.blockedReason ? userInfo.blockedReason : null;
        res.json(userInfo);

    }

    getThreadNotifications(req, res, next) {
        let limit = 30;
        let skip = +req.query.skip;

        threadsDiscussionsRepo.getThreadNotifications(limit, skip, req.user._id, (err, answers) => {
            if (err) return next(err);
            res.json(answers);
        })

    }

    //When link on email is clicked
    reset(req, res, next) {
        let token = req.params.token;
        
        userRepo.reset(token, (err, errorMessage, status) => {
            if (err) return next(err);
            if (errorMessage) return res.json({ errorMessage: errorMessage, status: false });
            res.json({ errorMessage: errorMessage, status: status });
        })
    }

    //Change password



    postReset(req, res, next) {

        let token = req.params.token;
        if (req.body.password === req.body.confirmPassword) {
            userRepo.postReset(req.body, token, (err, errorMessage, successMessage, user) => {
                if (err) return next(err);
                if (errorMessage) return res.json({ error: errorMessage, successMessage: null, user: null })

                var userFiltered = this.setUserInfo(user);
                res.json({ error: null, successMessage: successMessage, user: userFiltered })

            })

        } else {
            let error = "Passwords don't match."
            res.json({ error: error, successMessage: null, user: null })

        }

    }

    forgot(req, res, next) {
        let host = req.headers.host;
        
        userRepo.forgot(req.body, host, (err, errorMessage, successMessage) => {
            if (err) return next(err);
            if (errorMessage) return res.json({ errorMessage: errorMessage, successMessage: null });

            res.json({ errorMessage: null, successMessage: successMessage });

        })

    }


    logOut(req, res, next) {



        let id = req.user._id;
        let playerId = req.body.playerId;

        userRepo.logOut(id, playerId, (err, success) => {
            if (err) return next(err);
            res.json({ success: success });
        })


    }

    getTakes(req, res, next) {
        let limit = 15;
        let skip = +req.query.skip;

        userRepo.getTakes(limit, skip, req.user._id, (err, takes) => {
            if (err) return next(err);
            res.json(takes);
        })
    }

    getUserTakes(req, res, next) { //other user
        let limit = 15;
        let skip = +req.query.skip;
        let userId = req.query.userId;

        userRepo.getTakes(limit, skip, userId, (err, takes) => {
            if (err) return next(err);
            res.json(takes);
        })
    }


    getUserDiscussions(req, res, next) {
        let limit = 20;
        let skip = +req.query.skip;

        discussionRepo.getUserDiscussions(limit, skip, req.user._id, (err, discussions) => {
            if (err) return next(err);
            res.json(discussions);
        })
    }

    getUserAnswers(req, res, next) {
        let limit = 20;
        let skip = +req.query.skip;
        discussionRepo.getUserAnswers(limit, skip, req.user._id, (err, answers) => {
            if (err) return next(err);
            res.json(answers);
        })
    }


    isLoggedIn(req, res, next) {

        var user = req.user;
        var userInfo;

        if (user.role === "admin") {
            userInfo = this.setUserInfoForAdmin(req.user);
        } else {
            userInfo = this.setUserInfo(req.user);
        }
        res.status(200).json({
            status: true,
            user: userInfo
        });

    }

    login(req, res, next) {


       
        if(ipBanned.some(ip => ip == this.getClientIp(req))) {
            let error = "You have been blocked from discussthegame";
            return res.json({ error: error, user: null });
        }

        var userInfo;
        var str = req.user;
        if (typeof str != 'object') {
            var n = str.search("[Info]");
            if (n != -1) return res.json({ error: req.user, user: null });
        }
        if (req.user.role === "admin") {
            userInfo = this.setUserInfoForAdmin(req.user);
        } else {
            userInfo = this.setUserInfo(req.user);
        }
    
        let token = {
            username: userInfo.username,
            _id: userInfo._id
        }
        
        if (!req.user.blocked) {
            res.status(200).json({
                token: 'JWT ' + this.generateToken(token),
                user: userInfo
            })

        } else {

            res.status(200).json({
                blocked: req.user.blocked,
                blockedReason: req.user.blockedReason
            })

        }
    }

    signup(req, res, next) {

        if (req.body.username &&
            req.body.email &&
            req.body.password &&
            req.body.confirmPassword) {

                
            if(ipBanned.some(ip => ip == this.getClientIp(req))) {
                let error = "You have been blocked from discussthegame";
                return res.json({ error: error, user: null });
            }

            if(req.body.username.trim().search(/(^nba$|^nfl$|^nhl$|^mlb$)/i) != -1) {
                let error = "Are you" + req.body.username.toUpperCase() + "? Please contact us at support@discussthegame.com";
                return res.json({ error: error, user: null });
            }
            
            if (req.body.password !== req.body.confirmPassword) {
                let error = "Passwords don't match";
                return res.json({ error: error, user: null });
            }

            if(req.body.username.search(/(amino|hardwood|discussthegame|dtg)/i) != -1) {
                let error = "Invalid username. Please choose another one.";
                return res.json({ error: error, user: null });
            }

            if (!req.body.email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
                let error = "Invalid email";
                return res.json({ error: error, user: null });
            
            }

            if (req.body.password.length < 6) {
                let error = "Password is less than 6 characters";
                return res.json({ error: error, user: null });
            }

            if (req.body.username.length > 20) {
                let error = "Username is too long";
                return res.json({ error: error, user: null });
            }

            var userInfo;
            req.body.email = req.body.email.replace(/\s/g, '');

            req.body.ipAddress = this.getClientIp(req);
            
            userRepo.signup(req.body, (err, errorMessage, user) => {
                if (err) return next(err);
                if (errorMessage) return res.json({ error: errorMessage, user: null });
                if (req.body.email == process.env.ADMIN_EMAIL && req.body.password == process.env.ADMIN_PWD) {
                    userInfo = this.setUserInfoForAdmin(user);
                } else {
                    userInfo = this.setUserInfo(user);
                }
                let token = {
                    username: userInfo.username,
                    _id: userInfo._id
                }
                res.json({
                    token: 'JWT ' + this.generateToken(token),
                    user: userInfo
                })

            })
        } else {
            let error = "One or more fields are missing";
            res.json({ error: error, user: null });

        }

    }

    getNotis(req, res, next) {
        userRepo.getNotifications(req.user._id, (err, user) => {
            if (err) return next(err);
            res.json(user.notis);
        })

    }

    editProfile(req, res, next) {
        userRepo.edit(req.body, req.user._id, (err, errorMessage, user) => {
            if (err) return next(err);
            if (errorMessage) return res.json({ error: errorMessage, user: null })
            let userInfo = this.setUserInfo(user);
            res.json({ error: null, user: userInfo });
        })

    }

    changePassword(req, res, next) {
        if (req.body.newPassword !== req.body.confirmPassword) {
            var err = new Error("Passwords don't match");
            err.status = 400;
            return next(err);

        }
        if (req.body.newPassword.length < 6) {
            var err = new Error("Password is less than 6 characters");
            err.status = 400;
            return next(err);
        }

        let userId = req.user._id;
        userRepo.changePassword(req.body, userId, (err, errorMessage, user) => {
            if (err) return next(err);
            if (errorMessage) return res.json({ passwordChanged: false, errMessage: errorMessage })
            res.json({ passwordChanged: true });

        })
    }



    deleteFiles(req, res, next) {

        var params = {
            Bucket: process.env.S3_BUCKET,
            Delete: {
                Objects: [
                    {
                        Key: 'users/' + req.params.fileName

                    },
                    {
                        Key: 'users/' + req.params.fileNameThumbnail

                    }
                ]
            }
        };


        const s3 = new aws.S3();

        s3.deleteObjects(params, function (err, data) {
            if (err) return next(err);

            res.json({ deleted: true });
        });
    }


    deleteFile(req, res, next) {


        const s3 = new aws.S3();
        const s3Params = {
            Bucket: process.env.S3_BUCKET,
            Key: 'users/' + req.params.fileName
        };

        s3.deleteObject(s3Params, function (err, data) {
            if (err) return next(err);
            res.json({ deleted: true });
        });
    }


    signS3AWS(req, res, next) {
        //Unpload files to S3 AWS
        const s3 = new aws.S3();
        const S3_BUCKET = process.env.S3_BUCKET;
        const fileName = req.query['file-name'];
        const fileType = req.query['file-type'];

        //Empty folder

        const s3Params = {
            Bucket: S3_BUCKET,
            Key: `users/${fileName}`,
            Expires: 60,
            ContentType: fileType,
            ACL: 'public-read'
        };

        s3.getSignedUrl('putObject', s3Params, (err, data) => {
            if (err) {

                return res.end();
            }
            const returnData = {
                signedRequest: data,
                url: `https://${S3_BUCKET}.s3.amazonaws.com/users/${fileName}`
            };



            res.json(returnData);

        });

    }
}

module.exports = UserController;