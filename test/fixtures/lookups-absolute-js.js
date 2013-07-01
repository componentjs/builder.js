require.register("component-jquery/index.js", function(exports, require, module){
module.exports = 'jquery';
});
require.register("component-dialog/index.js", function(exports, require, module){
module.exports = 'dialog';
});
require.register("absolute/index.js", function(exports, require, module){
module.exports = 'absolute'
});
require.alias("component-dialog/index.js", "absolute/deps/dialog/index.js");
require.alias("component-dialog/index.js", "dialog/index.js");
require.alias("component-jquery/index.js", "component-dialog/deps/jquery/index.js");
