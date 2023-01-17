import formidable from 'formidable';
const { IncomingForm } = formidable;
import { utils } from '../db';
import path from 'path';
import { readFile } from 'fs';
import bluebird from "bluebird";
const { resolve, map, all } = bluebird;

export async function getProblems(req, res) {



  const search = req.query.search;
  var problems = await utils.getList('/problems');
  problems = problems.map(p => ({ status: {}, ...p }))
  var userID = req.user.id;

  function markSolved(solved, index) {
    problems[index].status.solved = solved;

    return resolve();
  }

  function markAttempted(attempted, index) {
    problems[index].status.attempted = attempted;

    return resolve();
  }

  const whichSolved = map(problems, p =>
    utils.isProblemCorrect({
      userID,
      problemID: p.key
    })).map(markSolved);

  const whichAttempted = map(problems, p =>
    utils.isProblemAttempted({
      userID,
      problemID: p.key
    })).map(markAttempted);

  await all(whichSolved, whichAttempted);

  // var status = await Promise.map(problems, p => [db.utils.isProblemCorrect({
  //   userID,
  //   problemID: p.key
  // }), db.utils.isProblemAttempted({
  //   userID,
  //   probemID: p.key
  // })])

  // for (let i = 0; i < problems.length; i++) {
  //   problems[i].status = { solved: status[i*2], attempted: status[i*2+1] };
  // }

  // for (let i = 0; i < problems.length; i++) {
  //   problems[i].status = {
  //     solved: await db.utils.isProblemCorrect({
  //       userID, problemID: problems[i].key
  //     }),
  //     attempted: await db.utils.isProblemAttempted({
  //       userID, problemID: problems[i].key
  //     })
  //   }
  // }

  var context = {
    problems,
    page: {
      problems: true
    },
    pageName: 'Problems',
    search,
  }
  res.render('problems/problems', context)
}

export async function getProblem(req, res) {
  console.log(req.params.id);
  var problemData = await utils.getProblemData({
    problem: req.params.id
  })
  var data = await utils.getProblemCode({
    userID: req.user.id,
    problem: req.params.id,
  })


  problemData = problemData || {};
  data = data || { code: null, args: problemData.args }
  res.render('sandbox', {
    jwt: req.cookies['access_token'],
    code: data.code || "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World!\");\n  }\n}",
    args: data.args,
    problem: problemData,
    sandbox: false,
    page: {
      problems: true
    },
    pageName: problemData.title
  })
}

export async function postProblem(req, res) {
  var problemID = req.params.id
  var form = new IncomingForm()
  form.parse(req, (err, fields, files) => {
    readFile(files.file.path, 'utf8', async function (err, data) {
      await utils.saveProblemCode({
        userID: req.user.id,
        problem: problemID,
        code: data
      })

      res.redirect('/problems/' + problemID);
    })
  })
  // var problem = await getObj("/problems/"+problemID)

  res.render('problems/problem', { problem })
}

export async function getSandbox(req, res) {
  var data = await utils.getProblemCode({
    userID: req.user.id,
    problem: 'sandbox',
  })

  data = data || { code: null, args: "" }


  res.render('sandbox', {
    jwt: req.cookies['access_token'],
    code: data.code || "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World!\");\n  }\n}",
    args: data.args,
    sandbox: true,
    problem: {},
    page: {
      sandbox: true
    },
    pageName: 'Sandbox'
  })
}
