var formidable = require('formidable')
var db = require('../db');
var path = require('path');
var fs = require('fs');

exports.getProblems = async (req, res) => {

  var context = {
    problems: await db.utils.getList('/problems')
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


  problemData = problemData || { };
  data = data || { code: null, args: ""}
  res.render('sandbox', {
    jwt: req.cookies['access_token'],
    code: data.code || "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World!\");\n  }\n}",
    args: data.args,
    problem: problemData,
    sandbox: false
  })
}

exports.postProblem = async (req, res) => {
  var problemID = req.params.id
  var form = new formidable.IncomingForm()
  form.parse(req, (err, fields, files) => {
    fs.readFile(files.file.path, 'utf8', async function (err,data) {
      await db.utils.saveProblemCode({
        userID: req.user.id,
        problem: problemID,
        code: data
      })

      res.redirect('/problems/'+problemID);
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

  data = data || { code: null, args: ""}
  

  res.render('sandbox', {
    jwt: req.cookies['access_token'],
    code: data.code || "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World!\");\n  }\n}",
    args: data.args,
    sandbox: true,
    problem: {}
  })
}
