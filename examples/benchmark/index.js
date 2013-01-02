
var Builder = require('../..');
var vm = require('vm');

var builder = new Builder(__dirname + '/components/hello');

builder.addLookup('examples/simple/components');

var n = 10000;
var times = n;
var start = new Date;
function next() {
  builder.build(function(err, res){
    if (err) throw err;

    if (!n--) {
      var secs = (new Date - start) / 1000;
      var ops = times / secs | 0;
      console.log();
      console.log('  times: %d', times);
      console.log('  ops/s: %d', ops);
      console.log('  duration: %dms', new Date - start);
      console.log();
      process.exit(1);
    }

    next();
  });
}

next();
