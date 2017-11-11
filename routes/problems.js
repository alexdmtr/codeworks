var formidable = require('formidable')
var db = require('../db');

async function getList(path) {
  var snapshot = await db.ref(path).once('value')
  
  var data = []
  snapshot.forEach(kid => {
    data.push({
      ref: kid.key,
      ...kid.val()
    });
  })

  return data;
}

async function getObj(path) {
  console.log(path)
  var snapshot = await db.ref(path).once('value')
  var obj = snapshot.val()
  
  obj.ref = obj.ref || snapshot.key
  
  return obj;
}
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