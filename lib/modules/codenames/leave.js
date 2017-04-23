function leave(api, data, model) {
  model.players = model.players.filter((user) => user != data.user)

  const posterName = api.getUserName(data.user)
  const playerNames = model.players.map(api.getUserName)

  api.respond(data.user, `Hey ${posterName}, you have left the current game of codenames.`);
  api.respond(model.gameChannel, [`${posterName} has left the game. Current players:`].concat(playerNames.join(', ')).join(' '));
}

module.exports = (model) => {
  return (api, data) => leave(api, data, model)
}
