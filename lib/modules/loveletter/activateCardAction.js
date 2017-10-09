const cards = require('./cards')
const actions = {
  guard,
  priest,
  baron,
  handmaid,
  prince,
  king,
  countess,
  princess
}

function activateCardAction (api, model, targetPlayer, guessedCard) {
  let currentPlayer = model.currentPlayer()
  let playerHand = model.getPlayerHandFor(currentPlayerId)
  let playerCard = cards.findCard(targetHand.cards[0])
  let playedCard = playerHand.activeCard

  let targetHand = model.getPlayerHandFor(targetPlayer)
  let targetCard = cards.findCard(targetHand.cards[0])

  if (!playedCard) {
    console.error(`Tried to activate an invalid playedCard: ${playedCard}`, playerHand)
    return
  }

  const context = {
    api,
    model,
    currentPlayer,
    playerHand,
    playerCard,
    playedCard,
    targetPlayer,
    targetHand,
    targetCard,
    guessedCard
  }

  actions[playedCard](context)
  playerHand.discardedCards = playerHand.discardedCards || []
}

function guard ({ api, model, currentPlayer, targetPlayer, targetHand, guessedCard }) {
  if (targetHand.cards.includes(guessedCard.action)) {
    api.respond(model.gameChannel, `${api.mention(targetPlayer)} has been eliminated from the round. ${api.getUserName(currentPlayer)} correctly guessed a ${guessedCard.name} (${guessedCard.value}).`)
    api.respond(targetPlayer, `You have been eliminated from the round because ${api.getUserName(currentPlayerId)} correctly guessed that you had a ${guessedCard.name} (${guessedCard.value}).`)
    api.respond(currentPlayer, `You have successfully eliminated ${api.getUserName(targetPlayer)} by correctly guessing that they had a ${guessedCard.name} (${guessedCard.value}).`)
  } else {
    api.respond(model.gameChannel, `${api.mention(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)}, but they do not have a ${guessedCard.name} (${guessedCard.value}).`)
    api.respond(targetPlayer, `You were targetted by ${api.getUserName(currentPlayer)}, but they incorrectly guessed that you have a ${guessedCard.name} (${guessedCard.value}).`)
    api.respond(currentPlayer, `You targetted ${api.getUserName(targetPlayer)}, but you incorrectly guessed that they had a ${guessedCard.name} (${guessedCard.value}).`)
  }
}

function priest ({ api, model, currentPlayer, targetPlayer, playerHand, targetHand, playedCard, targetCard }) {
  api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)}; ${api.getUserName(targetPlayer)}'s role has been revealed to ${api.getUserName(currentPlayer)}.`)
  api.respond(targetPlayer, `Your card ${targetCard.name} (${targetCard.value}) has been revealed to ${api.getUserName(currentPlayer)}.`)
  api.respond(currentPlayer, `You have used your ${playedCard.name} (${playedCard.value}) to see that ${api.getUserName(targetPlayer)} has a ${targetCard.name} (${targetCard.value}).`)
}

function baron ({ api, model, targetPlayer, currentPlayer, playerCard, playedCard, targetCard }) {
  if (targetHand.value > playerCard.value) {
    api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)} with a ${playedCard.name}. ${api.getUserName(currentPlayer)} has been knocked out of the round, discarding a ${playerCard.name} (${playerCard.value}).`)
    // api.respond(targetPlayer, ``)
    // api.respond(currentPlayer, ``)
  }
  else if (targetHand.value < playerHand.value) {
    api.respond(model.gameChannel, ``)
    api.respond(targetPlayer, ``)
    api.respond(currentPlayer, ``)
  }
  else {
    api.respond(model.gameChannel, ``)
    api.respond(targetPlayer, ``)
    api.respond(currentPlayer, ``)
  }
}

function handmaid ({ api, model, targetPlayer, currentPlayer }) {
  api.respond(model.gameChannel, ``)
  api.respond(currentPlayer, ``)
}

function prince ({ api, model, targetPlayer, currentPlayer }) {
  if (targetPlayer === currentPlayer) {
    api.respond(model.gameChannel, ``)
    api.respond(currentPlayer, ``)
  }
  else {
    api.respond(model.gameChannel, ``)
    api.respond(targetPlayer, ``)
    api.respond(currentPlayer, ``)
  }

}

function king ({ api, model, targetPlayer, currentPlayer }) {
  if (targetPlayer === currentPlayer) {
    api.respond(model.gameChannel, ``)
    api.respond(currentPlayer, ``)
  }
  else {
    api.respond(model.gameChannel, ``)
    api.respond(targetPlayer, ``)
    api.respond(currentPlayer, ``)
  }
}

function countess ({ api, model, targetPlayer, currentPlayer }) {
  api.respond(model.gameChannel, ``)
  api.respond(currentPlayer, ``)
}

function princess ({ api, model, targetPlayer, currentPlayer }) {
  api.respond(model.gameChannel, ``)
  api.respond(currentPlayer, ``)
}

module.exports = activateCardAction
