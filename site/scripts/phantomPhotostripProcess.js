'use strict';

var page = require('webpage').create();
var args = require('system').args;

page.onConsoleMessage = function(msg) {
  console.log('console: ' + msg);
};

page.open('http://localhost:8080/photostrips/?inPath='+escape(args[1])+'&images='+escape(args[3]), function(status) {
  if(status === "success") {
    setTimeout(function() {
      page.render(args[2], {format: 'jpeg', quality: '100'});
      phantom.exit();
    }, 1000);
  } else {
    console.log(status);
    phantom.exit();
  }
});
