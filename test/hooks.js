
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
  builder.hook('before scripts', function(pkg){
    var tmpls = pkg.conf.templates;
    if (!tmpls) return;
    tmpls.forEach(function(file){
      var path = pkg.path(file);
      var str = fs.readFileSync(path, 'utf8');
      var fn = ejs.compile(str, { client: true, compileDebug: false });
      var js = 'module.exports = ' + fn;
      pkg.addFile('scripts', 'user.js', js);
    });
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
  })
})