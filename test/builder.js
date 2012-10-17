
/**
 * Module dependencies.
 */

var Builder = require('..')
  , fs = require('fs')
  , read = fs.readFileSync;

describe('Builder', function(){
  describe('.buildScripts(fn)', function(){
    it('should build the scripts', function(done){
      var builder = new Builder('test/fixtures/hello');
      builder.buildScripts(function(err, js){
        if (err) return done(err);
        var out = read('test/fixtures/hello-js.js', 'utf8');
        js.should.equal(out);
        done();
      })
    })

    it('should buffer components only once', function(done){
      var builder = new Builder('test/fixtures/boot');
      builder.buildScripts(function(err, js){
        if (err) return done(err);
        var out = read('test/fixtures/ignore.js', 'utf8');
        js.should.equal(out);
        done();
      })
    })

    it('should emit "dependency" events', function(done){
      var builder = new Builder('test/fixtures/hello');
      builder.buildScripts(function(){});
      builder.on('dependency', function(builder){
        builder.dir.should.be.a('string');
        builder.name.should.equal('component-emitter');
        done();
      });
    })
  })

  describe('.buildStyles(fn)', function(){
    it('should build the styles', function(done){
      var builder = new Builder('test/fixtures/hello');
      builder.buildStyles(function(err, css){
        if (err) return done(err);
        var out = read('test/fixtures/hello.css', 'utf8');
        css.should.equal(out);
        done();
      })
    })

    it('should emit "dependency" events', function(done){
      var builder = new Builder('test/fixtures/hello');
      builder.buildStyles(function(){});
      builder.on('dependency', function(builder){
        builder.dir.should.be.a('string');
        builder.name.should.equal('component-emitter');
        done();
      });
    })
  })

  describe('.build(fn)', function(){
    it('should build js', function(done){
      var builder = new Builder('test/fixtures/hello');
      builder.build(function(err, res){
        if (err) return done(err);
        var out = read('test/fixtures/hello.js', 'utf8');
        res.js.should.equal(out);
        done();
      })
    })

    it('should build css', function(done){
      var builder = new Builder('test/fixtures/hello');
      builder.build(function(err, res){
        if (err) return done(err);
        var out = read('test/fixtures/hello.css', 'utf8');
        res.css.should.equal(out);
        done();
      })
    })

    it('should load the require.js script', function(done){
      var builder = new Builder('test/fixtures/hello');
      builder.build(function(err, res){
        if (err) return done(err);
        var out = require('component-require');
        res.require.should.equal(out);
        done();
      })
    })
  })

  it('should build bundled dependencies', function(done){
    var builder = new Builder('test/fixtures/bundled');
    builder.build(function(err, res){
      if (err) return done(err);
      res.js.should.include('component-popover/index.js');
      res.js.should.include('component-emitter/index.js');
      res.js.should.include('component-jquery/index.js');
      done();
    })
  })

  it('should not build development dependencies by default', function(done){
    var builder = new Builder('test/fixtures/dev-deps');
    builder.build(function(err, res){
      if (err) return done(err);
      res.js.should.include('component-emitter/index.js');
      res.js.should.not.include('component-jquery/index.js');
      done();
    })
  })

  describe('.setLookups()', function(){
    it('should build dependencies from a default location string', function(done){
      var builder = new Builder('test/fixtures/lookups/deep');
      builder.setLookups('test/fixtures');
      builder.build(function(err, res){
        if (err) return done(err);
        var out = read('test/fixtures/lookups-deep-js.js', 'utf8');
        res.js.should.equal(out);
        done();
      })
    })

    it('should build dependencies from array of locations', function(done){
      var builder = new Builder('test/fixtures/lookups/deep2');
      builder.setLookups(['test/fixtures', 'examples/components']);
      builder.build(function(err, res){
        if (err) return done(err);
        var out = read('test/fixtures/lookups-deep2-js.js', 'utf8');
        res.js.should.equal(out);
        done();
      })
    })
    
    it('can build scripts for dependencies of dependencies...', function(done){
      var builder = new Builder('test/fixtures/lookups/deep3');
      builder.setLookups(['test/fixtures', 'examples/components']);
      builder.build(function(err, res){
        if (err) return done(err);
        var out = read('test/fixtures/lookups-deep3-js.js', 'utf8');
        res.js.should.equal(out);
        done();
      })
    })
  })

  describe('.development()', function(){
    it('should build development dependencies', function(done){
      var builder = new Builder('test/fixtures/dev-deps');
      builder.development();
      builder.build(function(err, res){
        if (err) return done(err);
        res.js.should.include('component-emitter/index.js');
        res.js.should.include('component-jquery/index.js');
        done();
      })
    })
  })

  describe('.ignore(name)', function(){
    it('should ignore the given component and its deps', function(done){
      var builder = new Builder('test/fixtures/hello');
      builder.ignore('component/emitter');
      builder.build(function(err, res){
        if (err) return done(err);
        var out = read('test/fixtures/hello-ignore.js', 'utf8');
        res.js.should.equal(out);
        done();
      })
    })
  })

  it('should support "main"', function(done){
    var builder = new Builder('test/fixtures/main-boot');
    builder.build(function(err, res){
      if (err) return done(err);
      res.js.should.include('require.alias("main-boot/boot.js", "main-boot/index.js")');
      res.js.should.include('require.alias("main/foo.js", "main-boot/deps/main/index.js")');
      done();
    })
  })
})