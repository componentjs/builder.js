# builder.js

  Component build tool. This is the library that `component(1)` utilizes
  to perform component builds.

## Installation

    $ npm install component-builder

## API

### new Builder(dir)

  Creates a new `Builder` for the given component's `dir`:

```js
var Builder = require('component-builder');
var builder = new Builder('components/visionmedia-page');
```

### Builder#development()

  Include development dependencies.

### Builder#ignore(name, [type])

  Ignore building `name`'s `type`, where `type` is "scripts" or "styles". When
  no `type` is given both are ignored, this includes dependencies of `name` as well.

```js
builder.ignore('visionmedia-page')
```

### Builder#build(fn)

  Perform the build and pass an object to `fn(err, obj)` containing
  the `.css` and `.js` properties.

## License 

(The MIT License)

Copyright (c) 2012 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

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