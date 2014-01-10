
/**
 * Expose `Build`
 */

module.exports = Build;

/**
 * Initialize `Build` with `components`.
 *
 * @param {Array} components
 * @api private
 */

function Build(components){
  this.components = components;
}

/**
 * Call `fn(file, conf)` for each file of `type`.
 *
 * @param {String} type
 * @param {Function} fn
 * @api private
 */

Build.prototype.each = function(type, fn){
  for (var i = 0; i < this.components.length; ++i) {
    var all = this.components[i][type] || [];
    for (var j = 0; j < all.length; ++j) {
      fn(all[j], this.components[i]);
    }
  }
};

/**
 * Map files of `type` with `fn(file, conf)`.
 *
 * @param {String} type
 * @param {Function} fn
 * @api private
 */

Build.prototype.map = function(type, fn){
  for (var i = 0; i < this.components.length; ++i) {
    var all = this.components[i][type] || [];
    for (var j = 0; j < all.length; ++j) {
      all[j] = fn(all[j], this.components[i]);
    }
  }
};
