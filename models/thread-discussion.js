var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TanswerSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    discussion: {type: String, required: true, trim: true},
    responding: { type: Schema.Types.ObjectId, ref: 'User'},
    likers: {type: [String]},
    dislikers: {type: [String]},
    date: {type: Date, trim: true},
    inReplyTo: { type: Schema.Types.ObjectId}, //discusion
    replyType: {type: String, required: true, trim: true},
    replyText: {type: String, required: true, trim: true},
    parent: { type: Schema.Types.ObjectId}, //ui de app
    post: {type: Boolean, default: false}, //post-game
    gameMoment: {
		type: String,
		enum: ['pre', 'in', 'post']
	}

},{
    usePushEach: true
});

var TdiscussionSchema = new Schema({

    user: { type: Schema.Types.ObjectId, ref: 'User'},
    threadUser: { type: Schema.Types.ObjectId, ref: 'User'},
    thread: { type: Schema.Types.ObjectId, ref: 'Thread'},
    take: { type: Schema.Types.ObjectId, ref: 'Take'},
    trivia: { type: Schema.Types.ObjectId, ref: 'Trivia'},
    game: { type: Schema.Types.ObjectId, ref: 'Game'},
    discussion: {type: String, required: true, trim: true},
    date: {type: Date, trim: true},
    likers: {type: [String], default: []},
    dislikers: {type: [String], default: []},
    answers: {type: [TanswerSchema], default: []},

    //
    post: {type: Boolean, default: false}, //post-game
    gameMoment: {
		type: String,
		enum: ['pre', 'in', 'post']
	}

},{
    usePushEach: true
});

TdiscussionSchema.pre('save', function(next) {
    var discussion = this;
    this.date = this._id.getTimestamp();
    next();
})

var Tdiscussion = mongoose.model('Tdiscussion', TdiscussionSchema);
module.exports = Tdiscussion;