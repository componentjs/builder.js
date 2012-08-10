
/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , Batch = require('batch')
  , debug = require('debug')('component:builder')
  , Emitter = require('events').EventEmitter
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
  this.ignored = {
    scripts: [],
    styles: []
  };
}

/**
 * Inherits from `Emitter.prototype`.
 */

Builder.prototype.__proto__ = Emitter.prototype;

/**
 * Ignore the given component name(s) of `type`.
 *
 * @param {String} name
 * @param {String} type
 * @api public
 */

Builder.prototype.ignore = function(name, type){
  if (!type) {
    this.ignore(name, 'scripts');
    this.ignore(name, 'styles');
    return;
  }

  debug('ignore %j %s', name, type);
  if (Array.isArray(name)) {
    for (var i = 0; i < name.length; ++i) {
      this.ignored[type].push(name[i].replace('/', '-'));
    }
  } else {
    this.ignored[type].push(name.replace('/', '-'));
  }
};

/**
 * Check if the builder is ignoring `name` and `type`.
 *
 * @param {String} name
 * @param {String} type
 * @return {Boolean}
 * @api public
 */

Builder.prototype.ignoring = function(name, type){
  if (!type) {
    return this.ignoring(name, 'scripts')
      && this.ignoring(name, 'styles');
  }
  return ~this.ignored[type].indexOf(name);
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
  debug('building %s js', this.name);

  this.json(function(err, conf){
    if (err) return fn(err);
    var batch = new Batch;

    if (conf.dependencies) {
      Object.keys(conf.dependencies).forEach(function(dep){
        dep = dep.replace('/', '-');

        // ignored
        if (self.ignoring(dep, 'scripts')) return debug('ignoring %s', dep);

        // ignore it so we dont have dups
        self.ignore(dep, 'scripts');

        // build dep
        var dir = self.path(path.join('..', dep));
        debug('building dependency %s', dep);
        var builder = new Builder(dir);
        builder.ignored = self.ignored;
        self.emit('dependency', builder);
        batch.push(builder.buildScripts.bind(builder));
      });
    }

    if (conf.scripts) {
      conf.scripts.forEach(function(script){
        var path = self.path(script);
        batch.push(function(done){
          fs.readFile(path, 'utf8', function(err, str){
            if (err) return fn(err);
            done(null, register(conf.name + '/' + script, str));
          });
        });
      });
    }

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
  debug('building %s css', this.name);

  this.json(function(err, conf){
    if (err) return fn(err);
    var batch = new Batch;

    if (conf.dependencies) {
      Object.keys(conf.dependencies).forEach(function(dep){
        dep = dep.replace('/', '-');

        // ignored
        if (self.ignoring(dep, 'styles')) return debug('ignoring %s', dep);

        // ignore it so we dont have dups
        self.ignore(dep, 'styles');

        // build dep
        var dir = self.path(path.join('..', dep));
        debug('building dependency %s', dep);
        var builder = new Builder(dir);
        builder.ignored = self.ignored;
        self.emit('dependency', builder);
        batch.push(builder.buildStyles.bind(builder));
      });
    }

    if (conf.styles) {
      conf.styles.forEach(function(script){
        var path = self.path(script);
        batch.push(function(done){
          fs.readFile(path, 'utf8', done);
        });
      });
    }

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
