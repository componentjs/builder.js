
var Lookup = require('../lib/lookup');

describe('Lookup', function(){
  it('should add implicit ./components dir to lookup paths', function(done){
    var lookup = Lookup('test/fixtures/app');
    lookup.end(function(err, res){
      if (err) return done(err);
      res[1].name.should.eql('foo');
      res[2].name.should.eql('bar');
      done();
    });
  })

  describe('.development()', function(){
    it('should include development dependencies', function(done){
      var lookup = new Lookup('test/fixtures/dev-deps');
      lookup.add('..');
      lookup.development();
      lookup.end(function(err, res){
        if (err) return done(err);
        res[1].name.should.eql('emitter');
        res[2].name.should.eql('jquery');
        done();
      })
    })
  })

  describe('nested', function(){
    it('should work', function(done){
      var nested = Lookup('test/fixtures/nested');
      nested.add('..');
      nested.end(function(err, arr){
        if (err) return done(err);
        arr.length.should.eql(3);
        arr[0].name.should.eql('nested');
        arr[1].name.should.eql('one');
        arr[2].name.should.eql('two');
        done();
      });
    })
  })

  describe('collision', function(){
    it('should work', function(done){
      var collision = Lookup('test/fixtures/collision');
      collision.end(done);
    })
  })

  describe('scripts', function(){
    it('should pull them', function(done){
      var scripts = Lookup('test/fixtures/hello');
      scripts.add('..');
      scripts.end(function(err, all){
        if (err) return done(err);
        var hello = all.shift();
        hello.scripts.length.should.eql(2);
        var foo = hello.scripts.shift();
        foo.filename.should.eql('foo.js');
        foo.contents.should.eql('module.exports = \'foo\';');
        var bar = hello.scripts.shift();
        bar.filename.should.eql('bar.js');
        bar.contents.should.eql('module.exports = \'bar\';');
        done();
      })
    })
  })

  describe('templates', function(){
    it('should pull them', function(done){
      var templates = Lookup('test/fixtures/template-strings');
      templates.end(function(err, all){
        if (err) return done(err);
        all.length.should.eql(1);
        var tpl = all[0].templates.shift();
        tpl.filename.should.eql('index.html');
        tpl.contents.should.eql('<div></div>');
        done();
      });
    })
  })

  describe('styles', function(){
    it('should pull them', function(done){
      var styles = Lookup('test/fixtures/hello');
      styles.add('..');
      styles.end(function(err, all){
        if (err) return done(err);
        var styles = all.shift().styles;
        var foo = styles.shift();
        var bar = styles.shift();
        foo.contents.should.eql('foo {\n  bar: \'baz\';\n}');
        bar.contents.should.eql('bar {\n  baz: \'raz\';\n}');
        done();
      });
    })
  })

  describe('json', function(){
    it('should pull them', function(done){
      var json = Lookup('test/fixtures/json');
      json.end(function(err, all){
        if (err) return done(err);
        var json = all[0].json.shift();
        json.filename.should.eql('index.json');
        json.contents.should.eql('{\n  "key": "value"\n}');
        done();
      });
    })
  })

  describe('failure', function(){
    it('should error on failed dep lookup', function(done){
      var failure = Lookup('test/fixtures/bundled');
      failure.end(function(err){
        err.message.should.equal('failed to lookup "hello"\'s dependency "foo"');
        done();
      });
    })
  })
})
