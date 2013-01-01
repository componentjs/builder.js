
// first:
// $ npm install jade

var Builder = require('../..');
var jade = require('jade');
var path = require('path');
var fs = require('fs');
var vm = require('vm');

var builder = new Builder(__dirname + '/components/user');

builder.addLookup('examples/transpile/components');

// use the jade plugin defined below
builder.use(compileJade);

builder.build(function(err, res){
  if (err) throw err;
  var js = res.require + res.js;
  js += ';require("user")';
  var ret = vm.runInNewContext(js);
  console.log(ret);
});

function compileJade(builder) {
  // add the jade "runtime" script
  // which is required for the individual
  // templates to work. Since we invoke
  // this here on builder it is NOT applied
  // recursively, thus adding the script only once
  builder.on('config', function(){
    var runtime = fs.readFileSync(__dirname + '/runtime.js', 'utf8');
    builder.addFile('scripts', 'jade.runtime.js', runtime);
    // add arbitrary js to auto-invoke require("user/jade.runtime"),
    // this is necessary because Jade expects the "jade" variable
    // to be global, but .addFile() wraps it in a commonjs module
    builder.append('require("user/jade.runtime")');
  });

  // hook into the "before scripts" event
  builder.hook('before scripts', function(pkg, fn){
    // check if we have .templates in component.json
    var tmpls = pkg.conf.templates;
    if (!tmpls) return fn();

    // translate templates
    tmpls.forEach(function(file){
      // only .jade files
      var ext = path.extname(file);
      if ('.jade' != ext);

      // read the file
      file = pkg.path(file);
      var str = fs.readFileSync(file, 'utf8');
      var fn = jade.compile(str, { client: true, compileDebug: false });

      // add the fabricated script which
      // exports the compiled jade template function
      file = path.basename(file, '.jade') + '.js';
      pkg.addFile('scripts', file, 'module.exports = ' + fn);
    });

    fn();
  });
}
