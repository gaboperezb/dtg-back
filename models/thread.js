var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var VotesSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    option: {type: String, trim: true}
})

var ThreadSchema = new Schema({

    title: {type: String, trim: true, required: true},
    likers: {type: [String], default: []},
    bookmarks: {type: [String], default: []},
    picture: {type: String}, 
    video: {type: String},
    videoThumbnail: {type: String},
    thumbnail: {type: String}, 
    webPicture: {type: String}, 
    duration: {type: String},
    userViews: {type: [String], select: false}, 
    url: {type: String, trim: true},
    featured: {type: Boolean, default: false},
    fromWeb: {type: Boolean},
    teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    source: {type: String, trim: true},
    description: {type: String, trim: true},
    type: {type: String, trim: true},
    pollValues: {type: [String], trim: true},
    abValues: {type: [String], trim: true},
    votes: {type: [VotesSchema]},
    league: {type: String, trim: true, required: true},
    replies: {type: Number, trim: true, default: 0},
    views: {type: Number, trim: true, default: 0},
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, trim: true},
    groupDate: {type: String, trim: true},
    ranking: {type: Number, default: 0},
    rankingTop: {type: Number, default: 0}
    
},{
    usePushEach: true
});

ThreadSchema.pre('save', function(next) {
    let thread = this;
    this.date = this._id.getTimestamp();
    next();
})

var Thread = mongoose.model('Thread', ThreadSchema);
module.exports = Thread;