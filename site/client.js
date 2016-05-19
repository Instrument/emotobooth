var Gpio = require('onoff').Gpio;
var WebSocket = require('ws');
var argv = require('yargs').argv;
var socket = require('socket.io-client')('http://' + (argv.host || '172.20.6.209') + ':' + (argv.port || '8082'));

var button1 = new Gpio(2, 'in', 'both');
var button2 = new Gpio(4, 'in', 'both');

button1.watch(function(err, value) {
  if (!value) {
    socket.emit('endSession', {});
  }
});

button2.watch(function(err, value) {
  if (!value) {
    socket.emit('killSession', {});
  }
});

socket.on('connect', function(){
  console.log('connected');
});
socket.on('event', function(data){
  console.log(data);
});
socket.on('disconnect', function(){
  console.log('disconnected');
});