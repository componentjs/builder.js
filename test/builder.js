
/**
 * Module dependencies.
 */

var Builder = require('..');

describe('Builder', function(){
  describe('.buildScripts(fn)', function(){
    it('should build the scripts', function(done){
      var builder = new Builder('test/fixtures/hello');
      builder.buildScripts(function(err, js){
        if (err) return done(err);
        console.log(js);
      })
    })
  })
})