require.register("component-jquery/index.js", function(module, exports, require){
module.exports = 'jquery';
});
require.register("component-dialog/index.js", function(module, exports, require){
module.exports = 'dialog';
});
require.register("component-inherit/index.js", function(module, exports, require){
module.exports = 'inherit';
});
require.register("animal/index.js", function(module, exports, require){

var inherit = require('inherit');
module.exports = 'animal';
});
require.register("deep2/index.js", function(module, exports, require){
module.exports = 'deeper'
});
require.alias("component-dialog/index.js", "deep2/deps/dialog/index.js");
require.alias("component-jquery/index.js", "component-dialog/deps/jquery/index.js");

require.alias("animal/index.js", "deep2/deps/animal/index.js");
require.alias("component-inherit/index.js", "animal/deps/inherit/index.js");
