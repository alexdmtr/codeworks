import app from '../app.js'
import httpServer from "http";
import { Server } from "socket.io";
// var https = require('https')
var http = httpServer.Server(app)
import { createCertificate } from 'pem'
import winston from 'winston'
const port = process.env.PORT || 3000
import { run, check } from '../eval'
import { utils } from '../db'
var io = new Server(http);
import { authorize } from '@thream/socketio-jwt'
io.use(
  authorize({
    secret: process.env.JWT_SECRET,
    timeout: 5000
  })
);

io.on('connection', function (socket) {
  const user = socket.decodedToken;

  console.log(user.name + ' connected')
  socket.emit("authenticated");
  socket.on('save', async function ({ args, code, sandbox, problem }) {
    var problemName = sandbox ? 'sandbox' : problem;

    await utils.saveProblemCode({
      userID: user.id,
      problem: problemName,
      code,
      args
    });
    socket.emit('save:ok');
  })
  socket.on('run', async function ({ args, code, sandbox, problem }) {
    var problemName = sandbox ? 'sandbox' : problem;

    run({
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
        const problemData = await utils.getProblemData({
          problem: problemName
        });

        check({
          userID: user.id,
          problemID: problemName,
          code,
          input: problemData.inputs,
          output: problemData.output,
          onResult: async function (ok) {
            if (ok) {
              await utils.saveCorrectProblem({
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

createCertificate({
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
