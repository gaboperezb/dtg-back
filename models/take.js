var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VotesSchemaTake = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    option: {type: String, trim: true}
})

var TakeSchema = new Schema({

    user: { type: Schema.Types.ObjectId, ref: 'User'},
    take: {type: String, trim: true, required: true},
    likers: {type: [String], default: []},
    bookmarks: {type: [String], default: []},
    picture: {type: String}, 
    pictureHeight: {type: Number},
    pictureWidth: {type: Number},
    video: {type: String},
    videoThumbnail: {type: String},
    thumbnail: {type: String}, 
    videoDuration: {type: Number},
    videoHeight: {type: Number},
    videoWidth: {type: Number},
    url: {type: String, trim: true},
    votes: {type: [VotesSchemaTake]},
    pollValues: {type: [String], trim: true},
    teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    source: {type: String, trim: true},
    type: {type: String, trim: true},
    league: {type: String, trim: true, required: true},
    replies: {type: Number, trim: true, default: 0},
    date: {type: Date, trim: true},
    groupDate: {type: String, trim: true},
    ranking: {type: Number, default: 0},
    rankingTop: {type: Number, default: 0},

    //embedly
    urlType: {type: String},
    provider_name: {type: String},
    provider_url: {type: String}, //short: i.e youtube.com
    html: {type: String},
    thumbnail_url: {type: String},
    favicon_url: {type: String},
    htmlWidth: {type: Number},
    htmlHeight: {type: Number},
    thumbnail_width: {type: Number},
    thumbnail_height: {type: Number},
    urlTitle: {type: String},
    urlDescription: {type: String},
},{
    usePushEach: true
});

TakeSchema.pre('save', function(next) {
    this.date = this._id.getTimestamp();
    next();
})

var Take = mongoose.model('Take', TakeSchema);
module.exports = Take;