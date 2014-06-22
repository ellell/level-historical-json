# level-historical-json

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
    "key": "53a6f7df04821698c36d365d000002",
    "hello": "world"
  }
]
[
  {
    "key": "53a6f7df04821698c36d365d000002",
    "changes": [
      {
        "from": "world",
        "to": "another world",
        "property": "hello",
        "at": "2014-06-22T15:35:59.000Z"
      }
    ]
  }
]
```

