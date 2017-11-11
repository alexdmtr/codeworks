var admin = require("firebase-admin");

var serviceAccount = require("../secret/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://***REMOVED***.firebaseio.com"
});

var database = admin.database();
var ref = database.ref("/problems");
// console.log(ref);
ref.once('value', _data => {
    var data = _data.val()
    console.log(data)
})
return;
var Sequelize = require('sequelize')
var Promise = require('bluebird')

var sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    logging: false
})

var User = require('./user')(sequelize)

sequelize.seed = require('./seed')(sequelize)

module.exports = sequelize
