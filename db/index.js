var admin = require("firebase-admin");
var bcrypt = require('bcrypt')
var serviceAccount = require("../secret/serviceAccountKey.json");
const saltRounds = 10;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://***REMOVED***.firebaseio.com"
});

var db = admin.database();

async function getList(path) {
  var snapshot = await db.ref(path).once('value')

  var data = []
  snapshot.forEach(kid => {
    data.push({
      key: kid.key,
      ...kid.val()
    });
  })

  return data;
}

async function getObj(path) {
  var snapshot = await db.ref(path).once('value')
  var obj = snapshot.val()

  obj.key = obj.key || snapshot.key

  return obj;
}
async function getProblemData({problem}) {
  console.log(problem)
  try {

    var problemSnapshot = await db.ref('/problems/'+problem).once('value')

    return {
      key: problemSnapshot.key,
      ...problemSnapshot.val()
    }
  } catch(e) {
    console.error(e);
    return null;
  }
}

async function getProblemCode({ userID, problem}) {
  try {
    var code = (await db.ref('/submissions/' + problem + '/' + userID + '/latest').once('value')).val()

    return code
  }
  catch (e) {
    console.error(e)
    return null
  }
}

async function saveProblemCode({ args, userID, problem, code }) {
  await db.ref('/submissions/' + problem + '/' + userID + '/latest/').set({
    timestamp: Date.now(),
    code,
    args
  })
}

async function getUser(username) {
  var users = await getList("/users")

  users = users.filter(user => user.username == username || user.email == username);

  if (users.length == 0) return false

  const user = users[0];

  return user
}


async function login({ username, password }) {

  const user = await getUser(username)

  if (!user) return false

  const passwordOK = await bcrypt.compare(password, user.password)

  if (passwordOK)
    return user
  return false
}


const hashPassword = async (user) => {
  const hash = await bcrypt.hash(user.password, saltRounds)
  user.password = hash
}

async function register({ email, username, name, password }) {
  if (await getUser(username))
    throw new Error("Username already used");

  let user = {email, username, name, password};
  await hashPassword(user)
  await db.ref("/users").push(user)

  return true
}

async function getTotalProblems() {
  // console.log('fuck you')
  var tree = await getList('/problems')
  // console.log(tree!=null)
  return Object.keys(tree).length
}

async function getAttemptedProblems(userID) {
  var tree = await getList('/submissions')
  var cnt = 0;
  Object.keys(tree).forEach(problemKey =>  {
    if (tree[problemKey][userID])
      cnt++;
  })

  return cnt;
}
async function getCorrectProblems(userID) {
  var tree = await getList('/submissions')
  var cnt = 0;
  Object.keys(tree).forEach(problemKey =>  {
    if (tree[problemKey][userID])
      if (tree[problemKey][userID].correct)
        cnt++;
  })

  return cnt;
}
db.utils = {
  getList, getObj, saveProblemCode, login, register, getUser,
  getProblemCode, getProblemData,
  getTotalProblems, getCorrectProblems, getAttemptedProblems
}
module.exports = db;