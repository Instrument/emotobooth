var fs = require('fs');
var gm = require('gm');
var im = require('gm').subClass({imageMagick: true});

function convertToPNG(image, callback) {
  gm(image)
  .toBuffer('PNG', function(err, buffer) {
    callback(err, buffer);
  });
}

function getColorCounts(image, callback) {
  // convert -colors 256 -depth 8 - -format \"%c\" histogram:info:-
  im(image)
  .command('convert')
  .in('-colors')
  .in(256)
  .in('-depth')
  .in(8)
  .out('-format')
  .out('"%c"')
  .toBuffer('histogram:info', function(err, buffer) {
    var output = buffer.toString();
    output = output.slice(1, -2);  // Get rid of garbage charceters
    var lines = output.split('\n');
    var colorCounts = lines.map(function(line) {
      var split = line.split(':');
      var count = parseInt(split[0]);
      var color = 'rgb' + split[1].match(' (\(.*\)) #')[1];
      return [count, color];
    });
    colorCounts.sort(function(a, b) { return a[0] - b[0] });
    colorCounts.reverse();
    callback(colorCounts);
  })
}

function removeColor(image, color, callback) {
  // convert in.png -fuzz 20 -transparent 'rgb(80, 220, 141)' out.png
  im(image)
  .fuzz('10%')
  .transparent(color)
  .toBuffer(function(err, buffer) { callback(buffer); } );
}

function removeGreenScreen(read, write) {
  convertToPNG(read, function(png) {
    getColorCounts(png, function(colorCounts) {
      var i = 0;
      function callbackLoop(image) {
        i++;
        if (i >= 3) { write.write(image); return }
        removeColor(image, colorCounts[i][1], callbackLoop);
      }
      removeColor(png, colorCounts[i][1], callbackLoop);
    });
  });
}

if (require.main === module) {
  var argv = require('minimist')(process.argv.slice(2));
  if (argv._.length != 2) {
    throw new Error('Wrong number of arguments');
  }

  var inFile = argv._[0];
  var outFile = argv._[1];
  var rstream = fs.createReadStream(inFile);
  var wstream = fs.createWriteStream(outFile);
  removeGreenScreen(rstream, wstream);
} else {
  module.exports = {
    convertToPNG: convertToPNG,
    getColorCounts: getColorCounts,
    removeColor: removeColor,
    removeGreenScreen: removeGreenScreen
  };
}
