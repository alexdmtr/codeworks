const db = require('.')

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
  console.log(path)
  var snapshot = await db.ref(path).once('value')
  var obj = snapshot.val()
  
  obj.key = obj.key || snapshot.key
  
  return obj;
}

module.exports = { getList, getObj }
