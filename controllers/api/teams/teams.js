const teamRepo = require('../../../lib/team-repository'),
    passport = require('passport');
var requireAuth = passport.authenticate('jwt', { session: false });

var requireAuth = passport.authenticate('jwt', { session: false });

class TeamsController {


    constructor(router) {
        router.get('/', requireAuth, this.getAllTeams.bind(this));
        router.put('/update-user-teams', requireAuth, this.updateUserTeams.bind(this));
  
    }

    getAllTeams(req, res, next) {

        let league = req.query.league;
        teamRepo.getAllTeams(league, (err, data) => {
            if (err) return next(err);
            res.json(data);
        })

    }

    updateUserTeams(req, res, next) {

        let body = req.body
        teamRepo.updateUserTeams(req.user, body, (err, data) => {
            if (err) return next(err);
            res.json(data);
        })

    }

}

module.exports = TeamsController;