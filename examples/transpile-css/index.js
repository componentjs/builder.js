
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
  builder.hook('before styles', function(pkg){
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
  });
}
