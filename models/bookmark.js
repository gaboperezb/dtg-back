var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookmarkSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    thread:{ type: Schema.Types.ObjectId, ref: 'Thread' },
    take:{ type: Schema.Types.ObjectId, ref: 'Take' },
    createdAt: {type: Date}
});

BookmarkSchema.pre('save', function(next) {
    this.createdAt = this._id.getTimestamp();
    next();
})

var Bookmark = mongoose.model('Bookmark', BookmarkSchema);
module.exports = Bookmark;