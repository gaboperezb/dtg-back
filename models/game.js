var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VotesSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    option: {type: String, trim: true}
})

var GameSchema = new Schema({

    awayTeam: { type: Schema.Types.ObjectId, ref: 'Team' },
    homeTeam: { type: Schema.Types.ObjectId, ref: 'Team' },
    awayTeamScore: { type: Number, trim: true },
    awayTeamPoints1: { type: Number, trim: true },
    awayTeamPoints2: { type: Number, trim: true },
    awayTeamPoints3: { type: Number, trim: true },
    awayTeamPoints4: { type: Number, trim: true },
    awayTeamPointsOT: { type: Number, trim: true },
    awayTeamPointsSO: { type: Number, trim: true },
    pollValues: {type: [String], trim: true},
    votes: {type: [VotesSchema]},

    //MLB>
    awayRuns:{ type: [Number]},
    awayTeamR: { type: Number, trim: true },
    awayTeamH: { type: Number, trim: true },
    awayTeamE: { type: Number, trim: true },
    //>MLB

    homeTeamScore: { type: Number, trim: true },
    homeTeamPoints1: { type: Number, trim: true },
    homeTeamPoints2: { type: Number, trim: true },
    homeTeamPoints3: { type: Number, trim: true },
    homeTeamPoints4: { type: Number, trim: true },
    homeTeamPointsSO: { type: Number, trim: true }, //shootout NHL
    homeTeamPointsOT: { type: Number, trim: true },


    //MLB>
    homeRuns:{ type: [Number]},
    homeTeamR: { type: Number, trim: true },
    homeTeamH: { type: Number, trim: true },
    homeTeamE: { type: Number, trim: true },
    //<MLB

    gameDate: { type: Date, required: true, trim: true },
    league: { type: String, required: true, trim: true },
    seasonYear: { type: Number, trim: true },
    seasonType: { type: String, trim: true },
    week: { type: Number, trim: true },
    highlights: { type: String, trim: true },
    replies: { type: Number, trim: true, default: 0 },
    views: { type: Number, trim: true, default: 0 },

    //Soccer
    homeTeamGoals:
        [{
            player: String,
            minute: Number
        }],
    awayTeamGoals:
        [{
            player: String,
            minute: Number
        }],
    homeTeamScorePenalties: { type: Number, trim: true },
    awayTeamScorePenalties: { type: Number, trim: true }

},{
    usePushEach: true
})

var Game = mongoose.model('Game', GameSchema);
module.exports = Game;