
var Builder = require('..');
var vm = require('vm');

describe('Builder', function(){
  describe('.use()', function(){
    it('should push to batch', function(){
      var builder = new Builder(__dirname);
      builder.use(function(){});
      builder.batch.fns.length.should.eql(1);
    })
  })
})
