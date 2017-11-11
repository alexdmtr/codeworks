var socket = io();

socket.emit('compile', { problem: "sum"});

socket.on('compile', function(data) {
  console.log(data);
});