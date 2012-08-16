
/**
 * Module dependencies.
 */

var Builder = require('..');

var builder = new Builder('examples/components/boot-component');

builder.build(function(err, res){
  if (err) throw err;
  console.log(res.require);
  console.log(res.js);
  // console.log(res.css);
});