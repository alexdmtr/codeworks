const db = require('../db')
const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawn = require('child_process').spawn;

const SUBMISSIONS_DIR = path.resolve(__dirname, '../submissions')

async function run({ userID, problemID, code, args, onStdout, onStderr, onExit }) {
  const problem_dir = path.resolve(SUBMISSIONS_DIR, problemID);
  const user_dir = path.resolve(problem_dir, userID);

  try {
    await Promise.promisify(fs.mkdir)(SUBMISSIONS_DIR);
  } catch (e) {

  }

  try {
    await Promise.promisify(fs.mkdir)(problem_dir);
  } catch (e) {

  }

  try {
    await Promise.promisify(fs.mkdir)(user_dir);
  } catch (e) {

  }

  const main_file = path.resolve(user_dir, 'Main.java');
  await Promise.promisify(fs.writeFile)(main_file, code);


  async function javac() {
    const { stdout, stderr } = await exec('javac -g Main.java', {
      cwd: user_dir
    });

    return { stdout, stderr }
  }

  try {
    await javac();
  }
  catch (e) {
    return onExit({
      compilerError: e
    })
  }

  var ms = endTime - startTime;


  var stdout, stderr;
  var startTime, endTime;

  // const command = 'java -classpath . Main ' + args;
  
  var program = spawn('java', ['-classpath', '.', 'Main', ...args.split(' ')], {
    cwd: user_dir
  });

  startTime = (+ new Date()); 
  var kill = false;
  setInterval(() => {
    kill = true;
    program.kill(9);
  }, 5000) // kill after 5 seconds
  program.stdout.on('data', data=> {
    if (!kill)
      onStdout(data)
  });
  program.stderr.on('data', data=> {
    if (!kill)
      onStderr(data);
  });
  program.on('exit', code => {
    console.log('exiting')
    endTime = (+ new Date());
    var ms = endTime - startTime;

    onExit({
      kill,
      code,
      miliseconds: ms
    })
  });



  // try {
  //   const data = await java(args);
  //   endTime = (+ new Date());    
  //   stdout = data.stdout;
  //   stderr = data.stderr;    
  // } catch (e) {
  //   return {
  //     runtimeError: e
  //   }
  // }

  // var ms = endTime - startTime;

  // return { stdout, stderr, miliseconds: ms };
}

async function check({ userID, problemID, code, input, output, onResult}) {
  var buffer = "";
  
  run({
    userID,
    problemID,
    code,
    args: input,
    onStdout: function(data) {
      buffer += data.toString();
    },
    onStderr: function(data) {
      buffer += data.toString()
    },
    onExit: function() {
      // console.log(output);
      var ok = buffer.trim() === output.toString().trim();

      onResult(ok);
    }
  })
}

module.exports = {
  run, check
}