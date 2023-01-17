import "dotenv/config.js";

/* Add following environment variables in .env: */
let envVars = [
  "JWT_SECRET",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY"
]

import { ok } from 'assert'

envVars.forEach(value => ok(process.env[value], `${value} not set`))

import express, { Router } from 'express'
import bodyParser from 'body-parser'
const { urlencoded, json } = bodyParser;
import { expressjwt as expressJwt } from 'express-jwt'
import morgan from 'morgan'
import winston from 'winston'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import Promise from "bluebird"
var jwtMiddleware = expressJwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false,
  getToken: function (req) {
    console.log(req.cookies)
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies) {
      return req.cookies['access_token']
    }
    return null;
  },
  requestProperty: "user",
  algorithms: ['HS256']
})
const authorizeMiddleware = (req, res, next) => {
  if (!req.user) return res.sendStatus(401)
  next()
}
const viewAuthorizeMiddleware = (req, res, next) => {
  // console.log("req", req);
  if (!req.user) return res.redirect('/login')
  res.locals.user = req.user;
  next()
}
var app = express()
app.use(cookieParser())
app.use(morgan('dev'))

app.use(urlencoded({
  extended: true
}))
app.use(json())

// allow CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(express.static('public'))
import { engine } from 'express-handlebars'
app.engine('hbs', engine({ defaultLayout: 'layout', extname: "hbs" }))
app.set('view engine', 'hbs')

app.use(jwtMiddleware);
app.use((err, req, res, next) => {
  if (err.status === 401) {
    req.user = null;
    next();
  }
  else
    next(err);
})

var apiRouter = Router()
import { utils } from './db'
import { postAuth } from './routes/auth'
import { postUsers } from './routes/users'

apiRouter.route('/auth')
  .post(postAuth)


apiRouter.route('/users')
  .post(postUsers)

app.use('/api', apiRouter);

var rootRouter = Router();
import { getProblems, getProblem, postProblem, getSandbox } from './routes/problems'

rootRouter.route('/problems')
  .get(viewAuthorizeMiddleware, getProblems);
rootRouter.route('/problems/:id')
  .get(viewAuthorizeMiddleware, getProblem)
  .post(viewAuthorizeMiddleware, postProblem)
rootRouter.route('/sandbox')
  .get(viewAuthorizeMiddleware, getSandbox)

app.use('/', rootRouter);
app.get('/login', (req, res) => {
  res.render('login', { layout: false })
})
app.get('/register', (req, res) => {
  res.render('register', { layout: false })
})
app.get('/signout', (req, res) => {
  res.clearCookie('access_token')
  res.redirect('/login')
})
app.get('/', viewAuthorizeMiddleware, async (req, res) => {

  var obj = {
    numberOfProblems: await utils.getTotalProblems(),
    attemptedProblems: await utils.getAttemptedProblems(req.user.id),
    correctProblems: await utils.getCorrectProblems(req.user.id)
  };

  obj.leftProblems = obj.numberOfProblems - obj.correctProblems;
  res.render('home', {
    pageName: 'Home',
    page: {
      home: true
    },
    ...obj
  })
})


export default app
