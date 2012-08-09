

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , Batch = require('batch');

/**
 * Expose `Builder`.
 */

module.exports = Builder;

/**
 * Initialize a new `Builder` with the given component `dir`.
 *
 * @param {String} dir
 * @api private
 */

function Builder(dir) {
  this.dir = dir;
  this.componentsDir = this.path('..');
}

/**
 * Return a resolved path relative to this
 * builder's dir.
 *
 * @param {String} file
 * @return {String}
 * @api public
 */

Builder.prototype.path = function(file){
  return path.resolve(path.join(this.dir, file));
};

/**
 * Load JSON and invoke `fn(err, obj)`.
 *
 * @param {Function} fn
 * @api public
 */

Builder.prototype.json = function(fn){
  var self = this;
  if (this.conf) return fn(null, this.conf);
  fs.readFile(this.path('component.json'), 'utf8', function(err, str){
    if (err) return fn(err);
    try {
      fn(null, self.conf = JSON.parse(str));
    } catch (err) {
      fn(err);
    }
  });
};

/**
 * Build to `dir`.
 *
 * @param {String} dir
 * @param {Function} fn
 * @api private
 */

Builder.prototype.build = function(dir, fn){
  var batch = new Batch;
  this.dir = dir;
  batch.push(this.buildScripts.bind(this));
  batch.push(this.buildStyles.bind(this));
  batch.end(fn);
};

/**
 * Build scripts and invoke `fn(err, js)`.
 *
 * @param {Function} fn
 * @api private
 */

Builder.prototype.buildScripts = function(fn){
  var self = this;
  this.json(function(err, conf){
    if (err) return fn(err);
    var batch = new Batch;

    conf.scripts.forEach(function(script){
      var path = self.path(script);
      batch.push(function(done){
        fs.readFile(path, 'utf8', done);
      })
    });

    batch.end(function(err, res){
      if (err) return fn(err);
      fn(null, res.join('\n'));
    });
  });
};

/**
 * Build styles and invoke `fn(err, css)`.
 *
 * @param {Function} fn
 * @api private
 */

Builder.prototype.buildStyles = function(fn){
  var self = this;
  this.json(function(err, conf){
    if (err) return fn(err);
    var batch = new Batch;

    conf.styles.forEach(function(script){
      var path = self.path(script);
      batch.push(function(done){
        fs.readFile(path, 'utf8', done);
      })
    });

    batch.end(function(err, res){
      if (err) return fn(err);
      fn(null, res.join('\n'));
    });
  });
};
