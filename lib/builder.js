
/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , join = path.join
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
  this.paths = [];
  this.paths.push(join(dir, 'components'));
  this.paths.push(join(dir, '..'));
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
 * Lookup component `name` using `.paths`
 * and invoke `fn(err, dir)`.
 *
 * @param {String} name
 * @param {String} fn
 * @api public
 */

Builder.prototype.lookup = function(name, fn){
  var paths = this.paths;
  var i = 0;

  debug('lookup %s', name);
  function next() {
    var path = paths[i++];
    if (!path) return fn();
    var dir = join(path, name);
    debug('lookup check %s', dir);
    fs.exists(dir, function(yes){
      if (!yes) return next();
      debug('lookup found %s', dir);
      fn(null, dir);
    });
  }

  next();
};

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
 * Load require.js script.
 *
 * @param {Function} fn
 * @api private
 */

Builder.prototype.loadRequire = function(fn){
  fs.readFile(join(__dirname, 'require.js'), 'utf8', fn);
};

/**
 * Build and invoke `fn(err, res)`, where `res`
 * is an object containing:
 *
 *  - `css`
 *  - `js`
 *
 * @param {Function} fn
 * @api public
 */

Builder.prototype.build = function(fn){
  var batch = new Batch;
  debug('building %s', this.dir);
  batch.push(this.buildScripts.bind(this));
  batch.push(this.buildStyles.bind(this));
  batch.push(this.loadRequire.bind(this));
  batch.end(function(err, res){
    if (err) return fn(err);
    fn(null, {
      js: res.shift(),
      css: res.shift(),
      require: res.shift()
    });
  });
};

/**
 * Build `type` and invoke `fn`.
 *
 * @param {String} type
 * @param {String} fn
 * @param {String} process
 * @api private
 */

Builder.prototype.buildType = function(type, fn, process){
  var self = this;
  debug('building %s %s', this.name, type);

  this.json(function(err, conf){
    if (err) return fn(err);
    var batch = new Batch;

    if (conf.dependencies) {
      Object.keys(conf.dependencies).forEach(function(dep){
        dep = dep.replace('/', '-');

        // ignored
        if (self.ignoring(dep, type)) return debug('ignoring %s', dep);

        // ignore it so we dont have dups
        self.ignore(dep, type);

        // lookup dep
        batch.push(function(done){
          self.lookup(dep, function(err, dir){
            if (err) return done(err);
            debug('building dependency %s in %s', dep, dir);
            var builder = new Builder(dir);
            builder.ignored = self.ignored;
            self.emit('dependency', builder);
            builder.buildType(type, done, process);
          });
        });
      });
    }

    if (conf[type]) {
      conf[type].forEach(function(file){
        var path = self.path(file);
        batch.push(function(done){
          fs.readFile(path, 'utf8', function(err, str){
            if (err) return fn(err);
            done(null, process(conf.name + '/' + file, str));
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
 * Build scripts and invoke `fn(err, js)`.
 *
 * @param {Function} fn
 * @api private
 */

Builder.prototype.buildScripts = function(fn){
  this.buildType('scripts', fn, register);
};

/**
 * Build styles and invoke `fn(err, css)`.
 *
 * @param {Function} fn
 * @api private
 */

Builder.prototype.buildStyles = function(fn){
  this.buildType('styles', fn, function(file, str){
    return str;
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
