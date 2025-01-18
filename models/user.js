var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Badge = require('./badge')
var Schema = mongoose.Schema;

var UserSchema = new Schema({

	playerIds: { type: [String] }, //Firebase notifications
	facebookProvider: {
		type: {
			id: String,
			token: String
		},
		select: false
	},
	role: {
		type: String,
		enum: ['regular', 'admin', 'mod'],
		default: 'regular'
	},
	dmsOpen: { type: Boolean, default: true },
	fbId: { type: String },
	birthday: { type: String },
	createdAt: { type: Date },
	bio: { type: String, trim: true },
	verified: {type: Boolean, default: false},
	profilePicture: { type: String, default: "assets/imgs/user.png" },
	profilePictureThumbnail: { type: String, default: "assets/imgs/user.png" },
	coverPhoto: { type: String },
	profilePictureName: { type: String, default: "user.png" },
	profilePictureNameThumbnail: { type: String, default: "user.png" },
	coverPhotoName: { type: String },
	fullName: { type: String, trim: true },
	username: { type: String, required: true, trim: true, unique: true },
	email: { type: String, required: true, trim: true, unique: true},
	password: { type: String },
	resetPasswordToken: { type: String },
	resetPasswordExpires: { type: Date },
	usernameExpires: { type: Date },
	blocked: { type: Boolean, default: false },
	blockedReason: { type: String },
	leagues: { type: [String] },
	timeSpent: {
		timeSpent: { type: Number, default: 0},
		twoMinutesControl: { type: Number, default: 0}
	},
	pointsPerDay: {
		points: {type: Number, default: 0},
		date: {type: Date, default: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
	},
	ipAddress: { type: String },
	notifications: { type: [String], default: [] },
	points: { type: Number, default: 0 },
	wrongTrivias: { type: Number, default: 0 },
	correctTrivias: { type: Number, default: 0 },
	points: { type: Number, default: 0 },
	totalPoints: { type: Number, default: 0 },
	badge: { type: Schema.Types.ObjectId, ref: 'Badge' },
	threadDate: { type: Date }, //You can only upload 1 thread per day,
	threads: [{ type: Schema.Types.ObjectId, ref: 'Thread' }],
	trivias: [{ type: Schema.Types.ObjectId, ref: 'Trivia' }],
	favAllTeams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
	favMainTeams: [{ type: Schema.Types.ObjectId, ref: 'Team' }], //uno por liga
	versionNumber: { type: String },
	followers: {type: [{ type: Schema.Types.ObjectId, ref: 'User' }], select: false},
	following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	usersBlocked: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	usersBlockedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	followersNumber: {type: Number, default: 0},
	followingNumber: {type: Number, default: 0},
	featured: {type: Number, default: 0},
	connectionStatus: {type: String},
	lastSeenAt: {type: Number},
	chats: [{
		chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
		recipient: String //Solo para chats de 2 personas, username o ID (nuevo)
	}],
	rooms: [{ //chats dentro de las rooms
		chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
		lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' } //Para determinar unreadmessages
	}],
	dailyTrivias: [{  //hasta 8 de cada liga
		league: { type: String },
		trivia: { type: Schema.Types.ObjectId, ref: 'Trivia' },
		answer: { type: Schema.Types.ObjectId},
		timesUp: { type: String , default: false}
	}],
	notis:
		[{
			user: { type: Schema.Types.ObjectId, ref: 'User' },
			replyText: String,
			notification: { type: Schema.Types.Mixed },
			thread: { type: Schema.Types.ObjectId, ref: "Thread" },
			trivia: { type: Schema.Types.ObjectId, ref: "Trivia" },
			take: { type: Schema.Types.ObjectId, ref: "Take" },
			threadTitle: String,
			takeTitle: String,
			game: { type: Schema.Types.ObjectId, ref: "Game" },
			typeOf: String,
			replyType: String,
			parent: Schema.Types.ObjectId,
			timeline: Schema.Types.Mixed,
			timelineUser: { type: Schema.Types.ObjectId, ref: 'User' },
			date: { type: Date } //for follows
		}]

},
	{
		usePushEach: true
	},
	{ timestamps: true });


UserSchema.statics.upsertFbUser = function (req, accessToken, refreshToken, profile, cb) {
	var that = this;
	return this.findOne({
		'facebookProvider.id': profile.id
	}, function (err, user) {
		// no user was found, lets create a new one
		if (!user) {

			if (!!req.body.username) {
				req.body.username = req.body.username.replace(/ /g, '').toLowerCase();
				if (!req.body.username.match(/^[a-zA-Z0-9_]{1,20}$/)) {
					var err = new Error("Invalid field");
					err.status = 400;
					return callback(err);
				}

				Badge.findOne({ 'level': 1 }, (err, badge) => {
					if (err) return cb(err);
					if (!badge) {
						var err = new Error("Invalid fileds");
						err.status = 400;
						return cb(err);
					}


					var newUser = new that({
						username: req.body.username,
						email: profile.emails[0].value,
						badge: badge._id,
						facebookProvider: {
							id: profile.id,
							token: accessToken
						}
					});

					newUser.save(function (err, savedUser) {

						if (err) {
							if (err.code == 11000) {
								var field = err.message.split('.$')[1];
								// now we have `email_1 dup key`
								field = field.split(' dup key')[0];
								field = field.substring(0, field.lastIndexOf('_')); // returns email
								let error = `[Message] That ${field} is already registered`;
								return cb(null, error);
							}
						}

						User.populate(savedUser, { "path": "badge" }, (error, userPopulated) => {
							if (error) return cb(error);
							cb(null, userPopulated);
						});


					});

				})

			} else { //le picó en login y no en signup, por lo tnanto no hay un usuario.
				return cb(err, "[NOT]")
			}

		} else {
			User.populate(user, { "path": "badge" }, (error, userPopulated) => {
				if (error) return cb(error);
				return cb(null, userPopulated);
			});

		}
	});
};

// authenticate input against database documents
UserSchema.statics.authenticate = function (email, password, callback) {

	let loginCredential = email.toLowerCase();
	this.findOne({ $or: [ { email: loginCredential }, { username: loginCredential } ]},{ followers: false} )
		.populate('badge')
		.populate('favAllTeams')
		.populate('favMainTeams')
		.exec(function (error, user) {
			if (error) {
				return callback(error, null, null);
			} else if (!user) {
				let errorMessage = "[Info] User not found";
				return callback(null, errorMessage, null);
			}

			bcrypt.compare(password, user.password, function (error, result) {
				if (error) {
					return callback(error, null, null);
				} else if (!result) {

					let errorMessage = "[Info] The password is incorrect. Try again.";
					return callback(null, errorMessage, null);
				} else {

					return callback(null, null, user);
				}
			});

		})

}

UserSchema.pre('save', function (next) {

	var user = this;
	var passFB = this.facebookProvider;
	let launchDate = new Date("2018-10-01")
	let created = new Date(this._id.getTimestamp())
    this.createdAt = created < launchDate ? launchDate : created;

	if (this.isNew && !passFB) {

		bcrypt.hash(user.password, 10, function (err, hash) {
			if (err) {
				return next(err);
			}
			user.password = hash;
			next();
		})
	} else {

		next();
	}
});

var User = mongoose.model('User', UserSchema);


module.exports = User;


