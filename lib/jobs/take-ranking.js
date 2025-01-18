var Take = require('../../models/take');


module.exports = function(agenda) {

    agenda.define('update take ranking all', (job, done) => {

            Take.find({date: {$gte: new Date(Date.now() - 1.296e+8)}}, {likers: 1, replies: 1, ranking: 1, rankingTop: 1, date:1, take: 1, user: 1})//36 hrs
                .exec((err, takes) => {

                    console.log('hola')
              
                    var bulkUpdateCallback = function (err, r) {
                        
                    }
                    // Initialise the bulk operations array
                    var bulkUpdateOps = [],
                        counter  = 0;

                    takes.forEach(function (take) {
                        let l = +take.likers.length - 1
                        let c = +take.replies;
                        let tc = +(Date.now() - new Date(take.date).getTime()) / 3.6e+6;
                        let power = l > 50 ? 1.7 : 1.5;
                        let ranking = (l + (0.025 * c)) / (Math.pow(tc + 2, power));
                        if(take.user.toString() == "5dc1d716bbada600046cef23" || take.user.toString() == "5dbf7f05738d7e0004d9d5e9" || take.user.toString() == "5c8361859a674300041c294b" || take.user.toString() == "5dd95b9cc34cb000041b2a9e" || take.user.toString() == "5dea75ffa94a760004c94e52" || take.user.toString() == "5de9c823a94a760004c949a1" || take.user.toString() == "5e1329698f08940004a3a4ee" ){ //clowiin jayballer24
                            ranking = 0; 
                           
                        }

                    
                        let rankingTop = l + (0.025 * c);       
                        bulkUpdateOps.push({
                            "updateOne": {
                                "filter": { "_id": take._id },
                                "update": { "$set": { "ranking": ranking, "rankingTop": rankingTop} }
                            }
                        });
                        counter++;
                        if (counter % 500 == 0) {
                            // Get the underlying collection via the native node.js driver collection object
                            Take.collection.bulkWrite(bulkUpdateOps, { "ordered": true, w: 1 }, bulkUpdateCallback);
                            bulkUpdateOps = []; // re-initialize
                        }
                    })

                    if (counter % 500 != 0) { Take.collection.bulkWrite(bulkUpdateOps, { "ordered": true, w: 1 }, done); }
                    else {
                        done();
                    }
                   
                })
             }); 
    
  };

