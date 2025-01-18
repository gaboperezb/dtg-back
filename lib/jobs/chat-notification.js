var fcm = require('../fcm');

module.exports = function(agenda) {

    agenda.define('chat notification', (job, done) => {

        for (const key in job.attrs.data.playerIds) {
            if (job.attrs.data.playerIds.hasOwnProperty(key)) {
                const element = job.attrs.data.playerIds[key];
                job.attrs.data.notification.notification.badge = key;
                //console.log(element, job.attrs.data.notification)
                fcm.admin.messaging().sendToDevice(element, job.attrs.data.notification)
                .then((response) => {
                    // Response is a message ID string.
                    //console.log('Successfully sent message:');
                    done();
                })
                .catch((error) => {
                    //console.log('Error sending message:', error);
                    done();
                });
                
            }
        }
        
    })
    
  };