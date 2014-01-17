
var exec = require('child_process').exec;
var exists = require('fs').existsSync;
var Builder = require('..');
var symlink = Builder.symlink;
var fs = require('fs');

describe('symlink', function(){
  beforeEach(function(done){
    exec('rm -rf /tmp/build', done);
  })

  it('should copy `type` to `dest`', function(done){
    var builder = new Builder('test/fixtures/assets');
    builder.use(symlink('images', '/tmp/build'));
    builder.path('..');
    builder.build(function(err){
      if (err) return done(err);
      exists('/tmp/build/assets/images/maru.jpeg').should.be.true;
      exists('/tmp/build/assets/images/logo.png').should.be.true;
      exists('/tmp/build/assets/images/npm.png').should.be.true;
      fs.lstat('/tmp/build/assets/images/npm.png', function(err, stats) {
        if (err) return done(err);
        stats.isSymbolicLink().should.be.true;
        done();
      });
    })
  })
})
