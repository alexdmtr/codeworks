var data = require('./seed.data');
var assert = require('assert');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function (sequelize) {
  const User = sequelize.models.user

  return async () => {
    const rootUser = await User.create({
      username: process.env.ROOT_USERNAME,
      password: process.env.ROOT_PASSWORD,
      email: 'root@root.com'
    })


    const users = await Promise.map(data.users, (user) => {
      return User.create({
        username: user.username,
        password: user.password,
        email: user.email
      })
    })
  }
}