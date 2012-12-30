require.register("hello/foo.js", function(exports, require, module){
module.exports = 'foo';
});
require.register("hello/bar.js", function(exports, require, module){
module.exports = 'bar';
});
require.alias("component-emitter/index.js", "hello/deps/emitter/index.js");
