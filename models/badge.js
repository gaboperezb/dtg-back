var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BadgeSchema = new Schema({
    picture: {type: String},
    nextPicture: {type: String},
    level: {type: Number, default: 1},
    name: {type: String, default: "ROOKIE"},
    nextPoints: {type: Number, default: 1000},
    previousPoints: {type: Number, default: 1000},
    nextName: {type: String, default: "ROTY"},
    nextBadge: {type: Schema.Types.ObjectId, ref: 'Badge'},
    previousBadge: {type: Schema.Types.ObjectId, ref: 'Badge'}

});

var Badge = mongoose.model('Badge', BadgeSchema);
module.exports = Badge;


