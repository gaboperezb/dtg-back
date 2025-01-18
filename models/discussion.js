var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnswerSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    discussion: {type: String, required: true, trim: true},
    responding: { type: Schema.Types.ObjectId, ref: 'User'},
    likers: {type: [String]},
    dislikers: {type: [String]},
    date: {type: Date, trim: true},
    inReplyTo: { type: Schema.Types.ObjectId},
    replyType: {type: String, required: true, trim: true},
    replyText: {type: String, required: true, trim: true},
    post: {type: Boolean, default: false}, //post-game
    parent: { type: Schema.Types.ObjectId}
},{
    usePushEach: true
});

var DiscussionSchema = new Schema({

    user: { type: Schema.Types.ObjectId, ref: 'User'},
	game: { type: Schema.Types.ObjectId, ref: 'Game'},
    discussion: {type: String, required: true, trim: true},
    date: {type: Date, trim: true},
    likers: {type: [String], default: []},
    dislikers: {type: [String], default: []},
    answers: {type: [AnswerSchema], default: []},
    post: {type: Boolean, default: false} //post-game
    
	
},{
    usePushEach: true
});

DiscussionSchema.pre('save', function(next) {
    var discussion = this;
    this.date = this._id.getTimestamp();
    next();
})

var Discussion = mongoose.model('Discussion', DiscussionSchema);
module.exports = Discussion;