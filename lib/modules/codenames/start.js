const NL = '\n'

function start(api, data, model) {
  const posterName = api.getUserName(data.user)
  const playerNames = model.players.map(api.getUserName)

  if (model.players.includes(data.user) === false) {
    return api.respond(data.user, `${posterName} - please join the game in order to begin playing. Say 'start game' when ready.`);
  }

  if (model.players.length < 2) {
    return api.respond(data.user, `Unable to start the game, there needs to be at least two players.`)
  }

  api.respond(model.gameChannel, [`Codenames has begun, teams are:`].join(NL));
}

module.exports = (model) => {
  return (api, data) => start(api, data, model)
}
