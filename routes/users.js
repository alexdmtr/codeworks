// var User = require('../models').models.user
import db from "../db";

export async function postUsers(req, res) {
  try {
    const user = await db.utils.register(req.body)
    res.status(201).json(user)
  }
  catch (err) {
    console.error(err)
    res.status(400)
  }
}
