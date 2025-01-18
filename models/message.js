var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    chat:{ type: Schema.Types.ObjectId, ref: 'Chat' },
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    thread:{ type: Schema.Types.ObjectId, ref: 'Thread' },
    take:{ type: Schema.Types.ObjectId, ref: 'Take' },
    createdAt: {type: Date, trim: true},
    customType: {type: String, trim: true},
    message: {type: String, trim: true}

});

MessageSchema.pre('save', function(next) {
    this.createdAt = this._id.getTimestamp();
    next();
})


var Message = mongoose.model('Message', MessageSchema);
module.exports = Message;