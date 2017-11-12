const db = require('../db')
const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const SUBMISSIONS_DIR = path.resolve(__dirname, '../submissions')

exports.run = async ({ userID, problemID, code }) => {
  const problem_dir = path.resolve(SUBMISSIONS_DIR, problemID);
  const user_dir = path.resolve(problem_dir, userID);

  try {
    await Promise.promisify(fs.mkdir)(SUBMISSIONS_DIR);
    await Promise.promisify(fs.mkdir)(problem_dir);
    await Promise.promisify(fs.mkdir)(user_dir);
  } catch (e) {

  }

  const main_file = path.resolve(user_dir, 'Main.java');
  console.log(problem_dir, user_dir, main_file)
  await Promise.promisify(fs.writeFile)(main_file, code);


  async function javac() {
    const { stdout, stderr } = await exec('javac Main.java', {
      cwd: user_dir
    });

    return { stdout, stderr }
  }

  async function java() {
    const { stdout, stderr } = await exec('java -classpath . Main', {
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
  const { stdout, stderr } = await java();

  return { stdout, stderr };
}