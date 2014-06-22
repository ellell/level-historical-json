var test = require('tap').test
  , db = require('level-test')()
  , series = require('run-series')

  , Service = require('./level-historical-json')

test('should be able to save and get data', function (t) {
  var service = Service(db())
    , tasks = []

  tasks.push(function (callback) {
    service.put({beep: 'boop'}, callback)
  })
  tasks.push(function (callback) {
    service.put({foo: 'bar'}, callback)
  })
  tasks.push(function (callback) {
    service.put({hey: 'ahoy'}, callback)
  })
  tasks.push(function (callback) {
    service.get(function (err, res) {
      if (err) return callback(err)

      t.equal(res.length, 3)
      t.equal(res[0].beep, 'boop')
      t.equal(res[1].foo, 'bar')
      t.equal(res[2].hey, 'ahoy')
      callback()
    })
  })

  series(tasks, function (err) {
    t.notOk(err)

    t.end()
  })
})

test('should be able to update data', function (t) {
  var service = Service(db())
    , tasks = []
    , obj = {
      beep: 'boop'
      , foo: 'bar'
      , hey: 'ahoy'
    }

  tasks.push(function (callback) {
    service.put(obj, callback)
  })

  tasks.push(function (callback) {
    service.get(function (err, res) {
      if (err) return callback(err)

      t.equal(res[0].beep, 'boop')
      t.equal(res[0].foo, 'bar')
      t.equal(res[0].hey, 'ahoy')

      var newEvent = res[0]
      service.put({ hey: 'updated', key: res[0].key }, callback)
    })
  })

  tasks.push(function (callback) {
    service.get(function (err, res) {
      if (err) console.log('err', err)

      t.equal(res[0].beep, 'boop')
      t.equal(res[0].foo, 'bar')
      t.equal(res[0].hey, 'updated')

      callback()
    })
  })

  series(tasks, function (err) {
    t.notOk(err)

    t.end()
  })
})
