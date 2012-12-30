require.register("deep2/index.js", function(exports, require, module){
module.exports = 'deeper'
});
require.register("component-jquery/index.js", function(exports, require, module){
module.exports = 'jquery';
});
require.register("component-dialog/index.js", function(exports, require, module){
module.exports = 'dialog';
});
require.register("component-inherit/index.js", function(exports, require, module){
module.exports = 'inherit';
});
require.register("animal/index.js", function(exports, require, module){

var inherit = require('inherit');
module.exports = 'animal';
});
require.register("deep3/index.js", function(exports, require, module){
module.exports = 'deeper'
});
require.alias("deep2/index.js", "deep3/deps/deep2/index.js");
require.alias("component-dialog/index.js", "deep2/deps/dialog/index.js");
require.alias("component-jquery/index.js", "component-dialog/deps/jquery/index.js");

require.alias("animal/index.js", "deep2/deps/animal/index.js");
require.alias("component-inherit/index.js", "animal/deps/inherit/index.js");

require.alias("component-dialog/index.js", "deep3/deps/dialog/index.js");
require.alias("component-jquery/index.js", "component-dialog/deps/jquery/index.js");

require.alias("animal/index.js", "deep3/deps/animal/index.js");
require.alias("component-inherit/index.js", "animal/deps/inherit/index.js");
