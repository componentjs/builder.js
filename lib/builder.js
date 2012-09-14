
/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , join = path.join
  , Batch = require('batch')
  , debug = require('debug')('component:builder')
  , Emitter = require('events').EventEmitter
  , requirejs = require('component-require')
  , basename = path.basename;

/**
 * Expose `Builder`.
 */

module.exports = Builder;

/**
 * Initialize a new `Builder` with the given component `dir`.
 *
 * @param {String} dir
 * @param {Builder} parent
 * @api private
 */

function Builder(dir, parent) {
  this.dir = dir;
  this.root = ! parent;
  this.parent = parent;
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
 * Enable "devDependencies" in the build.
 *
 * @api public
 */

Builder.prototype.development = function(){
  debug('dev dependencies enabled');
  this.dev = true;
};

/**
 * Check if this build has deps.
 *
 * @return {Boolean}
 * @api private
 */

Builder.prototype.hasDependencies = function(){
  var conf = this.conf;
  if (conf.bundled) return true;
  if (conf.dependencies) return true;
  if (this.dev && conf.development) return true;
};

/**
 * Return bundled dependencies object.
 *
 * @return {Object}
 * @api public
 */

Builder.prototype.bundled = function(){
  return this.conf.bundled.reduce(function(obj, name){
    obj[name] = '*';
    return obj;
  }, {});
};

/**
 * Return dependencies.
 *
 * @return {Object}
 * @api private
 */

Builder.prototype.dependencies = function(){
  var conf = this.conf;
  var deps = conf.dependencies || {};
  if (this.dev) merge(deps, conf.development || {});
  if (conf.bundled) merge(deps, this.bundled());
  return deps;
};

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
      this.ignored[type].push(normalize(name[i]));
    }
  } else {
    this.ignored[type].push(normalize(name));
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
 * NOTE: Batch maintains result ordering (res.shift()s here)
 *
 * @param {Function} fn
 * @api public
 */

Builder.prototype.build = function(fn){
  var batch = new Batch;
  debug('building %s', this.dir);
  batch.push(this.buildScripts.bind(this));
  batch.push(this.buildAliases.bind(this));
  batch.push(this.buildStyles.bind(this));
  batch.end(function(err, res){
    if (err) return fn(err);
    fn(null, {
      js: res.shift() + '\n' + res.shift(),
      css: res.shift(),
      require: requirejs
    });
  });
};

/**
 * Build require() aliases.
 *
 * This is necessary to allow
 * several components of the same
 * name to be used. For example "learnboost/popover"
 * and "visionmedia/popover" may co-exist within
 * an application using this technique, as they
 * are linked as shown here:
 *
 *    ./user
 *      ./deps
 *        ./inherit -> component-inherit
 *   
 *    ./animal
 *      ./deps
 *        ./inherit -> component-inherit
 *   
 *    ./component-inherit
 *   
 *    ./pet-list
 *      ./deps
 *        ./pet -> pet
 *   
 *    ./user-list
 *      ./deps
 *        ./user -> user
 *   
 *    ./boot
 *      ./deps
 *        ./pet-list -> pets-list
 *        ./user-list -> pets-list
 *
 * TODO: buildScripts() should do this, so that
 * lazily-built components do not omit aliases.
 *
 * TODO: refactor, this is nasty
 *
 * @param {Function} fn
 * @api private
 */

Builder.prototype.buildAliases = function(fn){
  var self = this;
  this.json(function(err, conf){
    if (err) return fn(err);
    var aliases = [];
    var batch = new Batch;

    if (self.hasDependencies()) {
      Object.keys(self.dependencies()).forEach(function(dep){
        batch.push(function(done){
          dep = normalize(dep);
          self.lookup(dep, function(err, dir){
            if (err) return done(err);
            var builder = new Builder(dir, self);
            builder.json(function(err, conf){
              if (err) return done(err);
              if (!conf.scripts) return done(null, '');

              var aliases = conf.scripts.map(function(script){
                var name = builder.conf.name;
                // TODO: remove special-casing root
                var alias = self.root
                  ? self.conf.name + '/deps/' + name + '/' + script
                  : self.name + '/deps/' + name + '/' + script;
                var js = 'require.alias("' + builder.name + '/index.js", "' + alias + '");\n';
                return js;
              }).join('');

              builder.buildAliases(function(err, str){
                if (err) return done(err);
                done(null, aliases + str);
              });
            });
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

    // build dependencies
    if (self.hasDependencies()) {
      Object.keys(self.dependencies()).forEach(function(dep){
        dep = normalize(dep);

        // ignored
        if (self.ignoring(dep, type)) return debug('ignoring %s', dep);

        // ignore it so we dont have dups
        self.ignore(dep, type);

        // lookup dep
        batch.push(function(done){
          self.lookup(dep, function(err, dir){
            if (err) return done(err);
            debug('building dependency %s in %s', dep, dir);
            var builder = new Builder(dir, self);
            if (self.dev) builder.development();
            builder.ignored = self.ignored;
            self.emit('dependency', builder);
            builder.buildType(type, done, process);
          });
        });
      });
    }

    // build files
    if (conf[type]) {
      conf[type].forEach(function(file){
        var path = self.path(file);
        batch.push(function(done){
          fs.readFile(path, 'utf8', function(err, str){
            if (err) return fn(err);
            done(null, process(self, file, str));
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
  this.buildType('styles', fn, noop);
};

/**
 * No-op processor function.
 */

function noop(builder, file, str){
  return str;
}

/**
 * Return a js string representing a commonjs
 * client-side module with the given `builder`,
 * `file` and `js`.
 *
 * NOTE: Here we special-case the root script so
 * that for example if you are building "tip"
 * to test, you may require('tip') instead of
 * require('component-tip');
 *
 * TODO: ^ remove this special-casing for lazy-loading
 *
 * @param {Builder} builder
 * @param {String} file
 * @param {String} js
 * @return {String}
 * @api private
 */

function register(builder, file, js){
  file =  builder.root
    ? builder.conf.name + '/' + file
    : builder.name + '/' + file;

  return 'require.register("' + file + '", function(module, exports, require){\n'
    + js
    + '\n});';
}

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

function merge(a, b) {
  for (var key in b) a[key] = b[key];
  return a;
}

/**
 * Normalize package `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function normalize(name) {
  return name.replace('/', '-');
}
