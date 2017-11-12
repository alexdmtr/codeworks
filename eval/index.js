const db = require('../db')
const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const SUBMISSIONS_DIR = path.resolve(__dirname, '../submissions')

exports.run = async ({ userID, problemID, code, args }) => {
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
    const { stdout, stderr } = await exec('javac Main.java', {
      cwd: user_dir
    });

    return { stdout, stderr }
  }

  async function java(args) {
    const command = 'java -classpath . Main ' + args;
    console.log(command);
    const { stdout, stderr } = await exec(command, {
      cwd: user_dir
    });

    return { stdout, stderr }
  }

  try {
    await javac();
  }
  catch (e) {
    return {
      compileError: e
    }
  }

  var ms = endTime - startTime;


  var stdout, stderr;
  var startTime, endTime;
  startTime = (+ new Date());  
  try {
    const data = await java(args);
    endTime = (+ new Date());    
    stdout = data.stdout;
    stderr = data.stderr;    
  } catch (e) {
    return {
      runtimeError: e
    }
  }

  var ms = endTime - startTime;

  return { stdout, stderr, miliseconds: ms };
}