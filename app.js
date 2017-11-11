require('dotenv').config()
/* Add following environment variables in .env: */
let envVars = [
  // "DB_HOST",
  // "DB_NAME",
  // "DB_DIALECT", // 'postgres' 
  // "DB_USERNAME",
  "JWT_SECRET",
  // "ROOT_USERNAME",
  // "ROOT_PASSWORD",
] 
/* Optional:
  "DB_PASSWORD"
*/

var assert = require('assert')

envVars.forEach(value => assert.ok(process.env[value], `${value} not set`))

var express = require('express')
var bodyParser = require('body-parser')
var expressJwt = require('express-jwt')
var morgan = require('morgan')
var winston = require('winston')
var jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
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

app.use(jwtMiddleware)

var apiRouter = express.Router()
var db = require('./db');
var authRouter = require('./routes/auth')
var usersRouter = require('./routes/users')

apiRouter.route('/auth')
  .post(authRouter.postAuth)


apiRouter.route('/users')
  .post(usersRouter.postUsers)

// apiRouter.route('/users/:userId')
//   .put(authorizeMiddleware, usersRouter.putUser)
//   .delete(authorizeMiddleware, usersRouter.deleteUser)
//   .get(authorizeMiddleware, usersRouter.getUser)
app.use('/api', apiRouter);

var rootRouter = express.Router();
var problemsRouter = require('./routes/problems')

rootRouter.route('/problems')
  .get(viewAuthorizeMiddleware, problemsRouter.getProblems);
rootRouter.route('/problems/:id')
  .get(viewAuthorizeMiddleware, problemsRouter.getProblem)
  .post(viewAuthorizeMiddleware, problemsRouter.postProblem)
rootRouter.route('/sandbox')
  .get(problemsRouter.getSandbox)

app.use('/', rootRouter);
app.get('/login', (req, res) => {
  res.render('login', {layout: false})
})
app.get('/register', (req, res) => {
  res.render('register', {layout: false})
})
app.get('/', viewAuthorizeMiddleware, (req, res) => {
  res.render('home')
})


// app.use(function (err, req, res, next) {
//   if (err.name === 'UnauthorizedError') {
//     //   res.status(401).send('invalid token...')
//     // console.log("Unauthorized!")
//     // res.redirect('/login');
//   } else
//     next(err)
// });

module.exports = app