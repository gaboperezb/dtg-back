var Thread = require('../../models/thread');
var hide = ["5ef775d554f8470004a761e9","5e979c647df03e0004365772","5df5a0cf8afb3700049a3639","5c8361859a674300041c294b", "5de3281fb3664c00045b4927", "5ce9eba28c18b100044ad52d" ]


module.exports = function(agenda) {
    
    console.log('uiui')
    agenda.define('update ranking', (job, done) => {

        console.log('uiui')

            Thread.find({date: {$gte: new Date(Date.now() - 1.296e+8)}}, {likers: 1, replies: 1, views:1, ranking: 1, rankingTop: 1, date:1, title: 1, user: 1})//36 hrs
                .exec((err, threads) => {

                    console.log(threads.length)
              
                    var bulkUpdateCallback = function (err, r) {
                        
                    }
                    // Initialise the bulk operations array
                    var bulkUpdateOps = [],
                        counter  = 0;

                    threads.forEach(function (thread) {
                        let l = +thread.likers.length - 1
                        let c = +thread.replies;
                        let v = +thread.views;
                        let tc = +(Date.now() - new Date(thread.date).getTime()) / 3.6e+6;
                        let power = l > 50 ? 1.7 : 1.5;
                        let ranking = (l + (0.025 * c)) / (Math.pow(tc + 2, power));
                        let rankingTop = l + (0.025 * c);
                       
                        if(hide.some(u => u == thread.user.toString())){
                            ranking = 0;
                            rankingTop = 0;
                            console.log('hided')
                        }

                        bulkUpdateOps.push({
                            "updateOne": {
                                "filter": { "_id": thread._id },
                                "update": { "$set": { "ranking": ranking, "rankingTop": rankingTop} }
                            }
                        });
                        counter++;
                        if (counter % 500 == 0) {
                            // Get the underlying collection via the native node.js driver collection object
                            Thread.collection.bulkWrite(bulkUpdateOps, { "ordered": true, w: 1 }, bulkUpdateCallback);
                            bulkUpdateOps = []; // re-initialize
                        }
                    })

                    if (counter % 500 != 0) { Thread.collection.bulkWrite(bulkUpdateOps, { "ordered": true, w: 1 }, done); }
                    else {
                        done();
                    }
                   
                })
             }); 
    
  };

