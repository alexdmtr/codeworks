var formidable = require('formidable')
var db = require('../db');

exports.getProblems = async (req, res) => {
  var problems = (await db.ref("/problems").once('value')).val()
  res.render('problems/problems', { problems })
}