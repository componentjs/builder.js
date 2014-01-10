
/**
 * Module dependencies.
 */

var debug = require('debug')('component:builder.js:concat');
var each = require('../utils').each;

/**
 * Concat assets of `type` and expose them on `ctx[type]`.
 *
 * @param {String} type
 * @return {Builder}
 * @api public
 */

module.exports = function(type){
  return function(build, fn){
    setImmediate(fn);
    build.each(type, function(file){
      if (!file.contents) return;
      if (!build[type]) build[type] = '';
      build[type] += file.contents;
    });
  };
};
