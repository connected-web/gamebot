const load = require('./load')
const connect = require('./connect')
const respond = require('./respond')
const handleError = require('./handleError')
const filesystem = require('./filesystem')

module.exports = function (options) {
  const api = {}

  api.bot = null
  api.matchers = []
  api.options = options
  api.load = load(api)
  api.connect = connect(api)
  api.respond = respond(api)
  api.handleError = handleError(api)
  api.filesystem = filesystem(api)

  return api
}
