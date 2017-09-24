function join (api, data, model) {
  if (model.players.includes(data.user)) {
    return api.respond(data.user, `You are already playing love letter.`)
  }

  model.players.push(data.user)
  model.save()

  const posterName = api.getUserName(data.user)
  const playerNames = model.players.map(api.getUserName)

  api.respond(data.user, `Hey ${posterName}, you've joined love letter. You will dealt your starting card after the game is started.`)
  api.respond(model.gameChannel, [`${posterName} has joined the game. Current players:`].concat(playerNames.join(', ')).join(' '))
}

module.exports = {
  name: 'Join game',
  regex: /^join (game|love\s?letter|castle)/i,
  description: 'Join a game, teams will be assigned randomly after game start',
  examples: ['join game', 'join love letter', 'enter castle'],
  handler: (model) => {
    return (api, data) => join(api, data, model)
  }
}
