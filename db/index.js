// import * as admin from "firebase-admin";
import admin from "firebase-admin"
import { compare, hash as _hash } from 'bcrypt';
const saltRounds = 10;
admin.initializeApp({
  credential: admin.credential.cert({
    "projectId": process.env.FIREBASE_PROJECT_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "clientEmail": process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: "https://codeworks-91683-default-rtdb.europe-west1.firebasedatabase.app/"
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
async function getProblemData({ problem }) {
  console.log(problem)
  try {

    var problemSnapshot = await db.ref('/problems/' + problem).once('value')

    return {
      key: problemSnapshot.key,
      ...problemSnapshot.val()
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function getProblemCode({ userID, problem }) {

  return db.ref(`submissions/${problem}/${userID}/latest`)
    .once('value')
    .then(snapshot => {
      return snapshot.val()
    })
    .catch(err => {
      console.error(err)
      return null
    })
}

async function saveProblemCode({ args, userID, problem, code }) {
  await db.ref(`/submissions/${problem}/${userID}/latest/`).set({
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

  const passwordOK = await compare(password, user.password)

  if (passwordOK)
    return user
  return false
}


const hashPassword = async (user) => {
  const hash = await _hash(user.password, saltRounds)
  user.password = hash
}

async function register({ email, username, name, password }) {
  if (await getUser(username))
    throw new Error("Username already used");

  let user = { email, username, name, password };
  await hashPassword(user)
  await db.ref("/users").push(user)

  return true
}

async function getTotalProblems() {
  var tree = await getList('/problems')
  return Object.keys(tree).length
}

async function getAttemptedProblems(userID) {
  var tree = await getList('/submissions')
  var cnt = 0;
  Object.keys(tree).forEach(problemKey => {
    if (tree[problemKey][userID])
      cnt++;
  })

  return cnt;
}
async function isProblemCorrect({ userID, problemID }) {
  return db.ref(`/submissions/${problemID}/${userID}/solved`)
    .once('value')
    .then(ss => ss.val() != null)
}

async function isProblemAttempted({ userID, problemID }) {
  return db.ref(`/submissions/${problemID}/${userID}`)
    .once('value')
    .then(ss => ss.val() != null)
}

async function getCorrectProblems(userID) {
  var tree = await getList('/submissions')
  var cnt = 0;
  Object.keys(tree).forEach(problemKey => {
    if (tree[problemKey][userID])
      if (tree[problemKey][userID].solved)
        cnt++;
  })

  return cnt;
}

async function saveCorrectProblem({ userID, problemID }) {
  await db.ref(`/submissions/${problemID}/${userID}`).update({
    solved: true
  })
}
db.utils = {
  getList, getObj, saveProblemCode, login, register, getUser,
  getProblemCode, getProblemData,
  getTotalProblems, getCorrectProblems, getAttemptedProblems, saveCorrectProblem,
  isProblemAttempted, isProblemCorrect
}
export default db;
const utils = db.utils;
export { utils }