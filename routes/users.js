var User = require('../models').models.user

exports.postUsers = async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  }
  catch (err) {
    consle.error(err)
    res.status(400)
  }
}

// add endpoint for PUT on api/users/{userId}
exports.putUser = function (req, res) {
  let userId = req.params.userId

  if (userId != req.user.id) return res.status(401).send()

  let user = req.body
  User
    .update(user, {
      where: {
        id: userId
      },
      returning: true
    })
    .then(function (result) {
      res.sendStatus(200)//.json(result[1][0])
    })
    .catch(function (err) {
      throw err

      res.send(err)
    })
}

// add endpoint for DELETE on api/users/{userId}
exports.deleteUser = function (req, res) {
  let userId = req.params.userId

  if (userId != req.user.id) return res.status(401).send()

  User
    .destroy({
      where: {
        id: userId
      }
    })
    .then(function (result) {
      res.status(200).json({
        message: 'User deleted succesfuly'
      })
    })
    .catch(function (err) {
      throw err

      res.end(err)
    })
}

// add endpoint for GET on api/users/{userId}
exports.getUser = function (req, res) {
  let userId = req.params.userId

  if (userId != req.user.id) return res.status(401).send()
  User
    .findById(userId)
    .then((result) => {
      res.status(200).json({
        email: result.email,
        id: result.id,
        username: result.username
      })
    })
    .catch((err) => {
      res.status(404).send(err)
    })
}