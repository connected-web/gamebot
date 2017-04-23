function join(api, data, model) {
  if (model.players.includes(data.user)) {
    return api.respond(data.user, `You are already playing codenames.`);
  }

  model.players.push(data.user)

  const posterName = api.getUserName(data.user)
  const playerNames = model.players.map(api.getUserName)

  api.respond(data.user, `Hey ${posterName}, you've joined codenames. Your team will be assigned randomly after the game is started.`);
  api.respond(model.gameChannel, [`${posterName} has joined the game. Current players:`].concat(playerNames.join(', ')).join(' '));
}

module.exports = (model) => {
  return (api, data) => join(api, data, model)
}
