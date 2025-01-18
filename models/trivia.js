var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var SelectionSchema = new Schema({
    option: {type: String, trim: true},
    picture: {type: String, trim: true},
    count: {type: Number, default: 0}
})

var TriviaSchema = new Schema({
    question: {type: String, trim: true, required: true},
    active: {type: Boolean, default: false},
    revealAnswer: {type: Boolean, default: false},
    type: {type: String, trim: true},
    options: {type: [SelectionSchema]},
    correctOption: {type: Schema.Types.ObjectId},
    league: {type: String, trim: true, required: true},
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, trim: true}
},{
    usePushEach: true
});

TriviaSchema.pre('save', function(next) {

    if(this.isNew) {
        this.date = this._id.getTimestamp();
    }

    next();
})

var Trivia = mongoose.model('Trivia', TriviaSchema);
module.exports = Trivia;