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
  var problemID = req.params.id
  
  var problem = await db.utils.getObj("/problems/"+problemID)

  res.render('problems/problem', { problem })
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