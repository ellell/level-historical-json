var endpoint = require('endpoint')
  , Sublevel = require('level-sublevel')
  , subStream = require('level-sublevel-stream')
  , series = require('run-series')
  , ObjectId = require('node-time-uuid')

  , LHJ = function (db) {
    if (!(this instanceof LHJ))
      return new LHJ(db)

    this.db = db
  }

LHJ.prototype.put = function (obj, callback) {
  var subKey = obj.key || new ObjectId()
    , db = Sublevel(this.db).sublevel(subKey, { valueEncoding: 'json' })
    , ops = []

  Object.keys(obj).forEach(function (key, i) {
    if (key === 'key')
      return

    var value = {}
    value[key] = obj[key]

    ops.push({
      type: 'put'
      , key: new ObjectId()
      , value: value
    })
  })

  db.batch(ops, callback)
}

LHJ.prototype._getSubKeys = function (query, callback) {
  if (typeof query === 'function') {
    callback = query
    query = {}
  }

  subStream(this.db, query)
    .pipe(endpoint({ objectMode: true }, function (err, subkeys) {
      if (err) return callback(err)

      callback(null, subkeys)
    }))
}

LHJ.prototype.get = function (query, callback) {
  var self = this
    , tasks = []
    , getLatestValues

  if (typeof query === 'function') {
    callback = query
    query = {}
  }

  getLatestValues = function (subkey) {
    return function (callback) {
      var subdb = Sublevel(self.db).sublevel(subkey, { valueEncoding: 'json' })
        , obj = {
          key: subkey
        }

      subdb.createReadStream()
        .pipe(endpoint({ objectMode: true }, function (err, objParts) {
          if (err) return callback(err)

          for (var i = 0;  objParts.length > i; i++) {
            for (prop in objParts[i].value) {
              obj[prop] = objParts[i].value[prop]
            }
          }

          callback(null, obj)
        }))
    }
  }

  this._getSubKeys(query, function (err, subkeys) {
    if (err) return callback(err)

    tasks = subkeys.map(getLatestValues)
    series(tasks, callback)
  })
}

LHJ.prototype.getHistorical = function (query, callback) {
  var self = this
    , tasks = []
    , getHistoricalValues

  if (typeof query === 'function') {
    callback = query
    query = {}
  }

  getHistoricalValues = function (subkey) {
    return function (callback) {
      var subdb = Sublevel(self.db).sublevel(subkey, { valueEncoding: 'json' })
        , obj = {}

      subdb.createReadStream()
        .pipe(endpoint({ objectMode: true }, function (err, objParts) {
          if (err) return callback(err)

          var values = {}
            , changes = []

          for (var i = 0;  objParts.length > i; i++) {

            var partKey = objParts[i].key
              , partValue = objParts[i].value
              , partProp = Object.keys(partValue)[0]

            if (values[partProp] !== undefined)
              changes.push({
                from: values[partProp]
                , to: partValue[partProp]
                , property: partProp
                , at: new ObjectId(objParts[i].key).getDate()
              })

            values[partProp] = partValue[partProp]
          }

          if (changes.length)
            obj = {
              key: subkey
              , changes: changes
            }

          callback(null, obj)
        }))
    }
  }

  this._getSubKeys(query, function (err, subkeys) {
    if (err) return callback(err)

    tasks = subkeys.map(getHistoricalValues)
    series(tasks, callback)
  })
}

module.exports = LHJ