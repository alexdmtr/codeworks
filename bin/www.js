const app = require('../app')
// var https = require('https')
var http = require('http').Server(app)
var pem = require('pem')
var winston = require('winston')
const port = process.env.PORT || 3000
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

    eval.run({
        userID: user.id,
        problemID: problemName,
        code,
        args,
        onStdout: onStdout,
        onStderr: onStderr,
        onExit: exit
    })

    var numDataChunks = 0;

    function onStdout(data) {
      numDataChunks += 1;
      var str = data.toString();

      socket.emit('run:stdout', str);
    }

    function onStderr(data) {
      var str = data.toString();

      if (str.includes("Picked up JAVA_TOOL_OPTIONS:"))
        return;
      socket.emit('run:stderr', str)
    }

    async function exit(data) {
      socket.emit('run:done', data);

      if (!sandbox) {
        const problemData = await db.utils.getProblemData({
          problem: problemName
        });

        eval.check({
          userID: user.id,
          problemID: problemName,
          code,
          input: problemData.inputs,
          output: problemData.output,
          onResult: async function (ok) {
            if (ok) {
              await db.utils.saveCorrectProblem({
                userID: user.id,
                problemID: problemName
              })
            }

            socket.emit('submit:result', ok);
          }
        })
      }

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
