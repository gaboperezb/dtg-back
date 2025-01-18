var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TeamSchema = new Schema({
    logo: {type: String, required: true, trim: true},
	teamName: {type: String, required: true, trim: true},
    abbreviation: {type: String, required: true, trim: true},
    wins: {type: Number, trim: true, default: 0},
    loses: {type: Number, trim: true, default: 0},
    otl: {type: Number, trim: true, default: 0},
    league: {type: String, required: true, trim: true},
    fbsConference: {type: String, trim: true},
    soccerLeague: {type: String, trim: true},
    stadium: {type: String, trim: true},
    background: {type: String, trim: true}
	
});

var Team = mongoose.model('Team', TeamSchema);
module.exports = Team;