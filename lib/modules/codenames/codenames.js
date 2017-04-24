const matchers = require('./matchers')

module.exports = function (api) {
  let model = require('./model')()

  function lookup (id) {
    let matcher = matchers[id]
    return {
      regex: matcher.regex,
      description: matcher.description,
      handler: require(`./${id}`)(model)
    }
  }

  api.matchers = api.matchers || []
  Object.keys(matchers).map(lookup).forEach((matcher) => api.matchers.push(matcher))

  return {
    reset: model.reset,
    model
  }
}
