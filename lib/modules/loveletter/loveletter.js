const loadMatchers = require('./matchers')
const createModel = require('./model')

module.exports = function (api, productionMode = true) {
  let saveData = productionMode
  let matchers = loadMatchers()
  return createModel()
    .then((model) => {
      if (!saveData) {
        model.save = () => {}
      }

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
