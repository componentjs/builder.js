
var Builder = require('../..');
var Style = require('Styl');
var path = require('path');
var fs = require('fs');

// root component
var builder = new Builder(__dirname + '/components/app');

// use our custom Styl plugin
builder.use(styl);

// build

builder.build(function(err, res){
  if (err) throw err;
  console.log(res.css);
});

// custom plugin that compiles
// stylesheets in the `.styl` array.
// could make this async if you wanted

function styl(builder) {
  builder.hook('before styles', function(pkg, fn){
    var styles = pkg.config.styl;
    if (!styles) return;

    styles.forEach(function(file){
      // compile it
      var str = fs.readFileSync(pkg.path(file), 'utf8');
      var css = Style(str, { whitespace: true }).toString();

      // add it to .styles
      css = '\n// file: ' + file + '\n\n' + css;
      pkg.addFile('styles', file, css);
    });

    fn();
  });
}


// // use the jade plugin defined below
// builder.use(compileJade);

// builder.build(function(err, res){
//   if (err) throw err;
//   var js = res.require + res.js;
//   js += ';require("user")';
//   var ret = vm.runInNewContext(js);
//   console.log(ret);
// });

// function compileJade(builder) {
//   // add the jade "runtime" script
//   // which is required for the individual
//   // templates to work. Since we invoke
//   // this here on builder it is NOT applied
//   // recursively, thus adding the script only once
//   var runtime = fs.readFileSync(__dirname + '/runtime.js', 'utf8');
//   builder.addFile('scripts', 'jade.runtime.js', runtime);
//   // add arbitrary js to auto-invoke require("user/jade.runtime"),
//   // this is necessary because Jade expects the "jade" variable
//   // to be global, but .addFile() wraps it in a commonjs module
//   builder.append('require("user/jade.runtime")');

//   // hook into the "before scripts" event
//   builder.hook('before scripts', function(pkg, fn){
//     // check if we have .templates in component.json
//     var tmpls = pkg.config.templates;
//     if (!tmpls) return fn();

//     // translate templates
//     tmpls.forEach(function(file){
//       // only .jade files
//       var ext = path.extname(file);
//       if ('.jade' != ext) return;

//       // read the file
//       file = pkg.path(file);
//       var str = fs.readFileSync(file, 'utf8');
//       var fn = jade.compile(str, { client: true, compileDebug: false });

//       // add the fabricated script which
//       // exports the compiled jade template function
//       file = path.basename(file, '.jade') + '.js';
//       pkg.addFile('scripts', file, 'module.exports = ' + fn);
//     });

//     fn();
//   });
// }
