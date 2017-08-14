function leave (api, data, model) {
  const posterName = api.getUserName(data.user)

  if (!model.players.includes(data.user)) {
    api.respond(data.user, `Hey ${posterName}, you weren't playing codenames.`)
    return
  }
  model.players = model.players.filter((user) => user !== data.user)
  model.save()

  const playerNames = model.players.map(api.getUserName)

  api.respond(data.user, `Hey ${posterName}, you have left the current game of codenames.`)
  api.respond(model.gameChannel, [`${posterName} has left the game. Current players:`].concat(playerNames.join(', ')).join(' '))
}

module.exports = {
  name: 'Leave game',
  regex: /^leave (game|codenames|spies)/i,
  description: 'Leave the current game',
  examples: ['leave game', 'leave codenames', 'leave spies'],
  handler: (model) => {
    return (api, data) => leave(api, data, model)
  }
}
