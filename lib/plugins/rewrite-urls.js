
/**
 * Module dependencies.
 */

var basename = require('path').basename;
var dirname = require('path').dirname;
var resolve = require('url').resolve;

/**
 * Expose `rewriteUrls`
 */

module.exports = rewriteUrls;

/**
 * Expr
 */

var expr = /\burl *\(([^)]+)\)/g;

/**
 * Rewrite css urls with `prefix` and `dest`.
 *
 * @param {String} prefix
 * @return {Function}
 * @api private
 */

function rewriteUrls(prefix){
  return function(build, done){
    setImmediate(done);
    build.map('styles', function(file, conf){
      var basename = normalize(conf, build.components);
      file.contents = rewrite(file, basename, prefix);
      return file;
    });
  };
}

/**
 * Rewrite urls of `file` with `basename`,
 * `prefix` and `dest`.
 *
 * @param {Object} file
 * @param {String} basename
 * @param {String} prefix
 * @return {Object}
 * @api private
 */

function rewrite(file, basename, prefix){
  return file.contents.replace(expr, function(_, url){
    var orig = 'url(' + url + ')';
    if (data(url)) return orig;
    if (absolute(url)) return orig;
    var dir = dirname(file.filename);
    url = stripQuotes(url);
    var dir = [prefix, basename, dir].filter(truthy).join('/') + '/';
    return 'url("' + resolve(dir, url) + '")';
  });
}

/**
 * Truthy
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

function truthy(str){
  return !! str;
}

/**
 * Is data.
 *
 * @param {String} url
 * @return {Boolean}
 * @api private
 */

function data(url){
  return 0 == url.indexOf('data:');
}

/**
 * Absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api private
 */

function absolute(url){
  return ~url.indexOf('://')
    || '/' == url[0];
}

/**
 * Normalize conf name.
 *
 * @param {Object} conf
 * @param {Array} list
 * @return {String}
 * @api private
 */

function normalize(conf, list){
  return conf != list[0]
    ? basename(conf.path())
    : conf.name;
}

/**
 * Strip quotes.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function stripQuotes(str){
  if (!~['"', "'"].indexOf(str[0])) return str;
  return str.slice(1, -1);
}
