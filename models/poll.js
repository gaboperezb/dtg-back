var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var DailyVotesSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    option: {type: String, trim: true}
})

var DailyPollSchema = new Schema({

    title: {type: String, trim: true, required: true},
    league: {type: String, trim: true, required: true},
    pollValues: {type: [String], trim: true},
    votes: {type: [DailyVotesSchema]},
    date: {type: Date, trim: true},
    featured: {type: Boolean, default: false}
    
});

DailyPollSchema.pre('save', function(next) {
    this.date = this._id.getTimestamp();
    next();
})

var DailyPoll = mongoose.model('Poll', DailyPollSchema);
module.exports = DailyPoll;