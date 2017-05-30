// Randomise starting accusation
var matcher = /(hey|welcome|greetings) ([A-z]+( [A-z]+)?)/i

// Process the accusation
function welcome (api, data) {
  const highlightName = data.text.match(matcher)[2]

  const gamebot = api.findUserByName(api.options.slackbot.name)
  const sender = api.getUserById(data.user)

  // ignore messages if they came from gamebot
  if (sender && gamebot && sender.id === gamebot.id) {
    api.respond(data, `Hey ${api.getUserName(sender.id)}, how are you doing today?`)
  } else {
    api.respond(data, `Hey ${highlightName}, how are you doing today?`)
  }
}

module.exports = function (api) {
  api.matchers = api.matchers || []
  api.matchers.push({
    'regex': matcher,
    'handler': welcome,
    'description': 'Welcomed a player'
  })
}
