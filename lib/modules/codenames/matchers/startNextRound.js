const startGame = require('../shared/startGame')

function startNextRound (api, data, model) {
  const posterName = api.getUserName(data.user)

  const players = [].concat(model.players)
  model.reset()
  model.players = players

  api.respond(model.gameChannel, `${posterName} has started a new game!`)
  startGame(api, data, model)
}

module.exports = {
  name: 'Start game',
  regex: /^start (next|new) (round|game)/i,
  description: 'Start a new game with the existing players put into new teams.',
  examples: ['start new game', 'start new round'],
  handler: (model) => {
    return (api, data) => startNextRound(api, data, model)
  }
}
