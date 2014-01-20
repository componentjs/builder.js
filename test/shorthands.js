
var Builder = require('..');
var exec = require('child_process').exec;
var exists = require('fs').existsSync;
var fs = require('fs');
var read = require('fs').readFileSync;
var vm = require('vm');

describe('shorthands', function(){
  afterEach(function(done){
    exec('rm -rf /tmp/build', done);
  });

  describe('scripts', function(){
    it('should build scripts', function(done){
      var builder = new Builder('test/fixtures/hello');
      builder.path('..');
      builder.scripts(function(err, build){
        if (err) return done(err);
        var js = build.scripts.trim();
        var out = read('test/fixtures/hello-js.js', 'utf8').trim();
        js.should.eql(out);
        done();
      });
    });
  });

  describe('json', function(){
    it('should build json', function(done){
      var builder = new Builder('test/fixtures/json');
      builder.path('..');
      builder.json(function(err, build){
        if (err) return done(err);
        var js = build.json.trim();
        var out = read('test/fixtures/json.js', 'utf8').trim();
        js.should.eql(out);
        done();
      });
    });
  });

  describe('templates', function(){
    it('should build templates', function(done){
      var builder = new Builder('test/fixtures/template-strings');
      builder.path('..');
      builder.templates(function(err, build){
        if (err) return done(err);
        var js = build.templates.trim();
        var out = read('test/fixtures/template.js', 'utf8').trim();
        js.should.eql(out);
        done();
      });
    });
  });

  describe('styles', function(){
    it('should build styles', function(done){
      var builder = new Builder('test/fixtures/assets-parent');
      builder.path('..');
      builder.styles(function(err, build){
        if (err) return done(err);
        build.styles.should.include('url("assets/images/logo.png")');
        build.styles.should.include('url("assets/images/maru.jpeg")');
        build.styles.should.include('url("assets/images/npm.png")');
        build.styles.should.include('url(http://example.com/images/manny.png)');
        build.styles.should.include('url(/public/images/foo.png)')
        build.styles.should.include('url(data:image/png;base64,PNG DATA HERE)');
        done();
      });
    });

    it('should rewrite urls', function(done){
      var builder = new Builder('test/fixtures/assets-parent');
      builder.path('..');
      builder.styles({ rewriteUrls: 'build' }, function(err, build){
        if (err) return done(err);
        build.styles.should.include('url("build/assets/images/logo.png")');
        build.styles.should.include('url("build/assets/images/maru.jpeg")');
        build.styles.should.include('url("build/assets/images/npm.png")');
        build.styles.should.include('url(http://example.com/images/manny.png)');
        build.styles.should.include('url(/public/images/foo.png)')
        build.styles.should.include('url(data:image/png;base64,PNG DATA HERE)');
        done();
      });

    });
  });

  describe('images', function(){
    it('should build images', function(done){
      var builder = new Builder('test/fixtures/assets');
      builder.path('..');
      builder.images('/tmp/build', function(err){
        if (err) return done(err);
        exists('/tmp/build/assets/images/maru.jpeg').should.be.true;
        exists('/tmp/build/assets/images/logo.png').should.be.true;
        exists('/tmp/build/assets/images/npm.png').should.be.true;
        fs.lstat('/tmp/build/assets/images/npm.png', function(err, stats) {
          if (err) return done(err);
          stats.isSymbolicLink().should.be.false;
          done();
        });
      });
    });

    it('should symlink when option is true', function(done){
      var builder = new Builder('test/fixtures/assets');
      builder.path('..');
      builder.images('/tmp/build', { symlink: true }, function(err){
        if (err) return done(err);
        fs.lstat('/tmp/build/assets/images/npm.png', function(err, stats) {
          if (err) return done(err);
          stats.isSymbolicLink().should.be.true;
          done();
        });
      });
    });
  });

  describe('fonts', function(){
    it('should build fonts', function(done){
      var builder = new Builder('test/fixtures/fonts');
      builder.path('..');
      builder.fonts('/tmp/build', function(err){
        if (err) return done(err);
        fs.lstat('/tmp/build/fonts/montserrat-regular.ttf', function(err, stats) {
          if (err) return done(err);
          stats.isSymbolicLink().should.be.false;
          done();
        });
      });
    });

    it('should symlink when option is true', function(done){
      var builder = new Builder('test/fixtures/fonts');
      builder.path('..');
      builder.fonts('/tmp/build', { symlink: true }, function(err){
        if (err) return done(err);
        fs.lstat('/tmp/build/fonts/montserrat-regular.ttf', function(err, stats) {
          if (err) return done(err);
          stats.isSymbolicLink().should.be.true;
          done();
        });
      });
    });
  });
});