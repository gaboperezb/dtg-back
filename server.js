
const bodyParser = require('body-parser'),
    User = require('./models/user'),
    rateLimit = require("express-rate-limit");
Thread = require('./models/thread'),
    Team = require('./models/team'),
    Tdiscussion = require('./models/thread-discussion'),
    Room = require('./models/room'),
    Chat = require('./models/chat'),
    Badge = require('./models/badge'),
    async = require('async'),
    cookieParser = require('cookie-parser'),
    cors = require('cors'),
    favicon = require('serve-favicon'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    FacebookTokenStrategy = require('passport-facebook-token'),
    router = require('./routes/router'),
    sslRedirect = require('heroku-ssl-redirect'),
    port = process.env.PORT || 3000,
    sgMail = require('@sendgrid/mail'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    admin = require("firebase-admin"),
    LocalStrategy = require('passport-local').Strategy;
    
    // serverJs=require('../../../server.js'),iserverJS=new serverJs(app,http),

class Server {

    constructor(app, http) {

        this.app = app;
        this.io = require('socket.io')(http);

        this.initExpressMiddleWare();
        this.mongoConnection();
        this.initRoutes();
        this.ioGameSocket();
        this.passport();
        this.countMessages();
        //this.addDates()
    
    }

    addDates() {

        User.aggregate([
            {
                $project: {
                    "month": { $month: '$createdAt' },
                    "year": { $year: '$createdAt' }
                }
            },

            { $match: { month: 1, year: 2020 } },
        ], (err, users) => {
            if (err) return console.log('err');
            console.log(users.length)


        })
    }

    countMessages() {
        Tdiscussion.aggregate([
            {
                $project: {
                    "sizeAnswers": { $size: '$answers' },
                }
            },
        ], (err, td) => {
            if (err) return console.log('err');
            let total = 0;
            for (let index = 0; index < td.length; index++) {
                const item = td[index];
                total+= item.sizeAnswers;
                
            }
            
        })
    }



    addChatsToRooms() {
        Room.find({ team: { $exists: false } })
            .exec((err, rooms) => {
                if (err) {
                    return
                }

                rooms.forEach((room) => {

                    let chat1 = {
                        name: 'Main Chat',
                        coverUrl: 'assets/imgs/group.png',
                        room: true,
                        customType: 'general'
                    }

                    Chat.create(chat1, (err, chat1) => {
                        if (err) return;

                        room.chats = [chat1];
                        room.save((err, room) => {
                            if (err) return;
                        })

                    })
                    
                })

            })
    }


    updateNotifications(user, type) {

        let notiType = type == 'post' ? "noti" : 'message';
        User.findByIdAndUpdate(user, { $push: { notifications: notiType } }, (err, user) => {
            if (err) return console.log(err);

        })

    }

    updateConnectionStatus(user, connectionStatus) {

        let update = {
            connectionStatus,
            lastSeenAt: connectionStatus == "online" ? 0 : Date.now()
        }
        User.findByIdAndUpdate(user, update, (err, user) => {
            if (err) return console.log(err);
        })
    }


    ioGameSocket() {

        var allClients = [];
        this.io.on('connection', (socket) => {

            console.log('user connected');
            socket.on('login', (data) => {
                socket.join(data.user);
                this.updateConnectionStatus(data.user, 'online');
                allClients.push({
                    user: data.user,
                    socketId: socket.id
                })
            })

            socket.on('room', (data) => {
                console.log('join room')
                socket.join(data.room);
            })

            socket.on('leave-room', (data) => {
                console.log('leave room')
                socket.leave(data.room);
            })

            socket.on('disconnect', () => {

                console.log('user disconnected');
                if (allClients.length) {
                    let foundSocket = allClients.find(s => s.socketId == socket.id);
                    if (foundSocket) {
                        allClients = allClients.filter(c => c.socketId != socket.id);
                        this.updateConnectionStatus(foundSocket.user, 'offline');
                    }

                }
            });

            socket.on('message', (data) => {

                if (!data.chat.room) {
                    console.log('private')

                    data.chat.unreadMessages.forEach((um) => {
                        if ((um.unreadMessageCount < 2) && (data.user != um.user)) this.updateNotifications(um.user, 'message');
                        socket.broadcast.to(um.user).emit('message', {
                            chat: data.chat,
                            message: data.message
                        })
                    });

                } else {
                    console.log('room')
                    socket.to(data.chat._id).emit('message', {
                        chat: data.chat,
                        message: data.message
                    });
                }

            });

            socket.on('endTyping', (data) => {

                if (!data.chat.room) {
                    data.roomsToEmit.forEach((roomID) => {
                        socket.broadcast.to(roomID).emit('endTyping', {
                            chat: data.chat,
                            username: data.username
                        })
                    });
                } else {
                    socket.to(data.chat._id).emit('endTyping', {
                        chat: data.chat,
                        username: data.username
                    });
                }



            });

            socket.on('startTyping', (data) => {

                if (!data.chat.room) {
                    data.roomsToEmit.forEach((roomID) => {
                        socket.broadcast.to(roomID).emit('startTyping', {
                            chat: data.chat,
                            username: data.username
                        })
                    });
                } else {
                    socket.to(data.chat._id).emit('startTyping', {
                        chat: data.chat,
                        username: data.username
                    });
                }


            });

            socket.on('post', (data) => {

                if (data.user != null) {

                    if (data.user != data.ownUser) {

                        socket.broadcast.to(data.user).emit('notification', data.type)
                        this.updateNotifications(data.user, 'post');
                    }

                }

            });

        });


    }

    mongoConnection() {
        const options = {
            server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
            replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
        };
 

        var mongodbUri = "mongodb://gabrielprzb:manutdgb7@ds115873-shard-00-00-lnmct.mongodb.net:27017,ds115873-shard-00-01-lnmct.mongodb.net:27017,ds115873-shard-00-02-lnmct.mongodb.net:27017/discussthegame?ssl=true&replicaSet=ds115873-shard-0&authSource=admin&retryWrites=true&w=majority";
        var mongodbUriMlab = `mongodb://gabrielprzb:manutdgb7@ds115873-a0.mlab.com:15873,ds115873-a1.mlab.com:15873/discussthegame?replicaSet=rs-ds115873`;
        mongoose.connect(mongodbUri,  options);
        var db = mongoose.connection;

        
        // mongo error
        db.on('error', console.error.bind(console, 'connection error:'));

    }



    initExpressMiddleWare() {
        this.app.use(favicon(__dirname + '/src/assets/imgs/favicon.ico'));
        this.app.use(sslRedirect());
        //app.use(express.static(__dirname + '/dist/dtg-web'));
        this.app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
        this.app.use(bodyParser.json({ limit: '50mb' }));


        // enable cors
        var corsOption = {
            origin: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With',
            optionsSuccessStatus: 204,
            maxAge: 86400,
            credentials: false
        };
        this.app.options('*', cors(corsOption));
        this.app.use(cors(corsOption));

        /*           //security
          app.use((req, res, next) => {
              var csrfToken = req.csrfToken();
              res.locals._csrf = csrfToken;
              res.cookie('XSRF-TOKEN', csrfToken);
              next();
          }); */

        //error handling
        this.app.use(function (err, req, res, next) {
            res.status(err.status || 500).send({ error: err });
        });

    }


    passport() {

        var localOptions = {
            usernameField: 'email'
        };
        var localLogin = new LocalStrategy(localOptions, function (email, password, done) {
            User.authenticate(email, password, function (err, errMessage, user) {
                if (err) {
                    console.log(err)
                    return done(err);
                }
                if (errMessage) {
                    console.log(errMessage)
                    return done(null, errMessage);
                }

                return done(null, user);

            });

        });

        var jwtOptions = {
            jwtFromRequest: ExtractJwt.fromAuthHeader(),
            secretOrKey: "speedygonzales",
            ignoreExpiration: true
        };

        var jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {

            User.findById(payload._id)
                .populate('badge')
                .populate('favAllTeams')
                .populate('favMainTeams')
                .exec((err, user) => {

                    if (err) {
                        return done(err, false);
                    }

                    if (user) {
                        done(null, user);
                    } else {
                        done(null, false);
                    }

                });

        });

        passport.use(new FacebookTokenStrategy({
            clientID: '1917714931892020',
            clientSecret: '2e010649aef3ccecd5211a94d2d59028',
            passReqToCallback: true
        },
            function (req, accessToken, refreshToken, profile, done) {
                User.upsertFbUser(req, accessToken, refreshToken, profile, function (err, user) {

                    return done(err, user);
                });
            }));
        passport.use(jwtLogin);
        passport.use(localLogin);
    }

    initRoutes() {
        router.load(this.app, this.io, './controllers');
    }
}

module.exports = Server;