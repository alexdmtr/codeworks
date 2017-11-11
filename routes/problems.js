var formidable = require('formidable')
var db = require('../db');

var { getList, getObj } = require('../db/util')
exports.getProblems = async (req, res) => {
  
  var context = {
    problems: await getList('/problems')
  }
  
  res.render('problems/problems', context)
}

exports.getProblem = async (req, res) => {
  var problemID = req.params.id
  
  var problem = await getObj("/problems/"+problemID)

  res.render('problems/problem', { problem })
}

exports.postProblem = async (req, res) => {
  var problemID = req.params.id
  var form = new formidable.IncomingForm()
  form.parse(req, (err, fields, files) => {
    console.log(files);
  })
  // var problem = await getObj("/problems/"+problemID)

  res.render('problems/problem', { problem })
}

exports.getSandbox = async (req, res) => {
  res.render('sandbox')
}
