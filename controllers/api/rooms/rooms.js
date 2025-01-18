const roomRepo = require('../../../lib/room-repository'),
                mid = require('../../../middleware/index'),
                rateLimit = require("../../../lib/rates/posts"),
                passport = require('passport');
var requireAuth = passport.authenticate('jwt', {session: false}),
requireLogin = passport.authenticate('local', {session: false});

class RoomController {

    constructor(router) {
        router.get('/', requireAuth, this.getRooms.bind(this));
        router.get('/league-rooms', requireAuth, this.getLeagueRooms.bind(this));
        router.get('/chats/:id', requireAuth, this.getChats.bind(this));
        router.get('/fans-number', requireAuth, this.getFansNumber.bind(this));
        router.put('/notifications/:id', requireAuth, this.registerForNotifications.bind(this));
        router.get('/top-fans', requireAuth, this.getTopFans.bind(this));
        
    }

    registerForNotifications(req, res, next) {

        
        let room = req.params.id;
        let chat = req.body.chat;
        roomRepo.registerForNotifications(room, chat, req.user._id, (err, succeded) => {
            if (err) return next(err); 
            res.json(succeded);
        })
        
    }


    getTopFans(req, res, next) {

        let team = req.query.team;
        let league = req.query.league;
        let limit = +req.query.limit;
        let skip = +req.query.skip;
        if(team == 'undefined') team = null;

        roomRepo.getTopFans(team, league, limit, skip, (err, users) => {
            if (err) return next(err); 
            res.json(users);
        })
        
    }

    getFansNumber(req, res, next) {

        let team = req.query.team;
        let league = req.query.league;
        if(team == 'undefined') team = null;

        roomRepo.getFansNumber(team, league, (err, number) => {
            if (err) return next(err); 
            res.json(number);
        })
        
    }

    getChats(req, res, next) {

        let room = req.params.id;
        roomRepo.getChats(room, (err, chats) => {
            if (err) return next(err); 
            res.json(chats);
        })
        
    }

    getLeagueRooms(req, res, next) {

        let skip = +req.query.skip;
        roomRepo.getLeagueRooms(req.user, skip, (err, rooms) => {
            if (err) return next(err); 
            res.json(rooms);
        })
        
    }

    getRooms(req, res, next) {

        let skip = +req.query.skip;
        roomRepo.getRooms(req.user, skip, (err, rooms) => {
            if (err) return next(err); 
            res.json(rooms);
        })
        
    }
}

module.exports = RoomController;