var passport = require('passport');
var User = require('../models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var LocalStrategy = require('passport-local').Strategy;
 
var localOptions = {
    usernameField: 'email'
};
 
var localLogin = new LocalStrategy(localOptions, function(email, password, done){

    User.authenticate(email, password, function(err, errMessage, user){
        if(err){
            return done(err);
        }
        if(errMessage){
            return done(null, false, {error: errMessage} );
        }

        return done(null, user);

    });
    
});
 
var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: "asd"
};
 
var jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
 
    User.findById(payload._id, function(err, user){
 
        if(err){
            return done(err, false);
        }
 
        if(user){
            done(null, user);
        } else {
            done(null, false);
        }
 
    });
 
});

passport.use(new FacebookTokenStrategy({
    clientID: '1917714931892020',
    clientSecret: '2e010649aef3ccecd5211a94d2d59028',
    passReqToCallback: true
  },
  function (req, accessToken, refreshToken, profile, done) {
    User.upsertFbUser(req, accessToken, refreshToken, profile, function(err, user) {
        
      return done(err, user);
    });
  }));
passport.use(jwtLogin);
passport.use(localLogin);