var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReportSchema = new Schema({
    userReported: { type: Schema.Types.ObjectId, ref: 'User'},
    userReporting: { type: Schema.Types.ObjectId, ref: 'User'},
    chat: { type: Schema.Types.ObjectId, ref: 'Chat'},
    reason: {type: String},
    date: {type: Date},
    reviewed: {type: Boolean, default: false}

});

ReportSchema.pre('save', function(next) {
    this.date = this._id.getTimestamp();
    next();
})

var Report = mongoose.model('Report', ReportSchema);
module.exports = Report;

