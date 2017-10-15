const activateCardAction = require('../activateCardAction')
const cards = require('../cards')

function target (api, data, model) {
  let searchTarget = data.text.match(module.exports.regex)[1].trim().toLowerCase()
  let searchGuess = (data.text.match(module.exports.regex)[2] || '').trim().toLowerCase()
  let targetPlayer = api.findUserByName(searchTarget) || {}

  const currentPlayerId = model.currentPlayer()
  const currentPlayerName = api.getUserName(currentPlayerId)

  if (!targetPlayer && searchGuess === 'me') {
    targetPlayer = currentPlayerId
  }

  if (data.user !== currentPlayerId) {
    api.respond(data.user, `Unable to play card, you are not the current player. Waiting for ${currentPlayerName} to take their turn.`)
    return
  }

  if (!targetPlayer.id) {
    api.respond(data, `I cannot find a user with the name _${searchTarget}_.`)
    return
  }

  // Check that target is in list of valid targets
  const validTarget = model.getValidTargets().filter((target) => target.player === targetPlayer.id)[0]

  if (!validTarget) {
    api.respond(data, `_${searchTarget}_ is not a valid target. Please choose a valid player to target by responding with *target _Name_*.`)
    return
  }

  const guessedCard = cards.findCard(searchGuess)

  if (searchGuess && !guessedCard) {
    api.respond(data, `_${searchGuess}_ is not a valid guess for a card; try guessing using a number or card name.`)
    return
  }

  activateCardAction(api, model, targetPlayer.id, guessedCard)
}

module.exports = {
  name: 'Target Player',
  regex: /^target,?\s([A-z\s]+),?\s?([A-z\s\d]+)?/i,
  description: 'Allows current player to target other players',
  examples: ['target John', 'target Henrietta'],
  handler: (model) => {
    return (api, data) => target(api, data, model)
  }
}
