const cards = require('../cards')

function playCard (api, data, model) {
  const cardName = data.text.match(module.exports.regex)[1].trim().toLowerCase()
  const cardDetails = cards.index[cardName]

  if (!model.players.includes(data.user)) {
    api.respond(data.user, `Unable to play card, you are not part of this game.`)
    return
  }

  if (!cardDetails) {
    api.respond(data.user, `Unable to play card, _${cardName}_ is not a valid card.`)
    return
  }

  const playerId = data.user
  const playerCard = model.getPlayerCardFor(playerId)
  if (!playerCard.cards.includes(cardName)) {
    api.respond(data.user, `Unable to play card, you do not have a _${cardName}_ card in your hand.`)
    return
  }

  if (playerCard.activeCard) {
    api.respond(data.user, `Unable to play card, you have already played _${playerCard.activeCard}_ this turn. Please a target a player using *target playerName*.`)
    return
  }

  const playedCardIndex = playerCards.cards.indexOf(cardName)
  const playedCard = playerCards.cards.splice(playedCardIndex, 1)[0]

  playerCard.activeCard = playedCard
  model.save()

  api.respond(model.gameChannel, `You have played ${cardDetails.name} (${cardDetails.value}). ${cardDetails.description}`)
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
