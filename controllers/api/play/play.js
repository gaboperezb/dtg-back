const playRepo = require('../../../lib/play-repository'),
                mid = require('../../../middleware/index'),
                passport = require('passport');
var requireAuth = passport.authenticate('jwt', {session: false}),
requireLogin = passport.authenticate('local', {session: false});

class PlayController {

    constructor(router) {
       
        router.get('/daily-trivias' ,this.getDailyTrivias.bind(this));
        router.get('/daily-picks' ,this.getDailyPicks.bind(this));
        router.post('/daily-trivias/:id/timesup', requireAuth, this.timesUp.bind(this));
        router.post('/daily-trivias/:id/answers', requireAuth, this.postTriviaAnswer.bind(this));
        router.get("/sign-s3", requireAuth, this.signS3AWS.bind(this));
        router.post('/i/delete-trivia', requireAuth, mid.deleteAuthorization, this.deleteTrivia.bind(this));
       
    }

  

    deleteTrivia(req, res, next) {
           
        let userId = req.user._id.toString();
        let isAdmin = req.user.role == "admin" ? true : null;
        playRepo.deleteTrivia(isAdmin, userId, req.body, (err, succeded) => {
            if (err) return next(err);
            res.json({succeded: succeded});
        })

    }

    timesUp(req, res , next) {
        let triviaId = req.params.id;
        playRepo.timesUp(triviaId, req.user._id, (err, trivia) => {
            if (err) return next(err);
            res.json({});
        })
    }

    postTriviaAnswer(req, res , next) {
        playRepo.postTriviaAnswer(req.body, req.user._id, (err, trivia) => {
            if (err) return next(err);
            res.json({});
        })
    }

    

    

    getDailyPicks(req, res, next) {

        let league = req.query.league;
        let leaguesForTop;
        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }
        playRepo.getDailyPicks(league, leaguesForTop, (err, trivias) => {
            if (err) return next(err);
            res.json(trivias);
        })

    }

    getDailyTrivias(req, res, next) {

        let league = req.query.league;
        let leaguesForTop;
        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }
        playRepo.getDailyTrivias(league, leaguesForTop, (err, trivias) => {
            if (err) return next(err);
            res.json(trivias);
        })


        

    }


    signS3AWS(req, res, next) {

       
        //Unpload files to S3 AWS
        const s3 = new aws.S3();
        const S3_BUCKET = process.env.S3_BUCKET;
        const fileName = req.query['file-name'];
        const fileType = req.query['file-type'];

        

        //Empty folder
       
        const s3Params = {
            Bucket: S3_BUCKET,
            Key: `trivias/${fileName}`,
            Expires: 60,
            ContentType: fileType,
            ACL: 'public-read'
          };

        s3.getSignedUrl('putObject', s3Params, (err, data) => {
          if (err) {
            
            return res.end();
          }
          const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/trivias/${fileName}`
          };

          res.json(returnData);
      
        });
    
    }

    
    
}

module.exports = PlayController;