const fields = {
  users: [ "username", "email", "password" ]
}

const data = {
  users: [
    [ "alexd", "alexadrian.dmtr@gmail.com", "shh" ],
    [ "darth.vader", "vader@empire.com", "secret" ]
  ]
}

let returnData = {}

Object.keys(data).forEach(model => {

  let modelData = data[model].map(instance => {
    let obj = {}
    
    fields[model].forEach((field, index) => {
      if (index < instance.length && instance[index] != null) 
        obj[field] = instance[index]
    })

    return obj
  })
  
  returnData[model] = modelData
})

module.exports = returnData