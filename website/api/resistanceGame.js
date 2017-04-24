var endpoint = function () {}
var gamebot

endpoint.route = '/api/resistance/game'
endpoint.cacheDuration = '5 seconds'
endpoint.description = 'Report on the current resistance game state'

endpoint.configure = function (config) {
  gamebot = config.gamebot
}

function copyObject (data) {
  return JSON.parse(JSON.stringify(data))
}

endpoint.render = function (req, res) {
  var gamestate = copyObject(gamebot.resistance.state)

  // Convert IDs to names
  gamestate.playerNames = gamestate.players.map(gamebot.getUserName)

  // send response
  res.jsonp(gamestate)
}

module.exports = endpoint
