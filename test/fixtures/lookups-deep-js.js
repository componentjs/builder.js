require.register("component-jquery/index.js", function(module, exports, require){
module.exports = 'jquery';
});
require.register("component-dialog/index.js", function(module, exports, require){
module.exports = 'dialog';
});
require.register("deep/index.js", function(module, exports, require){
module.exports = 'deeper'
});
require.alias("component-dialog/index.js", "deep/deps/dialog/index.js");
require.alias("component-jquery/index.js", "component-dialog/deps/jquery/index.js");
