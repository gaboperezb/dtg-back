const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('../models/user'),
    ObjectId = mongoose.Types.ObjectId,
    Message = require('../models/message'),
    agenda = require('./agenda'),
    _ = require('lodash'),
    Room = require('../models/room');


class RoomRepository {

    getChats(room, callback) {

        Room.findById(room)
            .limit(20)
            .exec((err, room) => {
                if (err) {
                    return callback(err);
                }

                if (!room) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }

                Room.populate(room, { "path": "chats", "populate": { 'path': 'lastMessage' } }, (error, result) => {
                    if (error) return callback(error);
                    callback(null, result.chats);
                });


            })
    }

    getRooms(user, skip, callback) {
        //TEAMS

        Room.find({ team: { $in: user.favAllTeams } })
            .populate('team')
            .sort({size: -1})
            .skip(skip)
            .limit(20)
            .exec((err, rooms) => {
                if (err) {
                    return callback(err);
                }
                callback(null, rooms);

            })
    }


    getLeagueRooms(user, skip, callback) {
        Room.find({ team: { $exists: false }, league: { $in: user.leagues }, })
            .populate('team')
            .sort({size: -1})
            .skip(skip)
            .limit(20)
            .exec((err, rooms) => {
                if (err) {
                    return callback(err);
                }
                callback(null, rooms);

            })
    }


    registerForNotifications(room, chat, userId, callback) {
        Room.findById(room)
            .exec((err, room) => {
                if (err) return callback(err);
                if (!room) {
                    var err = new Error("Not Found");
                    err.status = 404;
                    return callback(err);
                }


                let index = room.notifications.findIndex(a => a.chat == chat)
                if (index > -1) {

                    let userIndex = room.notifications[index].users.indexOf(userId);
                    if (userIndex > -1) { //unregister notification

                        room.notifications[index].users.splice(userIndex, 1);

                    } else { //register notification
                        room.notifications[index].users.push(userId);
                    }

                } else {
                    let notification = {
                        chat,
                        users: [userId]
                    }
                    room.notifications.push(notification);

                }



                room.save((err, room) => {
                    if (err) return callback(err)
                    callback(null, true)
                })
            })

    }

    getFansNumber(team, league, callback) {

        if (team) {
            User.find({ favAllTeams: ObjectId(team) })
                .count((err, count) => {
                    if (err) return callback(err)
                    /* Room.findOne({team: ObjectId(team)})
                        .exec((err, room) => {
                            console.log(team);
                            room.size = count;
                            room.save()
                            
                        }) */

                        callback(null, count);
            
                  
                })
        } else {

            User.find({ leagues: league })
                .count((err, count) => {
                    if (err) return callback(err)
                     /* Room.find({league: league, team: { $exists: false }})
                        .exec((err, rooms) => {
                           
                            let room = rooms[0];
                            console.log(room.size, room.name)
                            room.size = count;
                            room.save((err, room) => {
                                if(err) return callback(err);
                                console.log(room.size, room.name)
                                callback(null, count)
                            })
                           
                            
                        })  */

                        callback(null, count)  
                })

        }

    }


    getTopFans(team, league, limit, skip, callback) {

        if (team) {

            User.find({ favAllTeams: ObjectId(team) }, { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 })
                .sort({ 'totalPoints': -1 })
                .limit(limit)
                .skip(skip)
                .exec((err, users) => {

                    if (err) return callback(err)
                    User.populate(users, { "path": "badge" }, (error, userPopulated) => {
                        if (error) return callback(error);
                        callback(null, userPopulated);
                    });

                })

        } else {
            User.find({ leagues: league }, { "bio": 1,"createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 })
                .sort({ 'totalPoints': -1 })
                .limit(limit)
                .skip(skip)
                .exec((err, users) => {
                    

                    if (err) return callback(err)
                    User.populate(users, { "path": "badge" }, (error, userPopulated) => {
                        if (error) return callback(error);
                        callback(null, userPopulated);
                    });
                  
                })
        }
    }

    createRoom(team, league, admin, name, callback) {
        let room = {
            name,
            status: "Welcome to the " + name + " room",
            operatorsIds: [admin],
            league,
            team,
        }

        Room.create(room, (err, room) => {
            if (err) return callback(err);
            callback(null, room)
        })
    }


}

module.exports = new RoomRepository();

