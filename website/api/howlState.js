const fs = require('fs')
const path = require('path')

var endpoint = function () {}

endpoint.route = '/api/howl/state'
endpoint.cacheDuration = '1 second'
endpoint.description = 'The current state of the howl...'

endpoint.configure = function (config) {

}

endpoint.render = function (req, res) {
  var data = {}
  try {
    data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../', 'state/howl-state.json'), 'utf8'))
  } catch (ex) {
    data.error = true
    data.message = 'Unable to read data file: ' + ex
    data.stack = ex.stack
  }
  // send response
  res.jsonp(data)
}

module.exports = endpoint
