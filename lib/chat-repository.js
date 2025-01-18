const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('../models/user'),
    ObjectId = mongoose.Types.ObjectId,
    Message = require('../models/message'),
    agenda = require('./agenda'),
    sanitizeHtml = require('sanitize-html'),
    _ = require('lodash'),
    Chat = require('../models/chat');


class ChatRepository {

    getChats(user, skip, callback) {
        let chats = user.chats.map(chat => chat.chat);
        Chat.find({ _id: { $in: chats } })
            .populate('lastMessage')
            .populate('team')
            .populate({ "path": "members", "select": { 'username': 1, 'profilePicture': 1, 'profilePictureThumbnail': 1, 'connectionStatus': 1, 'lastSeenAt': 1 } })
            .sort({ modified: -1 })
            .skip(skip)
            .limit(20)
            .exec((err, chats) => {
                if (err) {
                    return callback(err);
                }

                callback(null, chats);

            })
    }

    getRooms(league, leagues, skip, callback) {

        let now = new Date();
        let nowGap = new Date(now.getTime() - 1000 * 60 * 60 * 2); //2 horas (faltan leagues)

        if (league == 'TOP') {
            Chat.find({ room: true, roomDate: { $gte: nowGap }, league: { $in: leagues } })
                .populate({ "path": "game", "populate": [{ "path": "awayTeam" }, { "path": "homeTeam" }] })
                .populate({ "path": "members", "select": { 'username': 1, 'profilePicture': 1, 'profilePictureThumbnail': 1 } })
                .skip(skip)
                .limit(20)
                .exec((err, chats) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, chats);

                })

        } else {

            Chat.find({ room: true, roomDate: { $gte: nowGap }, league: league })
                .populate({ "path": "game", "populate": [{ "path": "awayTeam" }, { "path": "homeTeam" }] })
                .populate({ "path": "members", "select": { 'username': 1, 'profilePicture': 1, 'profilePictureThumbnail': 1 } })
                .skip(skip)
                .limit(20)
                .exec((err, chats) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, chats);

                })

        }

    }

    getChat(chat, callback) {
        Chat.findById(chat)
            .populate('lastMessage')
            .populate('team')
            .populate({ "path": "members", "select": { 'username': 1, 'profilePicture': 1, 'profilePictureThumbnail': 1, 'connectionStatus': 1, 'lastSeenAt': 1 } })
            .exec((err, chat) => {
                if (err) {
                    return callback(err);
                }
                callback(null, chat);

            })
    }

    leaveChat(user, chatId, callback) {

        Chat.findById(chatId)
            .exec((err, chat) => {
                if (err) {
                    return callback(err);
                }
                if (!chat) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }


                if (chat.customType != '1-1') {

                    chat.members = chat.members.filter(m => m.toString() != user._id.toString())

                    if (chat.operatorsIds.length == 1 && !!chat.operatorsIds[0] && chat.operatorsIds.some(o => o.toString() == user._id.toString())) chat.operatorsIds = [chat.members[0]];
                    else {
                        
                        chat.operatorsIds = chat.operatorsIds.filter(m => !!m && (m.toString() != user._id.toString()))
                    }

                    let message = {
                        message: user.username + ' has left the chat ',
                        customType: 'operation',
                        user: user._id,
                        chat: chat._id
                    }

                    Message.create(message, (err, message) => {
                        if (err) return callback(err);
                        if (err) callback(err);


                        chat.unreadMessages = chat.unreadMessages.filter(u => u.user.toString() != user._id.toString())
                        chat.unreadMessages.forEach(element => {
                            if (element.user.toString() != user._id.toString()) element.unreadMessageCount += 1;
                            else {
                                element.unreadMessageCount = 0;
                            }
                        });
                        chat.lastMessage = message._id;
                        chat.modified = new Date();
                        chat.size = chat.members.length;

                        chat.save((err, chatSaved) => {

                            //GUARDAR CHAT EN DOCUMUENTO DE USUARIOS
                            User.findById(user._id, { "chats": 1 })
                                .exec((err, user) => {
                                    if (!user) {
                                        var err = new Error("Not Found");
                                        err.status = 404;
                                        return callback(err);
                                    }

                                    if (err) return callback(err);

                                    if (user.chats) {
                                        user.chats = user.chats.filter(chat => chat.chat.toString() != chatId)
                                    }

                                    user.save((err, chatSaved) => {
                                        callback(null, message);
                                    })

                                })

                        })

                    })
                } else {
                    //eliminar CHAT EN DOCUMUENTO DE USUARIOS
                    User.findById(user._id, { "chats": 1 })
                        .exec((err, user) => {
                            if (!user) {
                                var err = new Error("Not Found");
                                err.status = 404;
                                return callback(err);
                            }

                            if (err) return callback(err);
                            if (user.chats) user.chats = user.chats.filter(chat => chat.chat.toString() != chatId)
                            user.save((err, chatSaved) => {
                                callback(null, chat);
                            })

                        })
                }

            })
    }


    removeMember(user, body, chatId, callback) {
        let memberId = body.memberId;
        Chat.findById(chatId)
            .exec((err, chat) => {
                if (err) {
                    return callback(err);
                }
                if (!chat) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }

                chat.members = chat.members.filter(m => m.toString() != memberId)
                let message = {
                    message: user.username + ' has removed ' + body.username,
                    customType: 'operation',
                    user: user._id,
                    chat: chat._id
                }

                Message.create(message, (err, message) => {
                    if (err) return callback(err);
                    if (err) callback(err);


                    chat.unreadMessages = chat.unreadMessages.filter(u => u.user.toString() != memberId)
                    chat.unreadMessages.forEach(element => {
                        if (element.user.toString() != user._id.toString()) element.unreadMessageCount += 1;
                        else {
                            element.unreadMessageCount = 0;
                        }
                    });
                    chat.lastMessage = message._id;
                    chat.modified = new Date();
                    chat.size = chat.members.length;
                    if (chat.public) chat.removed.push(memberId);

                    chat.save((err, chatSaved) => {

                        //GUARDAR CHAT EN DOCUMUENTO DE USUARIOS
                        User.findById(memberId, { "chats": 1 })
                            .exec((err, user) => {
                                if (!user) {
                                    var err = new Error("Not Found");
                                    err.status = 404;
                                    return callback(err);
                                }

                                if (err) return callback(err);
                                user.chats = user.chats.filter(chat => chat.chat.toString() != chatId)
                                user.save((err, chatSaved) => {

                                    callback(null, message);
                                })

                            })

                    })

                })
            })
    }

    addPeopleToChat(user, body, chat, callback) {

        Chat.findById(chat)
            .exec((err, chat) => {
                if (err) {
                    return callback(err);
                }
                if (!chat) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }

                if (chat.members.length + body.members.length > 75) {
                    var err = new Error("Error");
                    err.status = 404;
                    return callback(err);
                }


                if (body.members.length == 0) {
                    var err = new Error("Error");
                    err.status = 404;
                    return callback(err);
                }

                let usernamesArray = body.members.map(member => member.username);
                let idsArray = body.members.map(member => member.id);
                let usernamesString = usernamesArray.join(', ');
                let addedMessage = user.username == usernamesString ? user.username + ' has joined' : user.username + ' has added ' + usernamesString;

                let message = {
                    message: addedMessage,
                    customType: 'operation',
                    user: user._id,
                    chat: chat._id
                }

                Message.create(message, (err, message) => {
                    if (err) return callback(err);
                    if (err) callback(err);

                    //GUARDAR CHAT EN DOCUMUENTO DE USUARIOS

                    User.find({ _id: { $in: idsArray } }, { "chats": 1, "dmsOpen": 1, "following": 1 })
                        .exec((err, users) => {

                            let bulkUpdateOps = [];
                            if (err) return callback(err);
                            users = users.filter(u => typeof u.dmsOpen === 'undefined' || u.dmsOpen || u.following.some(u => u.toString() == user._id.toString()))
                            for (let index = 0; index < users.length; index++) {

                                const element = users[index];
                                if (!chat.members.some(member => member.toString() == element._id.toString())) {
                                    let userChat = {
                                        chat: chat._id
                                    }
                                    bulkUpdateOps.push({
                                        "updateOne": {
                                            "filter": { "_id": element._id },
                                            "update": { "$push": { "chats": userChat } }
                                        }
                                    });
                                }

                            }
                            User.collection.bulkWrite(bulkUpdateOps, { "ordered": true, w: 1 }, (err, result) => {
                                if (err) return callback(err);

                                let prev = users.map(u => u._id);
                                let newIdsArray = prev.filter(user => {
                                    return !chat.members.some(member => member.toString() == user.toString())
                                })

                                if (newIdsArray.length == 0) {
                                    var err = new Error("Duplicate");
                                    err.status = 404;
                                    return callback(err);
                                }

                                let newUnreadMessages = newIdsArray.map(member => {
                                    return {
                                        user: member,
                                        unreadMessageCount: 0,
                                        muted: false
                                    }
                                })

                                chat.unreadMessages.push(...newUnreadMessages)
                                //console.log('perro',chat);
                                chat.unreadMessages.forEach(element => {
                                    
                                    if (element.user.toString() != user._id.toString()) element.unreadMessageCount += 1;
                                    else {
                                        element.unreadMessageCount = 0;
                                    }
                                });
                                chat.lastMessage = message._id;
                                chat.modified = new Date();

                                for (let index = 0; index < newIdsArray.length; index++) {
                                    const element = newIdsArray[index];
                                    if (!chat.members.some(member => member.toString() == element.toString()) && !chat.public) {
                                        chat.members.push(element)
                                    } else if (!chat.members.some(member => member.toString() == element.toString()) && chat.public) {
                                        if (!chat.removed.some(member => member.toString() == element.toString())) {
                                            chat.members.push(element)
                                        }

                                    }

                                }

                                if (chat.members.length > 100) {
                                    var err = new Error("Error");
                                    err.status = 404;
                                    return callback(err);
                                }

                                chat.size = chat.members.length;
                                chat.save((err, chatSaved) => {
                                    callback(null, message);
                                })

                            });
                        })
                })
            })
    }



    muteChat(user, chat, callback) {
        Chat.findById(chat)
            .exec((err, chat) => {
                if (err) {
                    return callback(err);
                }
                for (let index = 0; index < chat.unreadMessages.length; index++) {
                    const element = chat.unreadMessages[index];
                    if (element.user.toString() == user._id.toString()) {
                        element.muted = !element.muted;
                        break;
                    }
                }

                chat.save((err, chatSaved) => {
                    callback(null, chatSaved);
                })

            })
    }

    editChatName(user, data, chat, callback) {

        Chat.findById(chat)
            .exec((err, chat) => {
                if (err) {
                    return callback(err);
                }
                if (!chat || chat.public) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }

                let message = {
                    message: user.username + ' changed the group name from ' + chat.name + ' to ' + data.name,
                    customType: 'operation',
                    user: user._id,
                    chat: chat._id
                }

                Message.create(message, (err, message) => {
                    if (err) return callback(err);
                    if (err) callback(err);

                    chat.unreadMessages.forEach(element => {
                        if (element.user.toString() != user._id.toString()) element.unreadMessageCount += 1;
                        else {
                            element.unreadMessageCount = 0;
                        }
                    });
                    chat.lastMessage = message._id;
                    chat.modified = new Date();
                    chat.name = data.name;
                    chat.save((err, chatSaved) => {
                        callback(null, message);
                    })

                })

            })
    }

    //1-1
    checkChat(user, body, callback) {

        User.find({ _id: { $in: body.members } }, { "chats": 1, "username": 1 })
            .exec((err, users) => {

                if (err) return callback(err);
                let otherUser = users.filter(userr => userr.username != user.username)[0];
                if(otherUser == undefined) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err); //dm yourself bug by clicking your username in chats (tag)
                }
                let ownUser = users.filter(userr => userr.username == user.username)[0];
                let bothFlag = (otherUser.chats.some(chat =>  chat.recipient == ownUser._id.toString()) == false) && (ownUser.chats.some(chat => chat.recipient == otherUser._id.toString()) == false)

                if (bothFlag) callback(null, null)//Chat nuevo
                else {//Checar cual de los dos usuarios no tiene el chat en el documento

                    if (otherUser.chats.some(chat => (chat.recipient == ownUser._id.toString()))) {
                        let chat = otherUser.chats.find(chat => (chat.recipient == ownUser._id.toString())).chat;
                        let userChat = {
                            chat,
                            recipient: otherUser._id.toString()
                        }
                        ownUser.chats.push(userChat);
                        ownUser.save((err, user) => {
                            if (err) return callback(err);
                            Chat.findById(chat)
                                .populate('lastMessage')
                                .populate({ "path": "members", "select": { 'username': 1, 'profilePicture': 1, 'profilePictureThumbnail': 1, 'connectionStatus': 1, 'lastSeenAt': 1 } })
                                .exec((err, chat) => {
                                    if (!chat) {
                                        var err = new Error("Not Found");
                                        err.status = 404;
                                        return callback(err);
                                    }
                                    if (err) return callback(err);
                                    console.log(chat)
                                    let unreadMessageCount = chat.unreadMessages.filter(unread => unread.user.toString() == user._id.toString())[0];
                                    if(unreadMessageCount) {
                                        let unr = unreadMessageCount.unreadMessageCount
                                        chat.unreadMessageCount = unr;
                                    } else {
                                        chat.unreadMessageCount = 0;
                                    }
                                    callback(null, chat)
                                })
                        })
                    } else {
                        let chat = ownUser.chats.find(chat => chat.recipient == otherUser._id.toString()).chat;
                        let userChat = {
                            chat,
                            recipient: ownUser.id.toString()
                        }
                        otherUser.chats.push(userChat);
                        otherUser.save((err, user) => {
                            if (err) return callback(err);
                            Chat.findById(chat)
                                .populate('lastMessage')
                                .populate({ "path": "members", "select": { 'username': 1, 'profilePicture': 1, 'profilePictureThumbnail': 1, 'connectionStatus': 1, 'lastSeenAt': 1 } })
                                .exec((err, chat) => {
                                    if (!chat) {
                                        var err = new Error("Not Found");
                                        err.status = 404;
                                        return callback(err);
                                    }
                                    if (err) return callback(err);
                                    console.log(chat)
                                    let unreadMessageCount = chat.unreadMessages.filter(unread => unread.user.toString() == user._id.toString())[0]

                                    if(unreadMessageCount) {
                                        let unr = unreadMessageCount.unreadMessageCount
                                        chat.unreadMessageCount = unr;
                                    } else {
                                        chat.unreadMessageCount = 0;
                                    }
           
                                    callback(null, chat)
                                })
                        })
                    }
                }
            })
    }


    //GROUPS
    createChat(user, body, callback) {

        body.modified = new Date();
        if (body.members.length > 75) {
            var err = new Error("Error");
            err.status = 404;
            return callback(err);
        }
        body.size = body.members.length;
        Chat.create(body, (err, chat) => {
            if (err) return callback(err);
            User.find({ _id: { $in: body.members } }, { "chats": 1, "dmsOpen": 1, "following": 1 })
                .exec((err, users) => {
                    let bulkUpdateOps = [];
                    if (err) return callback(err);
                    users = users.filter(u => (u._id.toString() == user._id.toString()) || typeof u.dmsOpen === 'undefined' || u.dmsOpen || u.following.some(u => u.toString() == user._id.toString()))
                    for (let index = 0; index < users.length; index++) {
                        const element = users[index];
                        let userChat = {
                            chat: chat._id
                        }
                        bulkUpdateOps.push({
                            "updateOne": {
                                "filter": { "_id": element._id },
                                "update": { "$push": { "chats": userChat } }
                            }
                        });

                    }
                    chat.members = users.map(u => u._id);
                    chat.save((err, chat) => {
                        if (err) return callback(err);
                        User.collection.bulkWrite(bulkUpdateOps, { "ordered": true, w: 1 }, (err, result) => {
                            if (err) return callback(err);
                            callback(null, chat)
                        });
                    })

                })
        })

    }

    markAsRead(user, chat, callback) {

        Chat.findById(chat, { "unreadMessages": 1 })
            .exec((err, chat) => {
                //console.log('perro',chat);
                if (err) return callback(err);
                chat.unreadMessages.forEach(element => {
                    if (element.user.toString() == user._id.toString()) element.unreadMessageCount = 0;
                });
                chat.save((err, chat) => {
                    if (err) return callback(err);
                    callback(null, chat);
                })
            })
    }


    getMessages(chatId, skip, limit, callback) {

        Message.find({ chat: chatId })
            .populate({ 'path': 'take', "select": { 'take': 1, 'picture': 1, 'user': 1 }, "populate": { 'path': 'user', "select": { 'username': 1, 'profilePictureThumbnail': 1 } } })
            .populate({ 'path': 'thread', "select": { 'title': 1, 'picture': 1, 'user': 1 }, "populate": { 'path': 'user', "select": { 'username': 1, 'profilePictureThumbnail': 1 } } })
            .populate({ "path": "user", "select": { 'username': 1, 'profilePictureThumbnail': 1 } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec((err, messages) => {
                if (err) return callback(err);
                callback(null, messages);
            })
    }


    sendMessage(user, body, callback) {

        if (process.env.SHADOW.split(' ').indexOf(user.username) > -1) {
            var err = new Error("Not Found");
            err.status = 404;
            return callback(err);
        } 
        let created = new Date(user.createdAt)
        let now = Date.now()

        let subHours = (now - created) * 2.77778e-7;

        /* if (subHours < 24) { //bots
            var err = new Error("Not Found");
            err.status = 404;
            return callback(err);
        } */
        
        /* let clean = sanitizeHtml(body.message.message, { CORREGIR > < BUG
            allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
                'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'video'],
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
                '*': [ 'fr-embedly', 'embedly-card' ], 
            },
            allowedStyles: {
                '*': {
                  'text-align': [/^left$/, /^right$/, /^center$/],
                }
              },
            selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
            allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
            allowedSchemesByTag: {},
            allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
            allowProtocolRelative: true,
            allowIframeRelativeUrls: true,  
            allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com', 'www.instagram.com']
        }); */
        
    

        if (body.room) {

            let modified = new Date();
            body.message.user = user._id;
            //guardar last mesage en user document

            Chat.findById(body.message.chat)
                .exec((err, chat) => {
                    if (err) return callback(err)
                    if (!chat) {
                        var err = new Error("Not Found");
                        err.status = 404;
                        return callback(err);
                    }
                    Message.create(body.message, (err, message) => {
                        if (err) return callback(err);
                        chat.lastMessage = message._id;
                        chat.modified = modified;
                        chat.save((err, chat) => {
                            if (err) return callback(err);
                            Room.findById(body.roomId)
                                .populate('team')
                                .exec((err, room) => {
                                    if (err) callback(err);
                                    if (!room) {
                                        var err = new Error("Not Found");
                                        err.status = 404;
                                        return callback(err);
                                    }


                                    if(room.lastMessages.length) {
                                        let index = room.lastMessages.findIndex(lm => lm.chat.toString() == chat._id.toString())
                                      
                                        if(index > -1) {
                                            
                                            room.lastMessages[index].lastMessage = message._id
                                        } else {
                                             let lm = {
                                                 chat: chat._id,
                                                 lastMessage: message._id
                                             }
                                            room.lastMessages.push(lm)
                                        }
                                    } else {
                                        let lm = {
                                            chat: chat._id,
                                            lastMessage: message._id
                                        }
                                       room.lastMessages.push(lm)
                                    }

                                    room.save();
                                    if(user.rooms.length) {
                                     
                                        let index = user.rooms.findIndex(room => room.chat.toString() == chat._id.toString())
                                        if(index > -1) {
                                        
                                            user.rooms[index].lastMessage = message._id
                        
                                        } else {
                                            let room = {
                                                chat: chat._id,
                                                lastMessage: message._id
                                            }
                                            user.rooms.push(room);
                                        }
                                        
                                    } else {
                                     
                                        let room = {
                                            chat: chat._id,
                                            lastMessage: message._id
                                        }
                                        user.rooms.push(room);
                                        
                                    }
                                    user.save((err, user) => {
                                    
                                    })
                                   
                                    let roomChatForNotifications = room.notifications.find(n => n.chat.toString() == chat._id.toString());
                                    
                        
                                    if(!roomChatForNotifications) return callback(null, message, null);
                                    
                                    let roomUsers = roomChatForNotifications.users;
                                 
                                    if(!roomUsers.length) return callback(null, message, null);
                                    
                                   
                                    User.find({ _id: { $in: roomUsers } }, { notifications:1, playerIds: 1, connectionStatus: 1, username: 1, notis: 1 })
                                        .exec((err, users) => {
                                            if (err) return callback(err);
                                            if (users.length == 0) {
                                                var err = new Error("Not Found");
                                                err.status = 404;
                                                return callback(err);
                                            }
                                          

                                            let usersOffline = users.filter(member => {
                                                return (member._id.toString() != user._id.toString()) && (!member.connectionStatus || member.connectionStatus == "offline")
                                            })

                                            

                                            if (usersOffline.length == 0) return callback(null, message, null);
                                            let title;
                                            if (room.team) {
                                                title = room.team.teamName + " - " + chat.name
                                            } else {
                                                title = room.league + " - " + chat.name
                                            }
                                            let body = message.message;
                                            var playerIds = usersOffline.map(user => user.playerIds).reduce((acc, val) => acc.concat(val), [])
                                       
                                            
                                            var messageForNoti = {
                                                notification: {
                                                    title,
                                                    body,
                                                    sound: 'default',
                                                    badge: '0',
                                                    icon: 'ic_stat_notify',
                                                },
                                                data: {
                                                    "room": "1",
                                                    "roomId": room._id.toString()
                                                }
                                            };
                                            agenda.now('user notification', { playerIds: playerIds, notification: messageForNoti });

                                            

                                            user.save();

                                            callback(null, message, null);

                                        })
                                })

                        })


                    })

                })





        } else {
            if (body.toUser) { //PRIVATE
                
                if (user.usersBlockedBy.map(u => u.toString()).indexOf(body.toUser) > -1) {
                    return callback(null, null, null);
                }
                //Checar si el usuario tiene aceptada la opcion de recibir mensajes
                User.findById(body.toUser, { dmsOpen: 1, following: 1, chats: 1 })
                    .exec((err, user2) => {
                        if (err) return callback(err);
                        if (typeof user2.dmsOpen !== 'undefined' && !user2.dmsOpen && !user2.following.some(u => u.toString() == user._id.toString())) return callback(null, null, null);


                        //El chat existe
                        let modified = new Date();
                        body.message.user = user._id;

                        if (body.message.chat) {


                            //Si el destinatario borro el chat

                            if (!user2.chats.some(chat => chat.recipient == user._id.toString())) {
                                let userChat = {
                                    chat: body.message.chat,
                                    recipient: user._id.toString()
                                }
                                user2.chats.push(userChat);
                                user2.save((err, user) => {
                                   
                                })
                            }


                            Message.create(body.message, (err, message) => {
                                if (err) return callback(err);
                                Chat.findById(body.message.chat)
                                    .populate({ "path": "members", "select": { 'connectionStatus': 1, 'playerIds': 1, "notifications": 1 } })
                                    .exec((err, chat) => {
                                        if (err) callback(err);
                                        if (!chat) {
                                            var err = new Error("Not Found");
                                            err.status = 404;
                                            return callback(err);
                                        }
                                        chat.unreadMessages.forEach(element => {
                                            if (element.user.toString() != user._id.toString()) element.unreadMessageCount += 1;
                                            else {
                                                element.unreadMessageCount = 0;
                                            }
                                        });
                                        chat.lastMessage = message._id;
                                        chat.modified = modified;
                                        chat.save((err, chatSaved) => {

                                            let unreadMessageCountGrouped = _.chain(chat.unreadMessages).groupBy("user").value();

                                            let title = chat.customType == "1-1" ? `${user.username}` : `${user.username} @ ${chat.name}`;
                                            let body = message.message;
                                            let usersOffline = chat.members.filter(member => {
                                                let key = member._id.toString();
                                                return (!unreadMessageCountGrouped[key][0].muted) && (member._id.toString() != user._id.toString()) && (!member.connectionStatus || member.connectionStatus == "offline")
                                            })

                                            if (usersOffline.length == 0) return callback(null, message, chat);
                                            let usersOfflineMapped = usersOffline.map(member => {
                                                let key = member._id.toString();
                                                return {
                                                    playerIds: member.playerIds,
                                                    notifications: unreadMessageCountGrouped[key][0].unreadMessageCount > 1 ? member.notifications.length.toString() : (member.notifications.length + 1).toString()
                                                }
                                            });

                                            var prevResult = _.chain(usersOfflineMapped).groupBy("notifications").value();
                                            var result = _.chain(prevResult).forEach(function (value, key) {
                                                prevResult[key] = _.map(value, 'playerIds').reduce((acc, val) => acc.concat(val), [])
                                            }).value(); // {"3": [123.., 123..], "4 (for badge)": [123.., 123..]} así queda




                                            for (const key in result) {
                                                if (result.hasOwnProperty(key)) {
                                                    //FCM NOTIFICATION
                                                    var playerIds = result[key];
                                                 
                                                    var messageForNoti = {
                                                        notification: {
                                                            title,
                                                            body,
                                                            sound: 'default',
                                                            badge: key,
                                                            icon: 'ic_stat_notify',
                                                        },
                                                        data: {
                                                            "chat": "1",
                                                            "chatId": chat._id.toString()
                                                        }
                                                    };
                                                    agenda.now('user notification', { playerIds: playerIds, notification: messageForNoti });

                                                }
                                            }

                                            //FCM NOTIFICATION
                                            callback(null, message, chat);
                                        })
                                    })

                            })

                        } else { //No hay un chat, hay que crearlo

                            Chat.create(body.chat, (err, chat) => {
                                if (err) return callback(err);
                                User.find({ _id: { $in: body.chat.members } }, { "chats": 1, "username": 1, "connectionStatus": 1, "playerIds": 1, "notifications": 1 })
                                    .exec((err, users) => {
                                        let bulkUpdateOps = [];
                                        let otherUser = users.filter(userr => userr.username != user.username)[0];
                                        let ownUser = users.filter(userr => userr.username == user.username)[0];
                                        if (err) return callback(err);
                                        for (let index = 0; index < users.length; index++) {
                                            const element = users[index];
                                            let userChat = {
                                                chat: chat._id,
                                                recipient: element._id.toString() == user._id.toString() ? otherUser._id.toString() : ownUser._id.toString()
                                            }

                                            bulkUpdateOps.push({
                                                "updateOne": {
                                                    "filter": { "_id": element._id },
                                                    "update": { "$push": { "chats": userChat } }
                                                }
                                            });

                                        }
                                        User.collection.bulkWrite(bulkUpdateOps, { "ordered": true, w: 1 }, (err, result) => {
                                            if (err) return callback(err);
                                            body.message.chat = chat._id
                                            Message.create(body.message, (err, message) => {
                                                if (err) return callback(err);
                                                chat.lastMessage = message._id;
                                                chat.modified = modified;
                                                chat.unreadMessages.forEach(element => {
                                                    if (element.user.toString() != user._id.toString()) element.unreadMessageCount += 1;
                                                    else {
                                                        element.unreadMessageCount = 0;
                                                    }
                                                });
                                                chat.save((err, chatSaved) => {

                                                    let unreadMessageCountGrouped = _.chain(chat.unreadMessages).groupBy("user").value();
                                                    let title = chat.customType == "1-1" ? `${user.username}` : `${user.username} @ ${chat.name}`;
                                                    let body = message.message;
                                                    let usersOffline = users.filter(member => (member._id.toString() != user._id.toString()) && (!member.connectionStatus || member.connectionStatus == "offline"));
                                                    if (usersOffline.length == 0) return callback(null, message, chat);
                                                    let usersOfflineMapped = usersOffline.map(member => {
                                                        let key = member._id.toString();
                                                        return {
                                                            playerIds: member.playerIds,
                                                            notifications: unreadMessageCountGrouped[key][0].unreadMessageCount > 1 ? member.notifications.length.toString() : (member.notifications.length + 1).toString()
                                                        }
                                                    });
                                                    var prevResult = _.chain(usersOfflineMapped).groupBy("notifications").value();
                                                    var result = _.chain(prevResult).forEach(function (value, key) {
                                                        prevResult[key] = _.map(value, 'playerIds').reduce((acc, val) => acc.concat(val), [])
                                                    }).value(); // {"3": [123.., 123..], "4 (for badge)": [123.., 123..]} así queda


                                                    //FCM NOTIFICATION
                                                    for (const key in result) {
                                                        if (result.hasOwnProperty(key)) {
                                                            //FCM NOTIFICATION
                                                            var playerIds = result[key];
                                                            var messageForNoti = {
                                                                notification: {
                                                                    title,
                                                                    body,
                                                                    sound: 'default',
                                                                    badge: key,
                                                                    icon: 'ic_stat_notify',
                                                                },
                                                                data: {
                                                                    "chat": "1",
                                                                    "chatId": chat._id.toString()
                                                                }
                                                            };
                                                            agenda.now('user notification', { playerIds: playerIds, notification: messageForNoti });

                                                        }
                                                    }
                                                    callback(null, message, chatSaved);
                                                })
                                            })
                                        });
                                    })
                            })
                        }
                    })

            } else { //GROUP

                //El chat existe
                let modified = new Date();
                body.message.user = user._id;
                if (body.message.chat) {

                    Chat.findById(body.message.chat)
                        .populate({ "path": "members", "select": { 'connectionStatus': 1, 'playerIds': 1, "notifications": 1, "username": 1 } })
                        .exec((err, chat) => {
                            if (err) callback(err);
                            if (!chat) {
                                var err = new Error("Not Found");
                                err.status = 404;
                                return callback(err);
                            }
                            if (!chat.members.some(m => m.username == user.username)) {

                                var err = new Error("You have been eliminated");
                                err.status = 404;
                                return callback(err);

                            }

                            Message.create(body.message, (err, message) => {
                                if (err) return callback(err);
                                //console.log('perro',chat);
                                chat.unreadMessages.forEach(element => {

                                        if (element.user.toString() != user._id.toString()) element.unreadMessageCount += 1;
                                        else {
                                            element.unreadMessageCount = 0;
                                        }
                                    
                                   
                                });
                                chat.lastMessage = message._id;
                                chat.modified = modified;
                                chat.save((err, chatSaved) => {

                                    let unreadMessageCountGrouped = _.chain(chat.unreadMessages).groupBy("user").value();
                                    let title = chat.customType == "1-1" ? `${user.username}` : `${user.username} @ ${chat.name}`;
                                    let body = message.message;
                                    let usersOffline = chat.members.filter(member => {
                                        let key = member._id.toString();
                                        return (!unreadMessageCountGrouped[key][0].muted) && (member._id.toString() != user._id.toString()) && (!member.connectionStatus || member.connectionStatus == "offline")
                                    })

                                    if (usersOffline.length == 0) return callback(null, message, chat);
                                    let usersOfflineMapped = usersOffline.map(member => {
                                        let key = member._id.toString();
                                        return {
                                            playerIds: member.playerIds,
                                            notifications: unreadMessageCountGrouped[key][0].unreadMessageCount > 1 ? member.notifications.length.toString() : (member.notifications.length + 1).toString()
                                        }
                                    });

                                    var prevResult = _.chain(usersOfflineMapped).groupBy("notifications").value();
                                    var result = _.chain(prevResult).forEach(function (value, key) {
                                        prevResult[key] = _.map(value, 'playerIds').reduce((acc, val) => acc.concat(val), [])
                                    }).value(); // {"3": [123.., 123..], "4 (for badge)": [123.., 123..]} así queda

                                    for (const key in result) {
                                        if (result.hasOwnProperty(key)) {
                                            //FCM NOTIFICATION
                                            var playerIds = result[key];
                                            var messageForNoti = {
                                                notification: {
                                                    title,
                                                    body,
                                                    sound: 'default',
                                                    badge: key,
                                                    icon: 'ic_stat_notify',
                                                },
                                                data: {
                                                    "chat": "1",
                                                    "chatId": chat._id.toString()
                                                }
                                            };
                                            agenda.now('user notification', { playerIds: playerIds, notification: messageForNoti });

                                        }
                                    }
                                    //FCM NOTIFICATION
                                    callback(null, message, chat);
                                })


                            })

                        })

                } else { //No hay un chat, hay que crearlo

                    Chat.create(body.chat, (err, chat) => {
                        if (err) return callback(err);
                        User.find({ _id: { $in: body.chat.members } }, { "chats": 1, "username": 1, "connectionStatus": 1, "playerIds": 1, "notifications": 1 })
                            .exec((err, users) => {
                                let bulkUpdateOps = [];
                                let otherUser = users.filter(userr => userr.username != user.username)[0];
                                let ownUser = users.filter(userr => userr.username == user.username)[0];
                                if (err) return callback(err);
                                for (let index = 0; index < users.length; index++) {
                                    const element = users[index];
                                    let userChat = {
                                        chat: chat._id,
                                        recipient: element._id.toString() == user._id.toString() ? otherUser._id.toString() : ownUser._id.toString()
                                    }

                                    bulkUpdateOps.push({
                                        "updateOne": {
                                            "filter": { "_id": element._id },
                                            "update": { "$push": { "chats": userChat } }
                                        }
                                    });

                                }
                                User.collection.bulkWrite(bulkUpdateOps, { "ordered": true, w: 1 }, (err, result) => {
                                    if (err) return callback(err);
                                    body.message.chat = chat._id
                                    Message.create(body.message, (err, message) => {
                                        if (err) return callback(err);
                                        chat.lastMessage = message._id;
                                        chat.modified = modified;
                                        chat.unreadMessages.forEach(element => {
                                            if (element.user.toString() != user._id.toString()) element.unreadMessageCount += 1;
                                            else {
                                                element.unreadMessageCount = 0;
                                            }
                                        });
                                        chat.save((err, chatSaved) => {

                                            let unreadMessageCountGrouped = _.chain(chat.unreadMessages).groupBy("user").value();
                                            let title = chat.customType == "1-1" ? `${user.username}` : `${user.username} @ ${chat.name}`;
                                            let body = message.message;
                                            let usersOffline = users.filter(member => (member._id.toString() != user._id.toString()) && (!member.connectionStatus || member.connectionStatus == "offline"));
                                            if (usersOffline.length == 0) return callback(null, message, chat);
                                            let usersOfflineMapped = usersOffline.map(member => {
                                                let key = member._id.toString();
                                                return {
                                                    playerIds: member.playerIds,
                                                    notifications: unreadMessageCountGrouped[key][0].unreadMessageCount > 1 ? member.notifications.length.toString() : (member.notifications.length + 1).toString()
                                                }
                                            });
                                            var prevResult = _.chain(usersOfflineMapped).groupBy("notifications").value();
                                            var result = _.chain(prevResult).forEach(function (value, key) {
                                                prevResult[key] = _.map(value, 'playerIds').reduce((acc, val) => acc.concat(val), [])
                                            }).value(); // {"3": [123.., 123..], "4 (for badge)": [123.., 123..]} así queda


                                            for (const key in result) {
                                                if (result.hasOwnProperty(key)) {
                                                    //FCM NOTIFICATION
                                                    var playerIds = result[key];
                                                    var messageForNoti = {
                                                        notification: {
                                                            title,
                                                            body,
                                                            sound: 'default',
                                                            badge: key,
                                                            icon: 'ic_stat_notify',
                                                        },
                                                        data: {
                                                            "chat": "1",
                                                            "chatId": chat._id.toString()
                                                        }
                                                    };
                                                    agenda.now('user notification', { playerIds: playerIds, notification: messageForNoti });

                                                }
                                            }
                                            callback(null, message, chatSaved);
                                        })
                                    })
                                });
                            })
                    })
                }

            }
        }



    }

}

module.exports = new ChatRepository();

