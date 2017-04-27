function reset (api, data, model) {
  let players = [].concat(model.players)
  model.reset()
  players.forEach((player) => model.players.push(player))

  let playerNames = model.players.map(api.getUserName)
  let posterName = api.getUserName(data.user)
  api.respond(model.gameChannel, [`${posterName} has reset the game. Current players:`].concat(playerNames.join(', ')).join(' '))
}

module.exports = {
  name: 'Reset game',
  regex: /reset (game|codenames)/i,
  description: 'Reset the current game; clears all state except the list of players',
  examples: ['reset game', 'reset codenames'],
  handler: (model) => {
    return (api, data) => reset(api, data, model)
  }
}
