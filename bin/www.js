const app = require('../app')
// var https = require('https')
var http = require('http').Server(app)
var pem = require('pem')
var winston = require('winston')
const port = process.env.PORT
const eval = require('../eval')
const db = require('../db')
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('save', function({userID, problemID, code}) {
    // db.utils.saveProblemCode()
    eval.compile({userID, problemID, code})
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
pem.createCertificate({
  days: 1,
  selfSigned: true
}, function (err, keys) {

  // var server = require('socket.io')(http);
  http.listen(port, () => {
    winston.info(`http listening on ${port}`);
  })
  // https.createServer({
  //     key: keys.serviceKey,
  //     cert: keys.certificate
  //   }, app)
  //   .listen(port, () => {
  //     winston.info(`https listening on ${port}`)
  //   });

});