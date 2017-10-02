const NL = '\n'

function start (api, data, model) {
  const posterName = api.getUserName(data.user)

  if (model.players.includes(data.user) === false) {
    return api.respond(data.user, `${posterName} - please join the game in order to begin playing. Say 'start game' when ready.`)
  }

  if (model.players.length < 2) {
    return api.respond(data.user, `Unable to start the game, there needs to be at least two players.`)
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
  model.started = true
  model.save()

  api.respond(
    model.gameChannel, [`Love Letter has begun, the player order is:`]
    .concat(model.players.map(api.getUserName).map(name => `>${name}`))
    .concat(`${api.getUserName(model.currentPlayer())} has the first turn.`)
    .join(NL)
  )

  model.playerCards.forEach((playerCard) => {
    let cardName = playerCard.cards[0]
    api.respond(playerCard.player, `Your starting card is ${cardName}.`)
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
