require('dotenv').config()
/* Add following environment variables in .env: */
let envVars = [
  "JWT_SECRET",
<<<<<<< HEAD
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY"
=======
>>>>>>> 38b4e03e0c548f678f8985e886fd5f63dd2e42dd
]

var assert = require('assert')

envVars.forEach(value => assert.ok(process.env[value], `${value} not set`))

var express = require('express')
var bodyParser = require('body-parser')
var expressJwt = require('express-jwt')
var morgan = require('morgan')
var winston = require('winston')
var jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
Promise = require('bluebird')
var jwtMiddleware = expressJwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false,
  getToken: function (req) {
    // console.log(req.cookies)
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies) {
      return req.cookies['access_token']
    }
    return null;
  },
})
const authorizeMiddleware = (req, res, next) => {
  if (!req.user) return res.sendStatus(401)
  next()
}
const viewAuthorizeMiddleware = (req, res, next) => {
  if (!req.user) return res.redirect('/login')
  res.locals.user = req.user;
  next()
}
var app = express()
app.use(cookieParser())
app.use(morgan('dev'))

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

// allow CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(express.static('public'))
var exphbs  = require('express-handlebars');
app.engine('hbs', exphbs({defaultLayout:'layout', extname:"hbs"}))
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

var apiRouter = express.Router()
var db = require('./db');
var authRouter = require('./routes/auth')
var usersRouter = require('./routes/users')

apiRouter.route('/auth')
  .post(authRouter.postAuth)


apiRouter.route('/users')
  .post(usersRouter.postUsers)

app.use('/api', apiRouter);

var rootRouter = express.Router();
var problemsRouter = require('./routes/problems')

rootRouter.route('/problems')
  .get(viewAuthorizeMiddleware, problemsRouter.getProblems);
rootRouter.route('/problems/:id')
  .get(viewAuthorizeMiddleware, problemsRouter.getProblem)
  .post(viewAuthorizeMiddleware, problemsRouter.postProblem)
rootRouter.route('/sandbox')
  .get(viewAuthorizeMiddleware, problemsRouter.getSandbox)

app.use('/', rootRouter);
app.get('/login', (req, res) => {
  res.render('login', {layout: false})
})
app.get('/register', (req, res) => {
  res.render('register', {layout: false})
})
app.get('/signout', (req, res) => {
  res.clearCookie('access_token')
  res.redirect('/login')
})
app.get('/', viewAuthorizeMiddleware, async (req, res) => {

  var obj = {
    numberOfProblems: await db.utils.getTotalProblems(),
    attemptedProblems: await db.utils.getAttemptedProblems(req.user.id),
    correctProblems: await db.utils.getCorrectProblems(req.user.id)
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


module.exports = app
