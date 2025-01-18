const Agenda = require('agenda');
//var mongodbUri = "mongodb://gabrielprzb:manutdgb7@ds115873-shard-00-00-lnmct.mongodb.net:27017,ds115873-shard-00-01-lnmct.mongodb.net:27017,ds115873-shard-00-02-lnmct.mongodb.net:27017/discussthegame?ssl=true&replicaSet=ds115873-shard-0&authSource=admin&retryWrites=true&w=majority";
const connectionOpts = {db: {address:  "mongodb://gabrielprzb:manutdgb7@ds115873-shard-00-00-lnmct.mongodb.net:27017,ds115873-shard-00-01-lnmct.mongodb.net:27017,ds115873-shard-00-02-lnmct.mongodb.net:27017/discussthegame?ssl=true&replicaSet=ds115873-shard-0&authSource=admin&retryWrites=true&w=majority"}};

const agenda = new Agenda(connectionOpts);

const jobTypes = ['chat-notification','notification'];

jobTypes.forEach(type => {
  require('./jobs/' + type)(agenda);
});

if (jobTypes.length) {
  
  // IIFE to give access to async/await
      (async function() { // IIFE to give access to async/await
        console.log('asd')
        await agenda.start();
        //await agenda.every('22 seconds', 'hot-nba');
       /*await agenda.every('10 minutes', 'update ranking');
        await agenda.every('2 hour and 1 minute', 'update ranking all');
        await agenda.every('11 minutes', 'update take ranking');
        await age nda.every('2 hour and 2 minute', 'update take ranking all') */
        
        
})();
  
}

module.exports = agenda;