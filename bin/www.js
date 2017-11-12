const app = require('../app')
// var https = require('https')
var http = require('http').Server(app)
var pem = require('pem')
var winston = require('winston')
const port = process.env.PORT
const eval = require('../eval')
const db = require('../db')
var io = require('socket.io')(http);
const socketioJwt = require('socketio-jwt');
io.on('connection', socketioJwt.authorize({
  secret: process.env.JWT_SECRET,
})).on('authenticated', function (socket) {
  const user = socket.decoded_token;

  console.log(user.name + ' connected')
  socket.on('save', async function({args, code, sandbox, problem}) {
    var problemName = sandbox ? 'sandbox': problem;
    
    await db.utils.saveProblemCode({
      userID: user.id,
      problem: problemName,
      code,
      args
    });
    socket.emit('save:ok');
  })
  socket.on('run', async function({args, code, sandbox, problem}) {
    var problemName = sandbox ? 'sandbox': problem;

    if (!sandbox) {
      const problemData = await db.utils.getProblemData({
        problem: problemName
      });

      args = problemData.inputs || "";
    }

    // console.log(code);

    // console.log(code, args, problemName)
    // const { runtimeError, compileError, stdout, stderr, miliseconds } = await eval.run({
    //   userID: user.id,
    //   problemID: problemName,
    //   code,
    //   args
    // })
    eval.run({
        userID: user.id,
        problemID: problemName,
        code,
        args,
        onStdout: onStdout,
        onStderr: onStderr,
        onExit: exit
    })

    function onStdout(data) {
      socket.emit('run:stdout', data.toString());
    }

    function onStderr(data) {
      socket.emit('run:stderr', data.toString())
    }

    function exit(data) {
      socket.emit('run:done', data);
    }

  })

  socket.on('disconnect', function () {
    console.log(user.name + ' disconnected');
  })
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