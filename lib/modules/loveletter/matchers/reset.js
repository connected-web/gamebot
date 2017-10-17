function reset (api, data, model) {
  let players = [].concat(model.players)
  let winners = [].concat(model.winners)
  model.reset()
  model.save()
  players.forEach((player) => model.players.push(player))
  winners.forEach((winner) => model.winners.push(winner))

  let playerNames = model.players.map(api.getUserName)
  let posterName = api.getUserName(data.user)
  api.respond(model.gameChannel, [`${posterName} has reset the game, keeping scores and players. Current players:`].concat(playerNames.join(', ')).join(' '))
}

module.exports = {
  name: 'Reset game',
  regex: /^(reset|restart) (game|love\s?letter)/i,
  description: 'Reset the current game; clears all state except the list of players',
  examples: ['reset game', 'reset love letter', 'restart game'],
  handler: (model) => {
    return (api, data) => reset(api, data, model)
  }
}
