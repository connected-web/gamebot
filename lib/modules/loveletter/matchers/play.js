const grammarList = require('grammarlist')
const cards = require('../cards')
const activateCardAction = require('../activateCardAction')

function playCard (api, data, model) {
  if (!model.players.includes(data.user)) {
    api.respond(data.user, `Unable to play card, you are not part of this game.`)
    return
  }

  if (model.roundOver) {
    const winner = model.winners[model.winners.length - 1]
    api.respond(data.user, `Unable to play card, the round is over. *${api.getUserName(winner)}* has won.`)
    return
  }

  const currentPlayerId = model.currentPlayer()
  const currentPlayerName = api.getUserName(currentPlayerId)
  if (data.user !== currentPlayerId) {
    api.respond(data.user, `Unable to play card, you are not the current player. Waiting for ${currentPlayerName} to take their turn.`)
    return
  }

  const cardName = data.text.match(module.exports.regex)[1].trim().toLowerCase()
  const cardDetails = cards.index[cardName]
  if (!cardDetails) {
    api.respond(data.user, `Unable to play card, _${cardName}_ is not a valid card.`)
    return
  }

  const playerId = data.user
  const playerHand = model.getPlayerHandFor(playerId)
  if (!playerHand.cards.includes(cardName)) {
    api.respond(data.user, `Unable to play card, you do not have a _${cardName}_ card in your hand.`)
    return
  }

  if (playerHand.activeCard) {
    api.respond(data.user, `Unable to play card, you have already played _${playerHand.activeCard}_ this turn. Please a target a player using *target playerName*.`)
    return
  }

  const playedCardIndex = playerHand.cards.indexOf(cardName)
  const playedCard = playerHand.cards.splice(playedCardIndex, 1)[0]

  playerHand.activeCard = playedCard
  model.save()

  api.respond(model.gameChannel, `${api.getUserName(playerId)} has played a ${cards.displayCard(cardDetails)}.`)

  const validTargets = model.getValidTargets()

  if (cardDetails.requiresTarget && cardDetails.requiresGuess) {
    const targetListGuesses = validTargets.map(target => `*target ${api.getUserName(target.player)}, guess*`)
    api.respond(data.user, `Please choose a player to target by responding with ${grammarList(targetListGuesses, 'or')}.`)
  } else if (cardDetails.requiresTarget) {
    const targetList = validTargets.map(target => `*target ${api.getUserName(target.player)}*`)
    api.respond(data.user, `Please choose a player to target by responding with ${grammarList(targetList, 'or')}.`)
  } else {
    activateCardAction(api, model)
  }
}

module.exports = {
  name: 'Play card',
  regex: /^play,?\s([A-z\s]+)/i,
  description: 'Allows the current player to play a card on their turn',
  examples: ['play guard', 'play king'],
  handler: (model) => {
    return (api, data) => playCard(api, data, model)
  }
}
