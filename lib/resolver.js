
/**
 * Module dependencies.
 */

var debug = require('debug')('component:builder:resolver');
var resolve = require('path').resolve;
var exists = require('fs').exists;
var read = require('fs').readFile;
var join = require('path').join;
var Batch = require('batch');
var utils = require('./utils');

/**
 * Expose `Resolver`
 */

module.exports = Resolver;

/**
 * Initialize a new `Resolver`.
 *
 * @param {String} path
 * @param {Resolver} parent
 * @param {Function} fn
 * @api public
 */

function Resolver(path, parent, fn){
  if (!(this instanceof Resolver)) return new Resolver(path, parent, fn);
  if ('function' == typeof parent) fn = parent, parent = null;
  this.path = path;
  this.inherit(parent || {});
  if (fn) this.end(fn);
}

/**
 * Add global `path`.
 *
 * @param {String} path
 * @return {Resolver}
 * @api public
 */

Resolver.prototype.add = function(path){
  this.paths.push(resolve(this.path, path));
  return this;
};

/**
 * Inherit from a `parent` resolver.
 *
 * @param {Object} parent
 * @api private
 */

Resolver.prototype.inherit = function(parent){
  this.paths = parent.paths || [this.path + '/components'];
  this._ignored = parent._ignored || {};
  this.cache = parent.cache || {};
  this.list = parent.list || [];
  this.parent = parent;
  this.locals = [];
};

/**
 * Allow `dev` dependencies.
 *
 * @api public
 */

Resolver.prototype.development = function(){
  this.dev = true;
  return this;
};

/**
 * Check if `dep` is ignored.
 *
 * @param {String} dep
 * @return {Boolean}
 * @api private
 */

Resolver.prototype.ignored = function(dep){
  dep = dep.replace('/', '-');
  return this._ignored[dep];
};

/**
 * Ignore `dep`.
 *
 * @param {String} dep
 * @api private
 */

Resolver.prototype.ignore = function(dep){
  if (this.ignored(dep)) return;
  debug('ignore %s', dep);
  dep = dep.replace('/', '-');
  this._ignored[dep] = true;
  return this;
};

/**
 * Get the component conf and invoke `fn(err, obj)`.
 *
 * @param {Function} fn
 * @ap private
 */

Resolver.prototype.json = function(fn){
  var path = join(this.path, 'component.json');
  var self = this;
  read(path, 'utf-8', function(err, str){
    if (err) return fn(err);
    try {
      self.conf = JSON.parse(str);
      utils.normalizeConfig(self.conf);
      self.configure(self.conf);
      debug('pulled %s conf', self.conf.name);
      fn(null, self.conf);
    } catch (e) {
      fn(e);
    }
  });
};

/**
 * Resolve this component and all it's
 * dependencies recursively and call `fn(err, all)`.
 *
 * @param {Function} fn
 * @api private
 */

Resolver.prototype.end = function(fn){
  var self = this;
  self.json(function(err, conf){
    if (err) return fn(err);
    var batch = new Batch;
    self.list.push(self);
    batch.push(self.pull('templates'));
    batch.push(self.pull('scripts'));
    batch.push(self.pull('styles'));
    batch.push(self.pull('json'));
    batch.push(self.deps.bind(self));
    batch.end(function(err){
      if (err) return fn(err);
      fn(null, self.map());
    });
  });
};

/**
 * Resolve all deps and call `done(err)`.
 *
 * @param {Function} done
 * @api private
 */

Resolver.prototype.deps = function(done){
  var deps = this.dependencies();
  var names = Object.keys(deps);
  var batch = new Batch;
  var self = this;

  if (0 == deps.length) {
    debug('skip %s deps', this.conf.name);
    setImmediate(done);
    return;
  }

  names.forEach(function(dep){
    if (self.ignored(dep)) return;
    self.ignore(dep);
    batch.push(function(done){
      self.resolve(dep, function(err, dir){
        if (err) return done(err);
        Resolver(dir, self, done);
      });
    });
  });

  batch.end(done);
};

/**
 * Pull sources of `type`.
 *
 * @param {String} type
 * @return {Function}
 * @api public
 */

Resolver.prototype.pull = function(type){
  var all = this.conf[type];
  var self = this;

  if (!this.conf[type]) {
    debug('skip %s %s', this.conf.name, type);
    return noop;
  }

  return function(done){
    var batch = new Batch;
    var files = [];

    debug('%s pull %d %s', self.conf.name, all.length, type);

    all.forEach(function(filename){
      var resolved = resolve(self.path, filename);
      batch.push(function(done){
        read(resolved, 'utf8', function(err, str){
          if (err) return done(err);
          var obj = {};
          obj.filename = filename;
          obj.contents = str;
          files.push(obj);
          done();
        });
      });
    });

    batch.end(function(err){
      if (err) return done(err);
      self.conf[type] = files;
      debug('%s pulled %d %s', self.conf.name, files.length, type);
      done();
    });
  };
};

/**
 * Lookup `dep` dir and invoke `fn(err, dir)`.
 *
 * @param {String} dep
 * @param {Function} fn
 * @api private
 */

Resolver.prototype.resolve = function(dep, fn){
  this.locals = this.locals.concat(this.parent.locals);
  var paths = this.paths.concat(this.locals);
  var dep = dep.replace('/', '-');
  var name = this.conf.name;
  var cache = this.cache;
  var self = this;
  var i = 0;

  function next(){
    var path = paths[i++];
    if (!path) return fn(new Error('failed to resolve "' + name + '"\'s dependency "' + dep + '"'));
    var dir = join(path, dep);
    var key = dep + ':' + dir;
    if (cache[key]) return fn(null, cache[key]);
    var json = join(dir, 'component.json');
    exists(json, function(exists){
      if (!exists) return next();
      cache[key] = dir;
      fn(null, dir);
    });
  }

  next();
};

/**
 * Map and normalize dependencies.
 *
 * @return {Array}
 * @api public
 */

Resolver.prototype.dependencies = function(){
  var deps = this.conf.dependencies || {};
  if (this.dev) merge(deps, this.conf.development);
  merge(deps, this.local());
  return deps;
};

/**
 * Get all local deps.
 *
 * @return {Object}
 * @api private
 */

Resolver.prototype.local = function(){
  var local = this.conf.local
    || this.conf.locals
    || [];

  return local.reduce(function(ret, name){
    ret[name] = '*';
    return ret;
  }, {});
};

/**
 * Map component's `json`
 *
 * @return {Array}
 * @api private
 */

Resolver.prototype.map = function(){
  return this.list.map(function(resolver){
    return resolver.conf;
  });
};

/**
 * Configure `conf`.
 *
 * @param {Object} conf
 * @api private
 */

Resolver.prototype.configure = function(conf){
  var paths = conf.paths || [];
  var self = this;

  this.locals = paths.map(function(path){
    return resolve(self.path, path);
  });

  conf.path = function(path){
    return 1 == arguments.length
      ? resolve(self.path, path)
      : self.path;
  };
};

/**
 * Merge `a`, `b`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */

function merge(a, b){
  for (var k in b) a[k] = b[k];
  return a;
}

/**
 * Noop
 */

function noop(fn){
  setImmediate(fn);
}
