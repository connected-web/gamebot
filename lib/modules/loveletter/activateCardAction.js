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
  let currentPlayerId = model.currentPlayer()
  let playerHand = model.getPlayerHandFor(currentPlayerId)
  let playedCard = playerHand.activeCard

  if (!playedCard) {
    console.error(`Tried to activate an invalid playedCard: ${playedCard}`, playerHand)
    return
  }

  actions[playedCard](api, model, targetPlayer, guessedCard)
}

function guard (api, model, targetPlayer, guessedCard) {
  let currentPlayerId = model.currentPlayer()
  let targetHand = model.getPlayerHandFor(targetPlayer)

  if (targetHand.cards.includes(guessedCard.action)) {
    api.respond(model.gameChannel, `${api.mention(targetPlayer)} has been eliminated from the round. ${api.getUserName(currentPlayerId)} correctly guessed a ${guessedCard.name} (${guessedCard.value}).`)
    api.respond(targetPlayer, `You have been eliminated from the round because ${api.getUserName(currentPlayerId)} correctly guessed that you had a ${guessedCard.name} (${guessedCard.value}).`)
    api.respond(currentPlayerId, `You have successfully eliminated ${api.getUserName(targetPlayer)} by correctly guessing that they had a ${guessedCard.name} (${guessedCard.value}).`)
  } else {
    api.respond(model.gameChannel, `${api.mention(targetPlayer)} has been targetted by ${api.getUserName(currentPlayerId)}, but they do not have a ${guessedCard.name} (${guessedCard.value}).`)
    api.respond(targetPlayer, `You were targetted by ${api.getUserName(currentPlayerId)}, but they incorrectly guessed that you have a ${guessedCard.name} (${guessedCard.value}).`)
    api.respond(currentPlayerId, `You targetted ${api.getUserName(targetPlayer)}, but you incorrectly guessed that they had a ${guessedCard.name} (${guessedCard.value}).`)
  }
}

function priest (api, model, targetPlayer, guessedCard) {
  let currentPlayerId = model.currentPlayer()
  let playerHand = model.getPlayerHandFor(currentPlayerId)
  let targetHand = model.getPlayerHandFor(targetPlayer)
  let playedCard = cards.findCard(playerHand.activeCard)
  let targetCard = cards.findCard(targetHand.cards[0])

  api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} has been targetted by ${api.getUserName(currentPlayerId)}; ${api.getUserName(targetPlayer)}'s role has been revealed to ${api.getUserName(currentPlayerId)}.`)
  api.respond(targetPlayer, `Your card ${targetCard.name} (${targetCard.value}) has been revealed to ${api.getUserName(currentPlayerId)}.`)
  api.respond(currentPlayerId, `You have used your ${playedCard.name} (${playedCard.value}) to see that ${api.getUserName(targetPlayer)} has a ${targetCard.name} (${targetCard.value}).`)
}

function baron (api, model, targetPlayer, guessedCard) {

}

function handmaid (api, model, targetPlayer, guessedCard) {

}

function prince (api, model, targetPlayer, guessedCard) {

}

function king (api, model, targetPlayer, guessedCard) {

}

function countess (api, model, targetPlayer, guessedCard) {

}

function princess (api, model, targetPlayer, guessedCard) {

}

module.exports = activateCardAction
