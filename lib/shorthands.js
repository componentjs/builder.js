
var commonjs = require('./plugins/commonjs');
var concat = require('./plugins/concat');
var copy = require('./plugins/copy');
var rewriteUrls = require('./plugins/rewrite-urls');
var symlink = require('./plugins/symlink');

/**
 * Build all the native types with an `out` directory and optional `options`
 * then invoke `fn(err, build)`.
 *
 * @param {String} out
 * @param {Object} options (optional)
 *   @property {Boolean} symlink
 *   @property {String} rewriteUrls
 * @param {Function} fn
 */

exports.all = function (out, options, fn) {
  if ('function' == typeof options) fn = options, options = null;
  options = options || {};

  this
    .use(commonjs('json'))
    .use(commonjs('scripts'))
    .use(commonjs('templates'))
    .use(rewrite(options.rewriteUrls || ''))
    .use(concat('json'))
    .use(concat('scripts'))
    .use(concat('styles'))
    .use(concat('templates'))
    .use(copy('fonts', out, options))
    .use(copy('images', out, options))
    .build(fn);
};

/**
 * Build scripts and invoke `fn(err, build)`.
 *
 * @param {Function} fn
 */

exports.scripts = function (fn) {
  this
    .use(commonjs('scripts'))
    .use(concat('scripts'))
    .build(fn);
};

/**
 * Build styles with `options` and invoke `fn(err, build)`.
 *
 * @param {Object} options (optional)
 *   @property {String} rewriteUrls
 * @param {Function} fn
 */

exports.styles = function (options, fn) {
  if ('function' == typeof options) fn = options, options = null;
  options = options || {};

  this
    .use(rewriteUrls(options.rewriteUrls || ''))
    .use(concat('styles'))
    .build(fn);
};

/**
 * Build templates and invoke `fn(err, build)`.
 *
 * @param {Function} fn
 */

exports.templates = function (fn) {
  this
    .use(commonjs('templates'))
    .use(concat('templates'))
    .build(fn);
};

/**
 * Build json and invoke `fn(err, build)`.
 *
 * @param {Function} fn
 */

exports.json = function (fn) {
  this
    .use(commonjs('json'))
    .use(concat('json'))
    .build(fn);
};

/**
 * Build images with `out` directory and `options` and invoke `fn(err, build)`.
 *
 * @param {String} out
 * @param {Object} options (optional)
 * @param {Function} fn
 */

exports.images = function (out, options, fn) {
  if ('function' == typeof options) fn = options, options = null;
  options = options || {};

  this
    .use(copy('images', out, options))
    .build(fn);
};

/**
 * Build fonts with `out` directory and `options` and invoke `fn(err, build)`.
 *
 * @param {String} out
 * @param {Object} options (optional)
 * @param {Function} fn
 */

exports.fonts = function (out, options, fn) {
  if ('function' == typeof options) fn = options, options = null;
  options = options || {};

  this
    .use(copy('fonts', out, options))
    .build(fn);
};