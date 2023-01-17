var socket;
main()

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function main() {
  $("#okdone").hide();
  $("#okwrong").hide();
  $("#output").text(`
  `)
  socket = io({ auth: { token: `Bearer ${getCookie('access_token')}` } })
  // editor.setSize(null, 400);
  socket.on('connect', function () {
    socket
      .on('authenticated', onAuth)
      .on('unauthorized', function (msg) {
        console.log("unauthorized: " + JSON.stringify(msg.data));
        throw new Error(msg.data.type);
      })
  });

  setInterval(pushBuffer, 1000 / 30); // 30fps
}

function onAuth() {
  console.log('authenticated')
  delaySaveCode();

  socket.on('save:ok', function () {
    // console.log("Saved!");
    delaySaveCode();
  })
  socket.on('run:stdout', runStdout);
  socket.on('run:stderr', runStderr);
  socket.on('run:done', runDone);
  socket.on('submit:result', submitResult);
}

function submitResult(result) {
  if (result) {
    $("#okdone").show();
    $("#okwrong").hide();
  } else {
    $("#okdone").hide();
    $("#okwrong").show();
  }
}
var _buffer = "";
function runStdout(data) {
  // $("#output").text($("#output").val()+data)
  // $("#output").append(data)
  _buffer += data;
}

function runStderr(data) {
  // $("#output").text($("#output").val()+data)  
  // $("#output").append(data)
  _buffer += data;
}

function pushBuffer() {
  var data = _buffer;
  _buffer = "";
  if (data) {
    var $output = $("#output")
    $output.append(data);
    $output.get(0).scrollTop = $output.get(0).scrollHeight;
  }
}

function runDone(data) {
  var compileError = data.compilerError;
  // var runtimeError = data.runtimeError;
  // var stdout = data.stdout;
  // var stderr = data.stderr;
  var miliseconds = data.miliseconds;
  var seconds = (miliseconds / 1000.).toFixed(4);
  var kill = data.kill;

  if (compileError) {
    $("#output-error").text("Compile error");
    $("#output").text("")
    _buffer = compileError.stderr;
    // } else if (runtimeError) {
    //   $("#output-error").text("Runtime error");
    //   message = runtimeError.stderr;
  } else
    $("#output-error").text("");

  if (kill)
    _buffer += `Program terminated after ${seconds}s`;
  if (!compileError)
    _buffer += `
===========================
Program finished with exit code ${data.code}
Execution time: ${seconds}s`;


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
    args: input.getValue(),
    sandbox: SANDBOX,
    problem: PROBLEM
  })
}

function runCode() {
  $("#run-text").text("RUNNING")
  $("#output").text(`
`)
  socket.emit('run', {
    code: editor.getValue(),
    args: input.getValue(),
    sandbox: SANDBOX,
    problem: PROBLEM
  })
}