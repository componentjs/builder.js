
/**
 * Module dependencies.
 */

var debug = require('debug')('component:builder:copy');
var dirname = require('path').dirname;
var symlink = require('fs').symlink;
var exists = require('fs').exists;
var join = require('path').join;
var mkdirp = require('mkdirp');
var Batch = require('batch');
var cp = require('cp');

/**
 * Ops
 */

var ops = {
  ln: symlink,
  cp: cp
};

/**
 * Copy assets of `type` to `dest`.
 *
 * @param {String} type
 * @param {String} dest
 * @param {Object} opts
 * @return {Function}
 * @api public
 */

module.exports = function(type, dest, opts){
  var op = (opts || {}).symlink
    ? 'ln'
    : 'cp';

  return function(build, done){
    var batch = new Batch;

    build.each(type, function(file, conf){
      batch.push(function(done){
        var src = conf.path(file);
        var base = conf.name.replace('/', '-');
        var to = join(dest, base, file);
        var dir = dirname(to);
        debug('mkdir %s', dir);
        exists(src, function(exists){
          if (!exists) return done(new Error('file does not exist: ' + src));
          mkdirp(dir, function(err){
            if (err) return done(err);
            debug('%s %s -> %s', op, src, to);
            ops[op](src, to, done);
          });
        });
      });
    });

    batch.end(done);
  };
};
