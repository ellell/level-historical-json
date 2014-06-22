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