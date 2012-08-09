
# component-builder

  Component build tool. This is the library that `component(1)` utilizes
  to perform component builds.

## Installation

    $ npm install component-builder

## API
   - [Builder](#builder)
     - [.buildScripts(fn)](#builder-buildscriptsfn)
     - [.buildStyles(fn)](#builder-buildstylesfn)
     - [.build(fn)](#builder-buildfn)
<a name="" />
 
<a name="builder" />
## Builder
<a name="builder-buildscriptsfn" />
### .buildScripts(fn)
should build the scripts.

```js
var builder = new Builder('test/fixtures/hello');
builder.buildScripts(function(err, js){
  if (err) return done(err);
  var out = read('test/fixtures/hello.js', 'utf8');
  js.should.equal(out);
  done();
})
```

<a name="builder-buildstylesfn" />
### .buildStyles(fn)
should build the styles.

```js
var builder = new Builder('test/fixtures/hello');
builder.buildStyles(function(err, css){
  if (err) return done(err);
  var out = read('test/fixtures/hello.css', 'utf8');
  css.should.equal(out);
  done();
})
```

<a name="builder-buildfn" />
### .build(fn)
should build js.

```js
var builder = new Builder('test/fixtures/hello');
builder.build(function(err, res){
  if (err) return done(err);
  var out = read('test/fixtures/hello.js', 'utf8');
  res.js.should.equal(out);
  done();
})
```

should build css.

```js
var builder = new Builder('test/fixtures/hello');
builder.build(function(err, res){
  if (err) return done(err);
  var out = read('test/fixtures/hello.css', 'utf8');
  res.css.should.equal(out);
  done();
})
```

## License 

(The MIT License)

Copyright (c) 2012 TJ Holowaychuk &lt;tj@vision-media.caa&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.