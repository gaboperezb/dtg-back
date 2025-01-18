const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Team = require('../models/team'),
    User = require('../models/user');

class TeamRepository {

    getAllTeams(league, callback) {
        Team.find({ league: league })
            .sort({abbreviation: 1})
            .exec((err, teams) => {
                if (err) return callback(err);
                callback(null, teams)
            })
    }


    updateUserTeams(user, body, callback) {

        User.findById(user._id)
            .exec((err, user) => {
                if (err) return callback(err);

                if(body.favAllTeams) body.favAllTeams.filter(t => t != null);
                if(body.favMainTeams) body.favMainTeams.filter(t => t != null);
                user.favMainTeams = body.favMainTeams;
                user.favAllTeams = body.favAllTeams;
                user.save((err, user) => {
                    if (err) return callback(err);
                    callback(null, user);
                })

            })


    }
}

module.exports = new TeamRepository();

