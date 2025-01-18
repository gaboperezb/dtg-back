var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
    members:[{ type: Schema.Types.ObjectId, ref: 'User' }],
    size: {type: Number}, //solo para grupos
    name: {type: String, trim: true}, 
    coverUrl: {type: String, trim: true},
    removed: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    createdAt: {type: Date},
    operatorsIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    room: {type: Boolean},
    customType: { type: String}, //team, sport o general
    modified: {type: Date},
    public: {type: Boolean, default: false},
    league: {type: String, trim: true},
    team: { type: Schema.Types.ObjectId, ref: 'Team'},
    distinct: {type: Boolean, default: true}, //Indicates wether to reuse the existing channel instead of creating a new channel with the same members.
    unreadMessages: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        unreadMessageCount: {type: Number},
        muted: {type: Boolean}
    }]
},{
    usePushEach: true
});

ChatSchema.pre('save', function(next) {
    this.createdAt = this._id.getTimestamp();
    next();
})

var Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;