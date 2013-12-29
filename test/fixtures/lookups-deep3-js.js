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
