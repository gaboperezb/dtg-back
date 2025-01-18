

class FCMRepository {

    constructor() {
        this.admin = require("firebase-admin");
        this.activate();
    }

    activate() {

        var serviceAccount = require("../discuss-thegame-b7338-firebase-adminsdk-64kb8-06ffdc3447.json");

        this.admin.initializeApp({
          credential: this.admin.credential.cert(serviceAccount),
          databaseURL: "https://discuss-thegame-b7338.firebaseio.com"
        });

    }

    
}

module.exports = new FCMRepository();

