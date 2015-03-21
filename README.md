recurve-cache [![Build Status](https://secure.travis-ci.org/sebastiencouture/recurve-cache.png?branch=master)](https://travis-ci.org/sebastiencouture/recurve-cache)
===

Simple cache Javascript library for the browser and Node.js.

Count and cost based cache.

Items are cached up to a total count and cost limit. Once either limits are reached then items
are removed. Most costly items are removed first, as a tie breaker or if there are no costs
then items are removed by least recently added.

## Usage

### Example

No count or cost limit
```javascript
var cache = new Cache();
cache.set("a", 1);
cache.get("a"); // returns 1
```

Count based cache
```javascript
var cache = new Cache(2);
cache.set("a", 1);
cache.set("b", 2);
cache.set("c", 3); // "a" is removed since it is the least recently added
```

Cost based cache
```javascript
var cache = new Cache(null, 3);
cache.set("a", "valueA", 1);
cache.set("b", "valueB", 2);
cache.set("c", "valueC", 1); // "b" is removed since the total cost
                             // exceeds 3 and "b" is the most costly
```

For more examples, take a look at the [unit tests](test/recurve-cache.spec.js)

## Running the Tests

```
grunt test
```

## Installation

The library is UMD compliant. Registers on `window.Cache` for global.

```
npm install recurve-cache
```

## Browser Support

IE6+

## License

The MIT License (MIT)

Copyright (c) 2015 Sebastien Couture

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.