function target (api, data, model) {
  let searchTarget = data.text.match(module.exports.regex)[1].trim().toLowerCase()
  let targetPlayer = api.findUserByName(searchTarget) || {}

  const currentPlayerId = model.currentPlayer()
  const currentPlayerName = api.getUserName(currentPlayerId)

  if (data.user !== currentPlayerId) {
    api.respond(data.user, `Unable to play card, you are not the current player. Waiting for ${currentPlayerName} to take their turn.`)
    return
  }

  if (!targetPlayer.id) {
    api.respond(data, `I cannot find a user with the name _${searchTarget}_.`)
    return
  }

  const validTarget = model.getValidTargets().filter((target) => target.player === targetPlayer.id)[0]

  if (!validTarget) {
    api.respond(data, `_${searchTarget}_ is not a valid target. Please choose a valid player to target by responding with *target _Name_*.`)
    return
  }

  api.respond(model.gameChannel, `You have tried to target ${api.getUserName(targetPlayer.id)}`)
}

module.exports = {
  name: 'Target Player',
  regex: /^target,?\s([A-z\s]+)/i,
  description: 'Allows current player to target other players',
  examples: ['target'],
  handler: (model) => {
    return (api, data) => target(api, data, model)
  }
}
