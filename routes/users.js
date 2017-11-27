// var User = require('../models').models.user
var db = require('../db')

exports.postUsers = async (req, res) => {
  try {
    const user = await db.utils.register(req.body)
    res.status(201).json(user)
  }
  catch (err) {
    console.error(err)
    res.status(400)
  }
}
