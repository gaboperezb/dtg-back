var RateLimit = require('express-rate-limit');
var MongoStore = require('rate-limit-mongo');

var limiter = new RateLimit({
    store: new MongoStore({
        uri: "mongodb://gabrielprzb:manutdgb7@ds115873-shard-00-00-lnmct.mongodb.net:27017,ds115873-shard-00-01-lnmct.mongodb.net:27017,ds115873-shard-00-02-lnmct.mongodb.net:27017/discussthegame?ssl=true&replicaSet=ds115873-shard-0&authSource=admin&retryWrites=true&w=majority"
      
    }),
    max: 2, // 2 posts
    windowMs: 20 * 60 * 1000,  //20 minutes. 
    handler: (req, res, next) => {
    res.statusMessage = "You've created too many posts in a short period of time, please try again in a few minutes.";
    return res.status(429).end();
    }
  });


module.exports = limiter;