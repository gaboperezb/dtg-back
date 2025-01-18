const User = require('../../models/user');
var fcm = require('../fcm');

function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}


module.exports = function (agenda) {

    agenda.define('hot-nba', (job, done) => {
        console.log('corriendo en este momento el algoritmo')
        User.find({ "leagues": "NCAAB", "playerIds.0": { $exists: true } }, {playerIds: 1})
            .exec((err, users) => {
                
                if (err) {
                    console.log(err);
                    return;
                }
                let playerIds = users.map(e => {
                    return e.playerIds;
                })
                let playerIdsFlatten = flatten(playerIds);
                let counter = 0
                let fcmTokens = [];
                
                playerIdsFlatten.forEach(token => {

                    fcmTokens.push(token);
                    counter++;
                    if (counter % 1000 == 0) {
                        console.log(counter);
                        fcm.admin.messaging().subscribeToTopic(fcmTokens, "NCAAB")
                            .then(function (response) {
                                // See the MessagingTopicManagementResponse reference documentation
                                // for the contents of response.
                                  
                            })
                            .catch(function (error) {
                                
                            }); 
                            fcmTokens = []; 
                    }

                });

                if (counter % 1000 != 0) {

                    fcm.admin.messaging().subscribeToTopic(fcmTokens, "NCAAB")
                            .then(function (response) {
                                // See the MessagingTopicManagementResponse reference documentation
                                // for the contents of response.

                                
                                
                                done(); 
                            })
                            .catch(function (error) {
                                
                            }); 
                    
                } else {
                    done();
                }

            })

    });

};

