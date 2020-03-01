const NL = '\n'
const cards = require('./cards')

function startRound (api, data, model) {
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
  model.playerHands.forEach((playerHand) => {
    let card = model.deck.pop()
    playerHand.cards = [card]
  })
  model.playerHands[0].cards.push(model.deck.pop())
  model.started = true
  model.currentPlayer = model.nextPlayer()
  model.save()

  api.respond(
    model.gameChannel, [`Love Letter has begun, the player order is:`]
      .concat(model.playerHands.map(pc => pc.player).map(api.getUserName).map(name => `>${name}`))
      .concat(`${api.mention(model.currentPlayer)} has the first turn.`)
      .join(NL)
  )

  model.playerHands.forEach((playerHand) => {
    let cardId = playerHand.cards[0]
    let startingCard = cards.index[cardId]
    let playerName = api.getUserName(playerHand.player)
    let firstPlayer = model.currentPlayer
    if (playerHand.player === firstPlayer) {
      let secondCardId = playerHand.cards[1]
      let secondCard = cards.index[secondCardId]
      api.respond(playerHand.player, [
        `Hey *${playerName}*! Your starting cards are ${cards.displayCard(startingCard)},`,
        ` and ${cards.displayCard(secondCard)}.`,
        ` Please take your turn by responding with *play ${startingCard.name}* or *play ${secondCard.name}*.`,
        ` There ${model.deck.length === 1 ? 'is' : 'are'} ${model.deck.length} ${model.deck.length === 1 ? 'card' : 'cards'} remaining in the deck.`
      ].join(''))
    } else {
      api.respond(playerHand.player, `Hey *${playerName}*! Your starting card is ${cards.displayCard(startingCard)}. *${api.getUserName(firstPlayer)}* is the first player.`)
    }
  })
}

module.exports = startRound
