import { resolve } from 'path';
import { mkdir, writeFile } from 'fs';
import bluebird from 'bluebird';
import childProcess from "child_process";
const { promisify } = bluebird;
import { promisify as _promisify } from 'util';
const exec = _promisify(childProcess.exec);
import { spawn } from 'child_process';

const SUBMISSIONS_DIR = resolve("./submissions") //resolve(__dirname, '../submissions')

async function run({ userID, problemID, code, args, onStdout, onStderr, onExit }) {
  const problem_dir = resolve(SUBMISSIONS_DIR, problemID);
  const user_dir = resolve(problem_dir, userID);

  try {
    await promisify(mkdir)(SUBMISSIONS_DIR);
  } catch (e) {

  }

  try {
    await promisify(mkdir)(problem_dir);
  } catch (e) {

  }

  try {
    await promisify(mkdir)(user_dir);
  } catch (e) {

  }

  const main_file = resolve(user_dir, 'Main.java');
  await promisify(writeFile)(main_file, code);


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
  program.stdout.on('data', data => {
    if (!kill)
      onStdout(data)
  });
  program.stderr.on('data', data => {
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

async function check({ userID, problemID, code, input, output, onResult }) {
  var buffer = "";

  run({
    userID,
    problemID,
    code,
    args: input,
    onStdout: function (data) {
      buffer += data.toString();
    },
    onStderr: function (data) {
      var str = data.toString();

      if (str.includes("Picked up JAVA_TOOL_OPTIONS:"))
        return;
      buffer += str;
    },
    onExit: function () {
      // console.log(output);
      var ok = buffer.trim() === output.toString().trim();

      onResult(ok);
    }
  })
}

export {
  run, check
}
