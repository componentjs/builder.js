
/**
 * Module dependencies.
 */

var Builder = require('..');

var builder = new Builder('examples/components/tobi-foo');

builder.build(function(err, res){
  if (err) throw err;
  console.log(res.js);
});