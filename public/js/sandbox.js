var socket;
main()

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function main() {
  socket = io()
  // editor.setSize(null, 400);
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
  socket.on('run:done', runDone);
 

}

function runDone(data) {
  var compileError = data.compileError;
  var runtimeError = data.runtimeError;
  var stdout = data.stdout;
  var stderr = data.stderr;

  var message = stdout;
  if (compileError) {
    $("#output-error").text("Compile error");
    message = compileError.stderr;
  } else if (runtimeError) {
    $("#output-error").text("Runtime error");
    message = runtimeError.stderr;
  } else
    $("#output-error").text("");
  $("#output").html(message);
  $("#run-text").text("RUN")
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
    args: SANDBOX && input.getValue(),
    sandbox: SANDBOX,
    problem: PROBLEM
  })
}

function runCode() {
  $("#run-text").text("RUNNING")
  socket.emit('run', {
    code: editor.getValue(),
    args: SANDBOX && input.getValue(),
    sandbox: SANDBOX,
    problem: PROBLEM
  })
}