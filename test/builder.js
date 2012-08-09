
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
        var out = read('test/fixtures/hello.js', 'utf8');
        js.should.equal(out);
        done();
      })
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
  })
})