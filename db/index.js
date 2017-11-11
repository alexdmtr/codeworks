var admin = require("firebase-admin");

var serviceAccount = require("../secret/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://***REMOVED***.firebaseio.com"
});

var database = admin.database();
// var ref = database.ref("/problems");
// console.log(ref);
// ref.once('value', _data => {
//     var data = _data.val()
//     console.log(data)
// })

module.exports = database;