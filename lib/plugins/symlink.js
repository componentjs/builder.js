
/**
 * Module dependencies.
 */

var copy = require('./copy');

/**
 * Symlink assets of `type` to `dest`.
 *
 * @param {String} type
 * @param {String} dest
 * @return {Function}
 * @api public
 */

module.exports = function(type, dest){
  return copy(type, dest, { symlink: true });
};
