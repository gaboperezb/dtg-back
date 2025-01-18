const chatRepo = require('../../../lib/chat-repository'),
                
                mid = require('../../../middleware/index'),
                rateLimit = require("../../../lib/rates/posts"),
                passport = require('passport');
var requireAuth = passport.authenticate('jwt', {session: false}),
requireLogin = passport.authenticate('local', {session: false});

class ChatController {

    constructor(router) {
        router.get('/', requireAuth, this.getChats.bind(this));
        router.get('/rooms', requireAuth, this.getRooms.bind(this));
        router.post('/', requireAuth, this.createChat.bind(this));
        router.get('/chat/:id', requireAuth, this.getChat.bind(this));
        router.put('/name/:id', requireAuth, this.editChatName.bind(this));
        router.put('/leave/:id', requireAuth, this.leaveChat.bind(this));
        router.put('/mute/:id', requireAuth, this.muteChat.bind(this));
        router.put('/remove/:id', requireAuth, this.removeMember.bind(this));
        router.put('/add/:id', requireAuth, this.addPeopleToChat.bind(this));
        router.put('/markasread/:id', requireAuth, this.markAsRead.bind(this));
        router.post('/check', requireAuth, this.checkChat.bind(this));
        router.post('/messages/:id', requireAuth, this.sendMessage.bind(this));
        router.get('/messages/:id', requireAuth, this.getMessages.bind(this));
    }

    addPeopleToChat(req, res, next) {

        let id = req.params.id;
        chatRepo.addPeopleToChat(req.user, req.body, id, (err, message) => {
            if (err) return next(err); 
            res.json(message);
        })
        
    }

    
    leaveChat(req, res, next) {

        let id = req.params.id;
        chatRepo.leaveChat(req.user, id, (err, message) => {
            if (err) return next(err); 
            res.json(message);
        })
        
    }

    removeMember(req, res, next) {

        let id = req.params.id;
        chatRepo.removeMember(req.user, req.body, id, (err, message) => {
            if (err) return next(err); 
            res.json(message);
        })
        
    }


    muteChat(req, res, next) {

        let id = req.params.id;
        chatRepo.muteChat(req.user, id, (err, chat) => {
            if (err) return next(err); 
            res.json(chat);
        })
        
    }


    editChatName(req, res, next) {

        let id = req.params.id;
        chatRepo.editChatName(req.user, req.body, id, (err, chat) => {
            if (err) return next(err); 
            res.json(chat);
        })
        
    }

  
    getChats(req, res, next) {

        let skip = +req.query.skip;
        chatRepo.getChats(req.user, skip, (err, chats) => {
            if (err) return next(err); 
            res.json(chats);
        })
        
    }


    getRooms(req, res, next) {

        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }

        chatRepo.getRooms(league, leaguesForTop ,skip, (err, chats) => {
            if (err) return next(err); 
            res.json(chats);
        })
        
    }

    getChat(req, res, next) {

        let chat = req.params.id;
        chatRepo.getChat(chat, (err, chat) => {
            if (err) return next(err); 
            res.json(chat);
        })
        
    }

    

    sendMessage(req, res, next) {
        chatRepo.sendMessage(req.user, req.body, (err, message, chat) => {
            if (err) return next(err); 
            
            res.json({message, chat}); //puede ser chat si no se ha creado la conversacion
        })
    }

    getMessages(req, res, next) {
        let chat = req.params.id;
        let skip = +req.query.skip;
        let limit = +req.query.limit;
        chatRepo.getMessages(chat, skip, limit, (err, messages) => {
            if (err) return next(err); 
            res.json(messages);
        })
    }

    markAsRead(req, res, next) {
        let chatId = req.params.id;
        chatRepo.markAsRead(req.user, chatId, (err, chat) => {
            if (err) return next(err); 
            res.json(chat);
        })
    }

    createChat(req, res, next) {

        chatRepo.createChat(req.user, req.body, (err, chat) => {
            if (err) return next(err); 
            res.json(chat);
        })
        
    }

    checkChat(req, res, next) {

        chatRepo.checkChat(req.user, req.body, (err, chat) => {
            if (err) return next(err); 
            res.json(chat);
        })
        
    }

}

module.exports = ChatController;