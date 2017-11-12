var formidable = require('formidable')
var db = require('../db');
var path = require('path');
var fs = require('fs');
var Promise = require('bluebird')

exports.getProblems = async (req, res) => {



  const search = req.query.search;
  var problems = await db.utils.getList('/problems')
//   var submissions = await db.utils.getList('/submissions')
// var userID=req.user.id;
//   problems.forEach(problem => {
//     var isCorrect = correctProblems.filter(p => p.key==problem.key).length > 0;
//     var isAttempted = attemptedProblems.filter(p => p.key==problem.key).length > 0;

//     problem.status = {
//       solved: isCorrect,
//       attempted: isAttempted
//     }
//   })
  // await Promise.map(problems, async problem => {
  //   problem.status = {};
  //   if (await db.utils.isProblemCorrect({
  //     userID: req.user.id,
  //     problemID: problem.key
  //   })) {
  //     problem.status.solved = true;
  //   }
  //   else if (await db.utils.isProblemAttempted({
  //     userID: req.user.id,
  //     problemID: problem.key
  //   })) {
  //     problem.status.attempted = true;
  //   }

  //   console.log(problem.title, problem.status)

  // }

  // )

  // if (search)
  //   problems = problems.filter(problem => {
  //     let fields = ['title', 'text'];

  //     let ok = false;
  //     fields.forEach(field => {
  //       var a = problem[field].toUpperCase();
  //       var b = search.toUpperCase();
  //       if (a.includes(b))
  //         ok = true;
  //     })

  //     return ok;
  //   })

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

exports.getProblem = async (req, res) => {
  console.log(req.params.id);
  var problemData = await db.utils.getProblemData({
    problem: req.params.id
  })
  var data = await db.utils.getProblemCode({
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

exports.postProblem = async (req, res) => {
  var problemID = req.params.id
  var form = new formidable.IncomingForm()
  form.parse(req, (err, fields, files) => {
    fs.readFile(files.file.path, 'utf8', async function (err, data) {
      await db.utils.saveProblemCode({
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

exports.getSandbox = async (req, res) => {
  var data = await db.utils.getProblemCode({
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
