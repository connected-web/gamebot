const loadMatchers = require('./matchers')
const modelFactory = require('./model')

module.exports = function (api) {
  let matchers = loadMatchers()
  return modelFactory(api)
    .then((model) => {
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
    })
}
