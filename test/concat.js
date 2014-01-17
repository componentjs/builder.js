
var Builder = require('..');
var concat = Builder.concat;

describe('concat(type)', function(){
  it('should concat `type`', function(done){
    var builder = new Builder('test/fixtures/hello');
    builder.path('..');
    builder.use(concat('styles'));
    builder.build(function(err, ctx){
      if (err) return done(err);
      ctx.styles.should.eql('foo {\n  bar: \'baz\';\n}bar {\n  baz: \'raz\';\n}emitter {\n  \n}');
      done();
    });
  })
})
