var User  = require('../models/user');

//Prevent users to access certain pages is they are logged out
function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error('You need to be logged in to access this feature');
        err.status = 400;
        return next(err);
    }
}

function requiresAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    } else {
        var err = new Error("You don't have permission");
        err.status = 400;
        return next(err);
    }
}


exports.roleAuthorization = function(roles){
 
    return function(req, res, next){
 
        var user = req.user;
 
        User.findById(user._id, function(err, foundUser){
 
            if(err){
                res.status(422).json({error: 'No user found.'});
                return next(err);
            }
 
            if(roles.indexOf(foundUser.role) > -1){
                return next();
            }
 
            res.status(401).json({error: 'You are not authorized to view this content'});
            return next('Unauthorized');
 
        });
 
    }
 
}


function deleteAuthorization(req, res, next) {
    var user = req.user;
        
        if(user._id.toString() == req.body.userId || user.role == "admin") {
            
            return next();
        }


        return next('Unauthorized');
 

}






function checkUserState(req, res, next) {
    if(req.session && req.session.userId) {
        var err = new Error("You can't access this page");
        err.status = 400;
        return next(err);
    }
    return next();

}


module.exports.requiresLogin = requiresLogin;
module.exports.requiresAdmin = requiresAdmin;
module.exports.checkUserState = checkUserState;
module.exports.deleteAuthorization = deleteAuthorization;