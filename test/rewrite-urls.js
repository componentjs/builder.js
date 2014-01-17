
var Builder = require('..');
var rewrite = Builder.rewriteUrls;
var concat = Builder.concat;

describe('rewriteUrls', function(){
  it('should rewrite css urls', function(done){
    var builder = new Builder('test/fixtures/assets-parent');
    builder.path('..');
    builder.use(rewrite('build'));
    builder.use(concat('styles'));
    builder.build(function(err, build){
      if (err) return done(err);
      build.styles.should.include('url("build/assets/images/logo.png")');
      build.styles.should.include('url("build/assets/images/maru.jpeg")');
      build.styles.should.include('url("build/assets/images/npm.png")');
      build.styles.should.include('url(http://example.com/images/manny.png)');
      build.styles.should.include('url(/public/images/foo.png)')
      build.styles.should.include('url(data:image/png;base64,PNG DATA HERE)');
      done();
    });
  })
})
