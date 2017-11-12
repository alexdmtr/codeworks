var socket;
main()

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function main() {
  socket = io()
  socket.on('connect', function () {
    socket
      .emit('authenticate', {token: getCookie('access_token')}) 
      .on('authenticated', onAuth)
      .on('unauthorized', function(msg) {
        console.log("unauthorized: " + JSON.stringify(msg.data));
        throw new Error(msg.data.type);
      })
  });

}

function onAuth() {
  console.log('authenticated')
  delaySaveCode();  

  socket.on('save:ok', function() {
    // console.log("Saved!");
    delaySaveCode();
  })  

  
}

var __delaying = false;
function delaySaveCode() {
  if (!__delaying) {
    __delaying = true;
    setTimeout(saveCode, 2000)
  }
}

function saveCode() {
  __delaying = false;
  socket.emit('save', { 
    code: editor.getValue(),
    sandbox: true
  })
}

function runCode() {
  socket.emit('run', {
    code: $("#code").val(),
    sandbox: true
  })
}