var Trivia = require('../../models/trivia');


module.exports = function(agenda) {

    agenda.define('update trivia ranking all', (job, done) => {

            Trivia.find({})//48 hrs
                .exec((err, trivias) => {
                    var bulkUpdateCallback = function (err, r) {
                        
                    }
                    // Initialise the bulk operations array
                    var bulkUpdateOps = [],
                        counter = 0;

                    trivias.forEach(function (trivia) {
                        let l = +trivia.likers.length - 1;
                        let v = +trivia.userViews.length;
                        let tc = +(Date.now() - new Date(trivia.date).getTime()) / 3.6e+6;
                        let ranking = (l + (0.2 * v)) / (Math.pow(tc + 2, 1.5));
                        let rankingTop = l + (0.2 * v);
                        bulkUpdateOps.push({
                            "updateOne": {
                                "filter": { "_id": trivia._id },
                                "update": { "$set": { "ranking": ranking, "rankingTop": rankingTop} }
                            }
                        });
                        counter++;
                        if (counter % 500 == 0) {
                            // Get the underlying collection via the native node.js driver collection object
                            Trivia.collection.bulkWrite(bulkUpdateOps, { "ordered": true, w: 1 }, bulkUpdateCallback);
                            bulkUpdateOps = []; // re-initialize
                        }
                    })

                    if (counter % 500 != 0) { Trivia.collection.bulkWrite(bulkUpdateOps, { "ordered": true, w: 1 }, done); }
                    else {
                        done();
                    }
                   
                })
             }); 
    
  };

