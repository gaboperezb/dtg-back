const adminRepo = require('../../../lib/admin-repository'),
            playRepo = require('../../../lib/play-repository'),
                mid = require('../../../middleware/index'),
                passport = require('passport'),
                jwt = require('jsonwebtoken');



        var requireAuth = passport.authenticate('jwt', {session: false}),
        requireLogin = passport.authenticate('local', {session: false});

class AdminController {

    constructor(router) {

       
        router.get('/teams', requireAuth, mid.roleAuthorization(['admin']), this.getTeams.bind(this));
        router.post('/teams', requireAuth, mid.roleAuthorization(['admin']), this.postTeam.bind(this));
        router.post('/games', requireAuth, mid.roleAuthorization(['admin']), this.postGame.bind(this));
        router.put('/teams/:id', requireAuth, mid.roleAuthorization(['admin']), this.updateTeam.bind(this));
        router.get('/games', requireAuth, mid.roleAuthorization(['admin']), this.getGames.bind(this));
        router.put('/games/:id', requireAuth, mid.roleAuthorization(['admin']), this.updateGame.bind(this));
        router.get('/badges', requireAuth, mid.roleAuthorization(['admin']), this.getBadges.bind(this));
        router.post('/badges', requireAuth, mid.roleAuthorization(['admin']), this.postBadge.bind(this));
        router.put('/badges/:id', requireAuth, mid.roleAuthorization(['admin']), this.updateBadge.bind(this));
        router.post('/games/i/delete-game', requireAuth, mid.roleAuthorization(['admin']), this.deleteGame.bind(this));
        router.get('/users/:username',  requireAuth, mid.roleAuthorization(['admin']),  this.getUsers.bind(this));
        router.put('/users/:username',  requireAuth, mid.roleAuthorization(['admin']), this.blockUser.bind(this));
        router.get('/reports', requireAuth, mid.roleAuthorization(['admin']), this.getReports.bind(this));
        router.put('/reports/:id',  requireAuth, mid.roleAuthorization(['admin']), this.updateReport.bind(this));
        router.get('/posts/:id', requireAuth, mid.roleAuthorization(['admin']), this.getUserPosts.bind(this));
        router.get('/discussions/:id', requireAuth, mid.roleAuthorization(['admin']), this.getUserDiscussions.bind(this));
        router.get('/replies/:id', requireAuth, mid.roleAuthorization(['admin']), this.getUserReplies.bind(this));

        //Trivias
        router.post('/trivias', requireAuth, mid.roleAuthorization(['admin']), this.postTrivia.bind(this));
        router.get('/trivias', requireAuth, mid.roleAuthorization(['admin']), this.getTrivias.bind(this));
        router.put('/trivias/:id', requireAuth, mid.roleAuthorization(['admin']), this.updateTrivia.bind(this));
        
    
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
            blocked: user.blocked,
            bio: user.bio,
            dailyTrivias: user.dailyTrivias,
            verified: user.verified,
            blockedReason: user.blockedReason,
            notifications: user.notifications,
            totalPoints: user.totalPoints,
            isAdmin: null,
            badge: user.badge,
            versionNumber: user.versionNumber,
            playerIds: user.playerIds,
            timeSpent: user.timeSpent,
            _id: user._id
        };
    }



    getReports(req, res, next) {
       
        adminRepo.getReports((err, reports) => {
            if (err) return next(err);
            res.json(reports);

        })
    }

    getTrivias(req, res, next) {
       
        let skip = +req.query.skip
        adminRepo.getTrivias(skip, (err, trivias) => {
            if (err) return next(err);
            res.json(trivias);

        })
    }

    updateTrivia(req, res, next) {
        
        let triviaId = req.params.id;
        adminRepo.updateTrivia(req.body, triviaId, (err, trivia) => {
            if (err) return next(err);
            res.json(trivia);
        })
    }

    postTrivia(req, res , next) {

        let userId = req.user._id;
        if (req.body.question.length > 120){
            var err = new Error('Question is more than 120 characters');
            err.status = 400;
            return next(err);
        } 

        adminRepo.postTrivia(req.body, userId, (err, trivia) => {
            if (err) return next(err);
            res.json(trivia);
        })
    }

    updateReport(req, res, next) {
       
        let id = req.params.id;
        let data = req.body;
        adminRepo.updateReport(id, data, (err, report) => {
            if (err) return next(err);
            res.json(report);

        })
    }

    getUsers(req, res, next) {
        let username = req.params.username;
        adminRepo.getUsers(username, (err, users) => {
            if (err) return next(err);
            users.map(user => this.setUserInfo(user));
            res.json(users);

        })
    }


    getUserPosts(req, res, next) {

        let user = req.params.id;
        let skip = +req.query.skip;
        adminRepo.getUserPosts(user, skip, (err, posts) => {
            if (err) return next(err);
            res.json(posts);

        })

    }

    getUserDiscussions(req, res, next) {

        let user = req.params.id;
        let skip = +req.query.skip;
        adminRepo.getUserDiscussions(user, skip, (err, discussions) => {
            if (err) return next(err);
            res.json(discussions);

        })

    }

    getUserReplies(req, res, next) {

       

        let user = req.params.id;
        let skip = +req.query.skip;
        adminRepo.getUserReplies(user, skip, (err, discussions) => {
            if (err) return next(err);
            res.json(discussions);

        })

    }

    blockUser(req, res, next) {

        let data  = {
            id: req.params.username, //:username
            reason : req.body.reason
        }
     
        adminRepo.blockUser(data, (err, success) => {
            if (err) return next(err);
            res.json(success);

        })
    }



    postPoll(req, res, next) {

        adminRepo.postPoll(req.body, (err, poll) => {
            if (err) return next(err);
            res.json(poll);

        })

    }



 

    updateBadge(req, res, next) {
        
        let badgeId = req.params.id;
        
        
        adminRepo.updateBadge(req.body, badgeId, (err, badge) => {

            if (err) return next(err);
            res.json(badge);
        })
    }

    postBadge(req, res, next) {

        

        adminRepo.postBadge(req.body, (err, badge) => {
            if (err) return next(err);
            res.json(badge);

        })

    }

    getBadges(req, res, next) {

        adminRepo.getBadges((err, badges) => {
            if (err) return next(err);
            res.json(badges);
        })

    }

    deleteGame(req, res, next) {
        
        let gameId = req.body.gameId;
        adminRepo.deleteGame(gameId, (err, succeded) => {
            if (err) return next(err);
            
            res.json({succeded: succeded});
        })

    }


    getTeams(req, res, next) {

        
        adminRepo.getTeams((err, teams) => {
            if (err) return next(err);
            res.json(teams);
        })

    }

    postTeam(req, res , next) {
        adminRepo.postTeam(req.body, (err, team) => {
            if (err) return next(err);
            res.json(team);
        })
    }

    updateTeam(req, res, next) {
        
        let teamId = req.params.id;
        adminRepo.updateTeam(req.body, teamId, (err, team) => {
            if (err) return next(err);
            res.json({});
        })
    }

    postGame(req, res, next) {
        adminRepo.postGame(req.body, (err, game) => {
            if (err) return next(err);
            res.json(game);

        })


    }

    getGames(req, res, next) {
        let skip = +req.query.skip;
        let league = req.query.league;

        
        adminRepo.getGames(skip, league, (err, games) => {
            if (err) return next(err);
            res.json(games);
        })

    }

    updateGame(req, res, next) {
        
        let gameId = req.params.id;
        adminRepo.updateGame(req.body, gameId, (err, team) => {
            if (err) return next(err);
            res.json({});
        })
    }

    
}

module.exports = AdminController;