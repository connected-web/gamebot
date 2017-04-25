const loadMatchers = require('./matchers')
const createModel = require('./model')

module.exports = function (api) {
  let matchers = loadMatchers()
  let model = createModel()

  function lookup (id) {
    let matcher = matchers[id]
    return {
      regex: matcher.regex,
      description: matcher.description,
      handler: matcher.handler(model)
    }
  }

  api.matchers = api.matchers || []
  Object.keys(matchers).map(lookup).forEach((matcher) => api.matchers.push(matcher))

  return {
    reset: model.reset,
    model
  }
}
