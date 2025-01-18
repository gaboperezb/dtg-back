var fcm = require('../fcm');

module.exports = function(agenda, notification) {

    agenda.define('user notification', (job, done) => {
        fcm.admin.messaging().sendToDevice(job.attrs.data.playerIds, job.attrs.data.notification)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:');
                    done();
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                    done();
                });
    })
    
  };