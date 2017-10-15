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
  let targetHand = model.getPlayerHandFor(targetPlayer)
  let targetCard = targetHand || cards.findCard(targetHand.cards[0])
  let playerHand = model.getPlayerHandFor(currentPlayer)
  let playerCard = playerHand || cards.findCard(playerHand.cards[0])
  let playedCard = playerHand.activeCard

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

  // Action the card
  actions[playedCard](context)

  // Record the discarded card after the actions have taken place
  playerHand.discardedCard.push(playedCard.action)

  // TODO: Check for holding on to illegal countess
  model.save()

  // TODO: Advance play to the next player who still has cards, or end game
}

function guard ({ api, model, currentPlayer, targetPlayer, targetHand, guessedCard }) {
  if (targetHand.cards.includes(guessedCard.action)) {
    api.respond(model.gameChannel, `${api.mention(targetPlayer)} has been eliminated from the round. ${api.getUserName(currentPlayer)} correctly guessed a ${guessedCard.name} (${guessedCard.value}).`)
    api.respond(targetPlayer, `You have been eliminated from the round because ${api.getUserName(currentPlayer)} correctly guessed that you had a ${guessedCard.name} (${guessedCard.value}).`)
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

function baron ({ api, model, targetPlayer, targetHand, currentPlayer, playerCard, playedCard, targetCard }) {
  if (targetCard.value > playerCard.value) {
    api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)} with a ${playedCard.name} (${playedCard.value}). ${api.getUserName(currentPlayer)} have been eliminated from the round, discarding a ${playerCard.name} (${playerCard.value}).`)
    api.respond(targetPlayer, `${api.getUserName(currentPlayer)} has targetted you with a ${playedCard.name}. Your ${targetCard.name} (${targetCard.value}) was of higher value then ${api.getUserName(currentPlayer)}'s ${playedCard.name} (${playedCard.value}). ${api.getUserName(currentPlayer)} has been eliminated from the round.`)
    api.respond(currentPlayer, `${api.getUserName(targetPlayer)} has a higher value card then you, a ${targetCard.name} (${targetCard.value}), and you have been eliminated from the round.`)
  } else if (targetHand.value < playerCard.value) {
    api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)} with a ${playedCard.name} (${playedCard.value}). ${api.getUserName(targetPlayer)} has been eliminated from the round, discarding a ${targetCard.name} (${targetCard.value}).`)
    api.respond(targetPlayer, `${api.getUserName(currentPlayer)} has targetted you with a ${playedCard.name}. Your ${targetCard.name} (${targetCard.value}) was of lower value then ${api.getUserName(currentPlayer)}'s ${playerCard.name} (${playerCard.value}). You have been eliminated from the round.`)
    api.respond(currentPlayer, `${api.getUserName(targetPlayer)} has a higher value card then you, a ${targetCard.name} (${targetCard.value}), and you have been eliminated from the round.`)
  } else {
    api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)} with a ${playedCard.name} (${playedCard.value}). Neither player has been eliminated from the round.`)
    api.respond(targetPlayer, `${api.getUserName(currentPlayer)} has targetted you with a ${playedCard.name}. Your ${targetCard.name} (${targetCard.value}) has the same value as ${api.getUserName(currentPlayer)}'s ${playerCard.name} (${playerCard.value}). Neither of you have been eliminated from the round.`)
    api.respond(currentPlayer, `${api.getUserName(targetPlayer)} has the same value card as you, a ${targetCard.name} (${targetCard.value}). Neither player has been eliminated from the round.`)
  }
}

function handmaid ({ api, model, targetPlayer, targetCard, currentPlayer, playedCard }) {
  api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} has played a ${playedCard.name} (${playedCard.value}) and is now protected until the start of their next turn.`)
  api.respond(currentPlayer, `You have played a ${playedCard.name} (${playedCard.value}) and are now protected until the start of your next turn.`)
}

function prince ({ api, model, targetPlayer, targetHand, targetCard, currentPlayer, playedCard }) {
  if (targetCard.loseIfDiscarded) {
    api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} was forced to discard a ${targetCard.name} (${targetCard.value}) by ${api.getUserName(currentPlayer)} who played a ${playedCard.name} (${playedCard.value}). ${api.getUserName(targetPlayer)} has been eliminated from the round.`)
    api.respond(targetPlayer, `You have been eliminated from the round by ${api.getUserName(currentPlayer)} because they targetted you with a ${playedCard.name} (${playedCard.value}).`)
    eliminate({ api, model, targetHand })
    return
  }

  const newCard = cards.index[model.deck.pop() || model.cardOutOfTheGame]
  if (targetPlayer === currentPlayer) {
    api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} has played a ${playedCard.name} (${playedCard.value}) and targetted themselves. They have discarded a ${targetCard.name} (${targetCard.value}) and have drawn a new card.`)
    api.respond(currentPlayer, `You have targetted yourself with a ${playedCard.name} (${playedCard.value}), and have discarded your ${targetCard.name} (${targetCard.value}), and have now drawn a ${newCard.name} (${newCard.value}).`)
    targetHand.cards.push(newCard.action)
  } else {
    api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} has played a ${playedCard.name} (${playedCard.value}) and targetted ${api.getUserName(targetPlayer)}. ${api.getUserName(targetPlayer)} has discarded a ${targetCard.name} (${targetCard.value}) and has drawn a new card.`)
    api.respond(targetPlayer, `You have been targetted by ${api.getUserName(currentPlayer)} with a ${playedCard.name} (${playedCard.value}), and have discarded your ${targetCard.name} (${targetCard.value}), and have now drawn a ${newCard.name} (${newCard.value}).`)
    api.respond(currentPlayer, `You have targetted ${api.getUserName(targetPlayer)} by playing a ${playedCard.name} (${playedCard.value}). ${api.getUserName(targetPlayer)} has discarded a ${targetCard.name} (${targetCard.value}) and has drawn a new card.`)
  }
  targetHand.discardedCards.push(targetCard.action)
}

function king ({ api, model, targetPlayer, targetHand, targetCard, currentPlayer, playerHand, playedCard, playerCard }) {
  if (targetPlayer === currentPlayer) {
    api.respond(model.gameChannel, `${api.getUserName(currentPlayer.name)} has played a ${playedCard.name} (${playedCard.value}) to no effect.`)
    api.respond(currentPlayer, `You have played a ${playedCard.name} (${playedCard.value}) to no effect.`)
  } else {
    targetHand.cards = [playerCard.action]
    playerHand.cards = [targetCard.action]
    api.respond(model.gameChannel, `${api.getUserName(currentPlayer.name)} has targetted ${api.getUserName(targetPlayer)} with a ${playedCard.name} (${playedCard.value}) and exchanged hands with ${api.getUserName(targetPlayer)}.`)
    api.respond(targetPlayer, `${api.getUserName(currentPlayer.name)} has targetted you with a ${playedCard.name} (${playedCard.value}) and forced you to exchange cards with them. Your ${targetCard.name} (${targetCard.value}) has been exchanged for a ${playerCard.name} (${playerCard.value}).`)
    api.respond(currentPlayer, `You have targetted ${api.getUserName(targetPlayer)} by playing a ${playedCard.name} (${playedCard.value}) and forced them to exchange cards with you. Your ${playerCard.name} (${playerCard.value}) has been exchanged for ${targetCard.name} (${targetCard.value}).`)
  }
}

function countess ({ api, model, targetPlayer, currentPlayer, playedCard }) {
  api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} has played a ${playedCard.name} (${playedCard.value}).`)
  api.respond(currentPlayer, `You have played a ${playedCard.name} (${playedCard.value}).`)
}

function princess ({ api, model, targetPlayer, currentPlayer, playedCard, playerHand }) {
  api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} has played the ${playedCard.name} (${playedCard.value}), and has been eliminated from the round.`)
  api.respond(currentPlayer, `You have played the ${playedCard.name} (${playedCard.value}), and have been eliminated from the round.`)
  eliminate({ api, model, playerHand })
}

function eliminate ({ api, model, playerHand }) {
  const discardedCard = cards.index[playerHand.cards.pop()]
  if (discardedCard) {
    api.respond(model.gameChannel, `${api.getUserName(playerHand.player)} has been forced to discard a ${discardedCard.name} (${discardedCard.value})`)
    playerHand.discardedCard.push(discardedCard.action)
  }
}

module.exports = activateCardAction
