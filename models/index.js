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
