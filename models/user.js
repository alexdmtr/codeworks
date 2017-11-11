const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const saltRounds = 10;
var Promise = require('bluebird')

const hashPassword = async (user) => {
  const hash = await bcrypt.hash(user.password, saltRounds)
  user.password = hash
}

module.exports = function (sequelize) {
  var User = sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: Sequelize.STRING(256),
      unique: true,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(256),
      unique: true,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING(256),
      allowNull: false
    },
  }, {
      timestamps: false,
      hooks: {
        beforeCreate: function (user) {
          if (user.changed('password'))
            return hashPassword(user)
        },
        beforeSave: function (user) {
          if (user.changed('password'))
            return hashPassword(user)
        },
        beforeBulkCreate: function (instances) {
          var tasks = instances.map(function (instance) {
            return hashPassword(instance)
          })

          return Promise.all(tasks)
        }
      }
    })
  return User
}