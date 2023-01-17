import db from "../db";
import jsonwebtoken from 'jsonwebtoken'
const { sign } = jsonwebtoken;
import bcrypt from 'bcrypt'

// add endpoint for POST on /api/auth
// should receive username and password
export async function postAuth(req, res) {

  let { username, password } = req.body
  try {

    const user = await db.utils.login({ username, password })

    if (!user)
      return res.status(401).json({ message: 'Authentication failed' })

    function sendToken() {
      const token = sign({
        username: user.username,
        name: user.name,
        id: user.key,
        email: user.email
      }, process.env.JWT_SECRET)

      const d = new Date()
      d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days


      res.cookie('access_token', token, { expires: d })
      res.status(200).json({
        jwt: token, user: {
          id: user.id,
          username: user.username
        }
      })
    }

    return sendToken()
  }
  catch (err) {
    res.status(401).send(err)
    console.error(err)
  }
}

