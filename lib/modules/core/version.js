const botChannel = 'bot_status'

function respondWithVersion (api, data) {
  api.respond(botChannel, 'The version is XXX.')
}

module.exports = function (api) {
  api.matchers = api.matchers || []
  api.matchers.push({
    regex: /(display current version)/,
    handler: respondWithVersion,
    channels: [botChannel],
    description: 'Tells the user what the current version of gamebot is.'
  })
}
