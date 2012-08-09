require.register("foo", function(module, exports, require){
  module.exports = 'foo';
});

require.register("bar", function(module, exports, require){
  module.exports = 'bar';
});
