
var exec = require('child_process').exec;
var read = require('fs').readFileSync;
var exists = require('fs').existsSync;
var Builder = require('..');
var commonjs = Builder.commonjs;
var concat = Builder.concat;
var vm = require('vm');
var fs = require('fs');

describe('commonjs', function(){
  it('should wrap scripts', function(done){
    var builder = new Builder('test/fixtures/hello');
    builder.path('..');
    builder.use(commonjs('scripts'));
    builder.use(concat('scripts'));
    builder.build(function(err, ctx){
      if (err) return done(err);
      var js = ctx.scripts.trim();
      var out = read('test/fixtures/hello-js.js', 'utf8');
      js.should.eql(out.trim());
      done();
    });
  });

  it('should wrap json', function(done){
    var builder = new Builder('test/fixtures/json');
    builder.path('..');
    builder.use(commonjs('json'));
    builder.use(concat('json'))
    builder.build(function(err, ctx){
      if (err) return done(err);
      var out = read('test/fixtures/json.js', 'utf8');
      ctx.json.trim().should.eql(out.trim());
      done();
    });
  })

  it('should wrap templates', function(done){
    var builder = new Builder('test/fixtures/template-strings');
    builder.path('..');
    builder.use(commonjs('templates'));
    builder.use(concat('templates'));
    builder.build(function(err, ctx){
      if (err) return done(err);
      var out = read('test/fixtures/template.js', 'utf8');
      ctx.templates.trim().should.eql(out.trim());
      done();
    });
  });

  it('should include dev dependencies when ctx.dev is true', function(done){
    var builder = new Builder('test/fixtures/dev-deps');
    builder.path('..');
    builder.development();
    builder.use(commonjs('scripts'));
    builder.use(concat('scripts'));
    builder.build(function(err, build){
      if (err) return done(err);
      build.scripts.should.include('component-emitter/index.js');
      build.scripts.should.include('component-jquery/index.js');
      var js = [build.requirejs, build.scripts, build.aliases];
      var out = vm.runInNewContext(js.join('') + '\n;require("popover");');
      out.should.eql('jquery');
      done();
    });
  })

  it('should expose name aliases for root dependencies', function(done){
    var builder = new Builder('test/fixtures/root-aliases');
    builder.path('../components');
    builder.use(commonjs('scripts'));
    builder.use(concat('scripts'));
    builder.build(function(err, ctx){
      if (err) return done(err);
      var js = ctx.requirejs;
      js += ctx.scripts;
      js += ctx.aliases;
      var ret = vm.runInNewContext(js + '\nrequire("jquery");');
      ret.should.eql('jquery');
      done();
    });
  })

  it('should build aliases correctly', function(done){
    var builder = new Builder('test/fixtures/aliases');
    builder.path('..');
    builder.use(commonjs('scripts'));
    builder.use(concat('scripts'));
    builder.build(function(err, build){
      if (err) return done(err);
      var js = build.requirejs
        + build.scripts
        + build.aliases;

      var out = vm.runInNewContext(js + '\nrequire("aliases");')
      done();
    });
  })

  it('should be able to build templates, scripts, json together', function(done){
    var builder = new Builder('test/fixtures/combined');
    builder.path('..');
    builder.use(commonjs('templates'));
    builder.use(commonjs('scripts'));
    builder.use(commonjs('json'));
    builder.use(concat('templates'));
    builder.use(concat('scripts'));
    builder.use(concat('json'));
    builder.build(function(err, build){
      if (err) return done(err);
      var out = read('test/fixtures/combined.js', 'utf8');
      var js = build.requirejs
        + build.scripts
        + build.templates
        + build.json
        + build.aliases;

      js.trim().should.eql(out.trim());
      done();
    });
  })
})
