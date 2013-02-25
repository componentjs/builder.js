
/**
 * Module dependencies.
 */

var Builder = require('..')
  , assert = require('better-assert')
  , exec = require('child_process').exec
  , path = require('path')
  , ejs = require('ejs')
  , resolve = path.resolve
  , fs = require('fs')
  , vm = require('vm')
  , realpath = fs.realpathSync
  , exists = fs.existsSync
  , read = fs.readFileSync;

function ejsPlugin(builder) {
  builder.hook('before scripts', function(pkg, fn){
    var tmpls = pkg.conf.templates;
    if (!tmpls) return fn();
    tmpls.forEach(function(file){
      var path = pkg.path(file);
      var str = fs.readFileSync(path, 'utf8');
      var fn = ejs.compile(str, { client: true, compileDebug: false });
      var js = 'module.exports = ' + fn;
      var name = file.split('.')[0] + '.js';
      pkg.addFile('scripts', name, js);
    });
    fn();
  })
}

describe('Builder hooks', function(){
  describe('"before <type>"', function(){
    it('should allow injection of fabricated files', function(done){
      var builder = new Builder('test/fixtures/template-plugin');
      builder.addLookup('test/fixtures');
      builder.use(ejsPlugin);

      builder.build(function(err, res){
        if (err) return done(err);
        var js = res.require + res.js + 'require("templates")';
        var ret = vm.runInNewContext(js);
        ret.should.equal('<p>Hello Tobi</p>');
        done();
      })
    })

    it('should allow injection of fabricated files from purely compiled components', function(done) {
      var builder = new Builder('test/fixtures/template-plugin-pure');
      builder.use(ejsPlugin);

      builder.build(function(err, res){
        if (err) return done(err);
        var js = res.require + res.js + 'require("templates")';
        var ret = vm.runInNewContext(js);
        ret({user: {name: 'Tobi'}}).should.equal('<p>Hello Tobi</p>');
        done();
      })
    })

    it('should work with dependencies', function(done){
      var builder = new Builder('test/fixtures/template-plugin-parent');
      builder.addLookup('test/fixtures');
      builder.use(ejsPlugin);

      builder.build(function(err, res){
        if (err) return done(err);
        var js = res.require + res.js + 'require("parent")';
        var ret = vm.runInNewContext(js);
        ret.should.equal('<p>Hello Tobi</p>');
        done();
      })
    })

    it('should catch hook errors', function (done) {
      var builder = new Builder('test/fixtures/template-plugin');
      builder.addLookup('test/fixtures');
      builder.hook('before scripts', function (pkg, cb) {
        cb(new Error('hook error'));
      });

      builder.build(function(err, res){
        err.message.should.equal('hook error');
        done();
      })
    })
  })
})
