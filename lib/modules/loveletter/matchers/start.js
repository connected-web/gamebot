const NL = '\n'
const cards = require('../cards')

function start (api, data, model) {
  const posterName = api.getUserName(data.user)

  if (model.players.includes(data.user) === false) {
    return api.respond(data.user, `${posterName} - please join the game in order to begin playing. Say 'start game' when ready.`)
  }

  if (model.players.length < 2) {
    return api.respond(data.user, `Unable to start the game, there needs to be at least two players.`)
  }

  if (model.players.length > 4) {
    return api.respond(data.user, `Unable to start the game, there are too many players! This game only plays up to four players.`)
  }

  if (model.started) {
    return api.respond(data.user, `Unable to start the game, a game is already in progress.`)
  }

  model.assignPlayerOrder()
  model.createDeck()
  model.cardOutOfTheGame = model.deck.pop()
  model.playerCards.forEach((playerCard) => {
    let card = model.deck.pop()
    playerCard.cards = [card]
  })
  model.playerCards[0].cards.push(model.deck.pop())
  model.started = true
  model.save()

  api.respond(
    model.gameChannel, [`Love Letter has begun, the player order is:`]
    .concat(model.players.map(api.getUserName).map(name => `>${name}`))
    .concat(`${api.getUserName(model.currentPlayer())} has the first turn.`)
    .join(NL)
  )

  model.playerCards.forEach((playerCard) => {
    let cardId = playerCard.cards[0]
    let card = cards.index[cardId]
    let playerName = api.getUserName(playerCard.player)
    if (playerCard.player === model.currentPlayer()) {
      let secondCardId = playerCard.cards[1]
      let secondCard = cards.index[secondCardId]
      api.respond(playerCard.player, `Hey ${playerName}! Your starting card is ${card.name} (${card.value}) and your second card is ${secondCard.name} (${secondCard.value}).`)
    } else {
      api.respond(playerCard.player, `Hey ${playerName}! Your starting card is ${card.name} (${card.value}).`)
    }
  })
}

module.exports = {
  name: 'Start game',
  regex: /^start (game|codenames)/i,
  description: 'Start the current game; requires at least two players',
  examples: ['start game', 'start loveletter'],
  handler: (model) => {
    return (api, data) => start(api, data, model)
  }
}
