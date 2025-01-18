const threadRepo = require('../../../lib/thread-repository'),
    FroalaEditor = require('../../../lib/wysiwyg-editor-node-sdk/lib/froalaEditor.js'),
    mid = require('../../../middleware/index'),
    rateLimit = require("../../../lib/rates/posts"),
    passport = require('passport');
var requireAuth = passport.authenticate('jwt', { session: false }),
    requireLogin = passport.authenticate('local', { session: false });

class ThreadController {

    constructor(router) {

        router.get('/following', requireAuth, this.getFollowingThreads.bind(this));
        router.get('/bookmarks', requireAuth, this.getBookmarks.bind(this));
        router.get('/', this.getThreads.bind(this));
        router.get('/i/newest', this.getNewestThreads.bind(this));
        router.get('/i/top', this.getTopThreads.bind(this));
        router.get('/i/featured', this.getFeatured.bind(this));
        router.get('/i/all-featured', this.getFeaturedForFeaturedPage.bind(this));
        router.get('/i/search', this.searchThreads.bind(this));
        router.get('/i/teams', requireAuth, this.getTeamThreads.bind(this));
        router.get('/i/poll', this.getDailyPoll.bind(this));
        router.get("/sign-s3", requireAuth, this.signS3AWS.bind(this));
        router.get("/sign-s3-froala", requireAuth, this.froalaS3Signature.bind(this));
        router.put("/delete-s3", requireAuth, this.deleteS3.bind(this));
        router.post('/i/poll/:id/vote', requireAuth, this.postDailyVote.bind(this));
        router.get('/i/links', this.getLinks.bind(this));
        router.post('/i/link-thread', requireAuth, this.postLinkThread.bind(this));
        router.get('/:id', this.getThread.bind(this));
        router.put('/:id', this.trackViews.bind(this));
        router.post('/:id', requireAuth, mid.deleteAuthorization, this.editThread.bind(this));
        router.post('/', requireAuth, this.postThread.bind(this));
        router.post('/:id/vote', requireAuth, this.postVote.bind(this));
        router.post('/i/delete-post', requireAuth, mid.deleteAuthorization, this.deleteThread.bind(this));
        router.post('/:id/bookmark', requireAuth, this.addToBookmarks.bind(this));
        router.delete('/:id/bookmark', requireAuth, this.deleteBookmark.bind(this));
        router.put("/:id/feature", requireAuth, mid.roleAuthorization(['admin']), this.feature.bind(this));
        router.post("/:id/boost", requireAuth, mid.roleAuthorization(['admin']), this.boost.bind(this));
        router.post("/:id/boost-votes", requireAuth, mid.roleAuthorization(['admin']), this.boostVotes.bind(this));
        router.post("/:id/boost-views", requireAuth, mid.roleAuthorization(['admin']), this.boostViews.bind(this));

        //Likes
        router.post("/:id/likers/:user", requireAuth, this.like.bind(this));
        router.delete("/:id/likers/:user", requireAuth, this.deleteLike.bind(this));

    }

    trackViews(req, res, next) {
        let threadId = req.params.id;
        let id = req.body.id;
        threadRepo.trackViews(threadId, id, (err, succeded) => {
            if (err) return next(err);
            res.json({});
        })
    }



    feature(req, res, next) {

        let threadId = req.params.id;
        threadRepo.feature(threadId, (err, succeded) => {
            if (err) return next(err);
            res.json({ succeded: succeded });
        })

    }


    boost(req, res, next) {

        let threadId = req.params.id;
        let likes = +req.body.likes;
        let user = req.user._id.toString();
        threadRepo.boost(threadId, user, likes, (err, succeded) => {
            if (err) return next(err);
            res.json({});
        })


    }

    editThread(req, res, next) {
        let threadId = req.params.id;
        let data = req.body;


        //ARREGLAR PARA LINKS

        if (req.body.title.length == 0 || !req.body.title.replace(/\s/g, '').length) {
            res.statusMessage = "Title can't be empty. Go to your profile to delete this post.";
            return res.status(429).end();
        }

        if (req.body.description) {
            if (req.body.description.length == 0 || !req.body.description.replace(/\s/g, '').length) {
                res.statusMessage = "Description can't be empty. Go to your profile to delete this post.";
                return res.status(429).end();
            }
        }

        delete data.userId;
        threadRepo.editThread(threadId, data, (err, thread) => {
            if (err) return next(err);
            res.json(thread);
        })
    }

    like(req, res, next) {
        let threadId = req.params.id;
        let user = req.user._id.toString();

        threadRepo.addLike(threadId, user, (err, thread) => {
            if (err) return next(err);
            res.json({});
        })
    }

    deleteLike(req, res, next) {
        let threadId = req.params.id;
        let user = req.user._id.toString();

        threadRepo.deleteLike(threadId, user, (err, thread) => {
            if (err) return next(err);
            res.json({});
        })


    }

    deleteThread(req, res, next) {

        let userId = req.user._id.toString();
        let isAdmin = req.user.role == "admin" ? true : null;
        threadRepo.deleteThread(isAdmin, userId, req.body, (err, succeded) => {
            if (err) return next(err);
            res.json({ succeded: succeded });
        })

    }

    getBookmarks(req, res, next) {

        let limit = 8;
        let skip = +req.query.skip;
        let userId = req.user._id;
       
        threadRepo.getBookmarks(userId, limit, skip, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })

    }

    getFollowingThreads(req, res, next) {

        let limit = req.query.limit ? +req.query.limit : 15;
        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }
        threadRepo.getFollowingThreads(req.user, league, leaguesForTop, limit, skip, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })

    }

    getFeatured(req, res, next) {


        let limit = req.query.limit ? +req.query.limit : 6;
        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        let limitDate = 1.296e+9

        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }
        

        console.log(limitDate)
        threadRepo.getFeatured(limitDate, userId, league, leaguesForTop, limit, skip, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })

    }

    getFeaturedForFeaturedPage(req, res, next) {


        let limit = req.query.limit ? +req.query.limit : 6;
        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        let limitDate = 2.592e+9;

        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }

        threadRepo.getFeatured(limitDate, userId, league, leaguesForTop, limit, skip, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })

    }

    

    getTeamThreads(req, res, next) {


        let limit = req.query.limit ? +req.query.limit : 6;
        let skip = +req.query.skip;
        let team = req.query.team;

       
        threadRepo.getTeamThreads(req.user._id, team, limit, skip, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })

    }

    searchThreads(req, res, next) {

        let limit = req.query.limit ? +req.query.limit : 6;
        let skip = +req.query.skip;
        let searchTerm = req.query.search;
       
       
        threadRepo.searchThreads(searchTerm, limit, skip, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })

    }

    getThreads(req, res, next) {



        let limit = req.query.limit ? +req.query.limit : 15;
        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        let userId = req.query.userId != undefined ? req.query.userId : null;

        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }

        threadRepo.getThreads(userId, league, leaguesForTop, limit, skip, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })

    }


    getNewestThreads(req, res, next) {

        let limit = req.query.limit ? +req.query.limit : 15;
        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }

        threadRepo.getNewestThreads(userId, leaguesForTop, league, limit, skip, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })

    }

    getTopThreads(req, res, next) {

        let limit = req.query.limit ? +req.query.limit : 15;
        let skip = +req.query.skip;
        let league = req.query.league;
        let leaguesForTop;
        let userId = req.query.userId != undefined ? req.query.userId : null;
        if (req.query.leagues != undefined) leaguesForTop = JSON.parse(req.query.leagues);
        else {
            leaguesForTop = null;
        }

        threadRepo.getTopThreads(userId, leaguesForTop, league, limit, skip, (err, threads) => {
            if (err) return next(err);
            res.json(threads);
        })

    }


    getLinks(req, res, next) {

        threadRepo.getLinks((err, links) => {
            if (err) return next(err);
            res.json(links);
        })

    }

    getDailyPoll(req, res, next) {

        threadRepo.getDailyPoll((err, polls) => {
            if (err) return next(err);

            res.json(polls);
        })

    }

    getThread(req, res, next) {

        let id = req.params.id;
    
        threadRepo.getThread(id, (err, thread) => {
            if (err) return next(err);
            res.json(thread);
        })

    }

    postThread(req, res, next) {

        let userId = req.user._id;


        if (req.body.title.length > 120) {
            var err = new Error('Title is more than 120 characters');
            err.status = 400;
            return next(err);
        }

      
        threadRepo.postThread(req.user.username, req.body, userId, (err, thread, customError) => {
            if (err) return next(err);
            if (customError) return res.json(({ thread: null, error: customError }));

            res.json({ thread: thread, error: null });
        })
    }

    postLinkThread(req, res, next) {

        let userId = req.user._id;

        if (req.body.titleL.length > 120) {
            var err = new Error('Title is more than 120 characters');
            err.status = 400;
            return next(err);
        }
        if ((req.body.titleL.search(/(\bamino|\bhardwood)/i) != -1)) {
            var err = new Error('Internal server error');
            err.status = 400;
            return next(err);
        }
        threadRepo.postLinkThread(req.body, userId, (err, thread, customError) => {
            if (err) return next(err);
            if (customError) return res.json(({ thread: null, error: customError }));
            res.json({ thread: thread, error: null });
        })


    }


    postDailyVote(req, res, next) {

        let id = req.body.poll._id;
        let vote = {
            user: req.user._id,
            option: req.body.option
        }
        let userId = req.user._id;
        threadRepo.postDailyVote(id, vote, userId, (err, poll) => {
            if (err) return next(err);
            res.json({});
        })

    }

    postVote(req, res, next) {

        let id = req.body.thread._id;
        let vote = {
            user: req.user._id,
            option: req.body.option
        }
        let userId = req.user._id;


        threadRepo.postVote(id, vote, userId, (err, thread) => {
            if (err) return next(err);
            res.json({});
        })

    }

    boostVotes(req, res, next) {

        let threadId = req.params.id;
        let numberOfVotes = +req.body.numberOfVotes;
        let user = req.user._id.toString();
        let option = req.body.option;

        threadRepo.boostVotes(threadId, user, numberOfVotes, option, (err, thread) => {
            if (err) return next(err);
            res.json({});
        })
    }

    addToBookmarks(req, res, next) {

        console.log('hola')
        let threadId = req.params.id;
        let userId = req.user._id;
        threadRepo.addToBookmarks(threadId, userId, (err, success) => {
            if (err) return next(err);
            res.json({success});
        })
    }

    deleteBookmark(req, res, next) {
        let threadId = req.params.id;
        let userId = req.user._id;
        threadRepo.deleteBookmark(threadId, userId, (err, success) => {
            if (err) return next(err);
            res.json({success});
        })
    }

    boostViews(req, res, next) {

        let threadId = req.params.id;
        let views = +req.body.views;

        threadRepo.boostViews(threadId, views, (err, thread) => {
            if (err) return next(err);
            res.json({});
        })

    }

    froalaS3Signature(req, res, next) {
        let folder = req.query['threadId']
        var configs = {
            // The name of your bucket.
            bucket: process.env.S3_BUCKET,

            region: 'us-west-1',

            // The folder where to upload the images.
            keyStart: 'froala/' + folder + '/',

            // File access.
            acl: 'public-read',

            // AWS keys.
            accessKey: process.env.AWS_ACCESS_KEY_ID,
            secretKey: process.env.AWS_SECRET_ACCESS_KEY
        }

        var s3Hash = FroalaEditor.S3.getHash(configs);

        res.send(s3Hash);

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
            Key: `threads/${fileName}`,
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
                url: `https://${S3_BUCKET}.s3.amazonaws.com/threads/${fileName}`
            };

            res.json(returnData);

        });

    }

    deleteS3(req, res, next) {

        let fileName = req.query['file-name'];
        var s3 = new aws.S3();
        var params = {
          Bucket: process.env.S3_BUCKET,
          Key: fileName
        };
        s3.deleteObject(params, function(err, data) {
          if (err) {
            console.log(err);
            res.json({success: false});
          } else {
            res.json({success: true});
          }
        });
          
    }

}

module.exports = ThreadController;