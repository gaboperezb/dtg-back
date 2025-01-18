var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    size: {type: Number, default: 0},
    name: {type: String, trim: true}, 
    status: {type: String, trim: true}, 
    coverPicture: {type: String, default: 'assets/imgs/room-cover.png'},
    removed: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
    operatorsIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    league: {type: String, trim: true},
    team: { type: Schema.Types.ObjectId, ref: 'Team'},
    notifications: [{ //chats dentro de las rooms
		chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
		users: [{ type: Schema.Types.ObjectId, ref: 'User' }] //Para determinar unreadmessages
    }],
    lastMessages: [{ 
		chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
		lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' } //Para determinar unreadmessages
	}],
},{
    usePushEach: true
});

RoomSchema.pre('save', function(next) {
    this.createdAt = this._id.getTimestamp();
    next();
})

var Room = mongoose.model('Room', RoomSchema);
module.exports = Room;