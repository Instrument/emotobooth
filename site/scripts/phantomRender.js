'use strict';
let path = require('path')
let childProcess = require('child_process')
let phantomjs = require('phantomjs-prebuilt')
let binPath = phantomjs.path
 
let childArgs = [
  'phantomChildProcess.js', `singleData='{"id":"debug-multi","origPath":"out-debug/debug-multi-1-orig.png","finalPath":"out-debug/debug-multi-1-final.png","reqPath":"out-debug/debug-multi-1-req.json","respPath":"out-debug/debug-multi-1-resp.json"}'`
]
 
childProcess.execFile(binPath, childArgs,
  (err, stdout, stderr) => {
    console.log('--------');
    console.log(err, stdout, stderr); 
  }
)