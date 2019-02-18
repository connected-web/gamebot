const loadMatchers = require('./matchers')
const modelFactory = require('./model')

module.exports = async (api) => {
  let matchers = loadMatchers()
  const model = await modelFactory(api)

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

  api.bot.on('open', function (ev) {
    setTimeout(() => {
      api.respond(model.statusChannel, `Gamebot has just started / restarted! Ask me about **uptime** or **what version?**`)
    }, 2500)
  })

  return {
    reset: model.reset,
    model
  }
}
