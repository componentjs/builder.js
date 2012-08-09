require.register("foo.js", function(module, exports, require){
module.exports = 'foo';
});
require.register("bar.js", function(module, exports, require){
module.exports = 'bar';
});