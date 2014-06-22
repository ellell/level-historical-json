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

test('should be able to get historical changes', function (t) {
  var service = Service(db())
    , tasks = []

    tasks.push(function (callback) {
      service.put({title: 'title', test: 'test'}, callback)
    })

    tasks.push(function (callback) {
      service.get(function (err, res) {
        if (err) return callback(err)

        t.equal(res[0].title, 'title')
        t.equal(res[0].test, 'test')

        service.put({ title: 'new title', key: res[0].key }, callback)
      })
    })

    tasks.push(function (callback) {
      service.getHistorical(function (err, history) {
        if (err) return callback(err)

        t.equal(history[0].changes.length, 1)
        t.equal(history[0].changes[0].from, 'title')
        t.equal(history[0].changes[0].to, 'new title')
        t.equal(history[0].changes[0].property, 'title')
        t.deepEqual(Object.keys(history[0].changes[0]), ['from', 'to', 'property', 'at'])
        callback(null, history)
      })
    })

    series(tasks, function (err, res) {
      t.notOk(err)

      t.end()
    })
})
