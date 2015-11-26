# level-historical-json

Keep a history of all the changes of a JSON document.

[![NPM](https://nodei.co/npm/level-historical-json.png?downloads&stars)](https://nodei.co/npm/level-historical-json/)

[![NPM](https://nodei.co/npm-dl/level-historical-json.png)](https://nodei.co/npm/level-historical-json/)

## Installation

```
npm install level-historical-json
```

## Example

### Input

```javascript
var db = require('level-test')()()
  , LHJ = require('./level-historical-json')(db)


LHJ.put({ 'hello': 'world' }, function (err) {
  LHJ.get(function (err, res) {
    console.log(JSON.stringify(res, undefined, 2))
    LHJ.put({ 'hello': 'another world', key: res[0].key }, function (err) {
      LHJ.getHistorical(function (err, res) {
        console.log(JSON.stringify(res, undefined, 2))
      })
    })
  })
})
```

### Output

```
[
  {
    "key": "53a7dc28061c9998c36dfebe000002",
    "hello": "world"
  }
]
[
  {
    "key": "53a7dc28061c9998c36dfebe000002",
    "changes": [
      {
        "from": "world",
        "to": "another world",
        "property": "hello",
        "at": "2014-06-23T07:50:00.000Z"
      }
    ]
  }
]
```


## License

Copyright (c) 2014 Lisa Övermyr

This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
