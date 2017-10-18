const startRound = require('../startRound')

function startNextRound (api, data, model) {
  if (!model.roundOver) {
    api.respond(data, `Cannot start the next round while the current round is in play.`)
  }

  let players = [].concat(model.players)
  let winners = [].concat(model.winners)
  model.reset()
  model.save()
  players.forEach((player) => model.players.push(player))
  winners.forEach((winner) => model.winners.push(winner))

  const posterName = api.getUserName(data.user)
  api.respond(model.gameChannel, `${posterName} has started the next round.`)

  startRound(api, data, model)
}

module.exports = {
  name: 'Start Next Round',
  regex: /^start next round/i,
  description: 'Start the next round after a player has won a token of affection from the Princess.',
  examples: ['start next round'],
  handler: (model) => {
    return (api, data) => startNextRound(api, data, model)
  }
}
