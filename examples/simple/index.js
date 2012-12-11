
var Builder = require('../..');
var vm = require('vm');

var builder = new Builder(__dirname + '/components/hello');

builder.addLookup('examples/simple/components');

builder.build(function(err, res){
  if (err) throw err;
  
  // res.require is separate from the js generated
  // by the components themselves, and must be added.
  // this separation allows for future lazy-loading
  // of component sub-trees void of the require code
  var js = res.require + res.js;
  js += 'require("hello")';
  var ret = vm.runInNewContext(js);
  console.log(ret);
});