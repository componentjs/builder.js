

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , Batch = require('batch')
  , debug = require('debug')('component:builder')
  , basename = path.basename;

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
  this.name = basename(dir);
  this._ignore = [];
}

/**
 * Ignore the given component name(s).
 *
 * @param {String} name
 * @api public
 */

Builder.prototype.ignore = function(name){
  if (Array.isArray(name)) {
    for (var i = 0; i < name.length; ++i) {
      this._ignore.push(name[i].replace('/', '-'));
    }
  } else {
    this._ignore.push(name.replace('/', '-'));
  }
};

/**
 * Check if the builder is ignoring `name`.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

Builder.prototype.ignoring = function(name){
  return ~this._ignore.indexOf(name);
};

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
  var path = this.path('component.json');
  debug('reading %s', path);
  fs.readFile(path, 'utf8', function(err, str){
    if (err) return fn(err);
    try {
      fn(null, self.conf = JSON.parse(str));
    } catch (err) {
      fn(err);
    }
  });
};

/**
 * Build and invoke `fn(err, res)`, where `res`
 * is an object containing:
 *
 *  - `css`
 *  - `js`
 *
 * @param {Function} fn
 * @api private
 */

Builder.prototype.build = function(fn){
  var batch = new Batch;
  debug('building %s', this.dir);
  batch.push(this.buildScripts.bind(this));
  batch.push(this.buildStyles.bind(this));
  batch.end(function(err, res){
    if (err) return fn(err);
    fn(null, {
      js: res.shift(),
      css: res.shift()
    });
  });
};

/**
 * Build scripts and invoke `fn(err, js)`.
 *
 * @param {Function} fn
 * @api private
 */

Builder.prototype.buildScripts = function(fn){
  var self = this;
  debug('building %s js', this.dir);

  this.json(function(err, conf){
    if (err) return fn(err);
    if (!conf.scripts) return fn();

    var batch = new Batch;

    if (conf.dependencies) {
      Object.keys(conf.dependencies).forEach(function(dep){
        dep = dep.replace('/', '-');
        var dir = self.path(path.join('..', dep));
        debug('building %s dependency', dir);
        var builder = new Builder(dir);
        batch.push(builder.buildScripts.bind(builder));
      });
    }

    conf.scripts.forEach(function(script){
      var path = self.path(script);
      batch.push(function(done){
        fs.readFile(path, 'utf8', function(err, str){
          if (err) return fn(err);
          done(null, register(conf.name + '/' + script, str));
        });
      });
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
  debug('building %s css', this.dir);

  this.json(function(err, conf){
    if (err) return fn(err);
    if (!conf.styles) return fn();

    var batch = new Batch;

    if (conf.dependencies) {
      Object.keys(conf.dependencies).forEach(function(dep){
        dep = dep.replace('/', '-');
        var dir = self.path(path.join('..', dep));
        debug('building %s dependency', dir);
        var builder = new Builder(dir);
        batch.push(builder.buildStyles.bind(builder));
      });
    }

    conf.styles.forEach(function(script){
      var path = self.path(script);
      batch.push(function(done){
        fs.readFile(path, 'utf8', done);
      });
    });

    batch.end(function(err, res){
      if (err) return fn(err);
      fn(null, res.join('\n'));
    });
  });
};

/**
 * Return a js string representing a commonjs
 * client-side module with the given `path` and `js`.
 *
 * @param {String} path
 * @param {String} js
 * @return {String}
 * @api private
 */

function register(path, js){
  return 'require.register("' + path + '", function(module, exports, require){\n'
    + js
    + '\n});';
};
