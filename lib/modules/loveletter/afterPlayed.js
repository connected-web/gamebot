const nextTurn = require('./nextTurn')
const cards = require('./cards')

function afterPlayed ({ api, model, playerHand }) {
  const playedCard = cards.findCard(playerHand.activeCard)

  // Record the discarded card after the actions have taken place
  playerHand.discardedCards.push(playedCard.action)
  playerHand.activeCard = false

  // TODO: Check for holding on to illegal countess

  // Advance play to the next player who still has cards, or end game
  nextTurn({ api, model })

  model.save()
}

module.exports = afterPlayed
