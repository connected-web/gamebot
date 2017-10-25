const cards = require('./cards')
const afterPlayed = require('./afterPlayed')

const { displayCard } = cards
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
  let targetName = api.getUserName(targetPlayer)
  let targetCard = targetHand && cards.findCard(targetHand.cards[0])
  let playerHand = model.getPlayerHandFor(currentPlayer)
  let playerCard = playerHand && cards.findCard(playerHand.cards[0])
  let playedCard = playerHand && cards.findCard(playerHand.activeCard)

  if (!playedCard) {
    console.error(`Tried to activate an invalid playedCard: ${playedCard}`, playerHand)
    return
  }

  if (playedCard.requiresGuess && !guessedCard) {
    api.respond(currentPlayer, `Unable to target *${targetName}*, this card requires you to guess a valid card. Respond with *target ${targetName}, _cardname_* or *target ${targetName}, _number_* to complete this action.`)
    return
  }

  if (playedCard.requiresGuess && playedCard.mustGuessTwoOrHigher && guessedCard.value < 2) {
    api.respond(currentPlayer, `Unable to target *${targetName}*, this card requires you to guess a card with a value of 2 or higher. Respond with *target ${targetName}, _cardname_* or *target ${targetName}, _number_* to complete this action.`)
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
  const action = actions[playedCard.action]
  if (typeof action === 'function') {
    try {
      action(context)
      afterPlayed({ api, model, playerHand })
    } catch (ex) {
      console.error(ex)
      api.respond(model.gameChannel, 'The castle is burning, please send the following message to the Stone Masons: ```{{error}}```'.replace('{{error}}', `${ex} : ${ex.stack}`))
    }
  } else {
    api.respond(model.gameChannel, `${playedCard.action} has no action configured for this game.`)
  }
}

function guard ({ api, model, currentPlayer, targetPlayer, targetHand, guessedCard }) {
  if (targetHand.cards.includes(guessedCard.action)) {
    api.respond(model.gameChannel, `${api.mention(targetPlayer)} has been eliminated from the round. ${api.getUserName(currentPlayer)} correctly guessed a ${displayCard(guessedCard)}.`)
    api.respond(targetPlayer, `You have been eliminated from the round because ${api.getUserName(currentPlayer)} correctly guessed that you had a ${displayCard(guessedCard)}.`)
    api.respond(currentPlayer, `You have successfully eliminated ${api.getUserName(targetPlayer)} by correctly guessing that they had a ${displayCard(guessedCard)}.`)
    eliminate({ api, model, targetHand })
  } else {
    api.respond(model.gameChannel, `${api.mention(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)}, but they do not have a ${displayCard(guessedCard)}.`)
    api.respond(targetPlayer, `You were targetted by ${api.getUserName(currentPlayer)}, but they incorrectly guessed that you have a ${displayCard(guessedCard)}.`)
    api.respond(currentPlayer, `You targetted ${api.getUserName(targetPlayer)}, but you incorrectly guessed that they had a ${displayCard(guessedCard)}.`)
  }
}

function priest ({ api, model, currentPlayer, targetPlayer, playerHand, targetHand, playedCard, targetCard }) {
  api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)}; ${api.getUserName(targetPlayer)}'s role has been revealed to ${api.getUserName(currentPlayer)}.`)
  api.respond(targetPlayer, `Your card ${displayCard(targetCard)} has been revealed to ${api.getUserName(currentPlayer)}.`)
  api.respond(currentPlayer, `You have used your ${displayCard(playedCard)} to see that ${api.getUserName(targetPlayer)} has a ${displayCard(targetCard)}.`)
}

function baron ({ api, model, targetPlayer, targetHand, currentPlayer, playerHand, playerCard, playedCard, targetCard }) {
  if (targetCard.value > playerCard.value) {
    api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)} with a ${displayCard(playedCard)}. ${api.getUserName(currentPlayer)} have been eliminated from the round, discarding a ${displayCard(playerCard)}.`)
    api.respond(targetPlayer, `${api.getUserName(currentPlayer)} has targetted you with a ${playedCard.name}. Your ${displayCard(targetCard)} was of higher value than ${api.getUserName(currentPlayer)}'s ${displayCard(playerCard)}. ${api.getUserName(currentPlayer)} has been eliminated from the round.`)
    api.respond(currentPlayer, `${api.getUserName(targetPlayer)} has a higher value card than you, a ${displayCard(targetCard)}, and you have been eliminated from the round.`)
    eliminate({ api, model, playerHand })
  } else if (targetCard.value < playerCard.value) {
    api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)} with a ${displayCard(playedCard)}. ${api.getUserName(targetPlayer)} has been eliminated from the round, discarding a ${displayCard(targetCard)}.`)
    api.respond(targetPlayer, `${api.getUserName(currentPlayer)} has targetted you with a ${playedCard.name}. Your ${displayCard(targetCard)} was of lower value than ${api.getUserName(currentPlayer)}'s ${displayCard(playerCard)}. You have been eliminated from the round.`)
    api.respond(currentPlayer, `${api.getUserName(targetPlayer)} has a lower value card than you, a ${displayCard(targetCard)}, and they have been eliminated from the round.`)
    eliminate({ api, model, targetHand })
  } else {
    api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} has been targetted by ${api.getUserName(currentPlayer)} with a ${displayCard(playedCard)}. Neither player has been eliminated from the round.`)
    api.respond(targetPlayer, `${api.getUserName(currentPlayer)} has targetted you with a ${displayCard(playedCard)}. Your ${displayCard(targetCard)} has the same value as ${api.getUserName(currentPlayer)}'s ${displayCard(playerCard)}. Neither of you have been eliminated from the round.`)
    api.respond(currentPlayer, `${api.getUserName(targetPlayer)} has the same value card as you, a ${displayCard(targetCard)}. Neither player has been eliminated from the round.`)
  }
}

function handmaid ({ api, model, currentPlayer, playerHand, playedCard }) {
  playerHand.protected = true
  api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} is now protected until the start of their next turn.`)
  api.respond(currentPlayer, `You have played a ${displayCard(playedCard)} and are now protected until the start of your next turn.`)
}

function prince ({ api, model, targetPlayer, targetHand, targetCard, currentPlayer, playedCard }) {
  if (targetCard.loseIfDiscarded) {
    api.respond(model.gameChannel, `${api.getUserName(targetPlayer)} was forced to discard a ${displayCard(targetCard)} by ${api.getUserName(currentPlayer)} who played a ${displayCard(playedCard)}. ${api.getUserName(targetPlayer)} has been eliminated from the round.`)
    api.respond(targetPlayer, `You have been eliminated from the round by ${api.getUserName(currentPlayer)} because they targetted you with a ${displayCard(playedCard)}.`)
    eliminate({ api, model, targetHand })
    return
  }

  let newCard
  if (model.deck.length) {
    newCard = cards.index[model.deck.pop()]
  } else {
    newCard = cards.index[model.cardOutOfTheGame]
    model.cardOutOfTheGame = false
  }

  if (targetPlayer === currentPlayer) {
    api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} has played a ${displayCard(playedCard)} and targetted themselves. They have discarded a ${displayCard(targetCard)} and have drawn a new card.`)
    api.respond(currentPlayer, `You have targetted yourself with a ${displayCard(playedCard)}, and have discarded your ${displayCard(targetCard)}, and have now drawn a ${displayCard(newCard)}.`)
  } else {
    api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} has played a ${displayCard(playedCard)} and targetted ${api.getUserName(targetPlayer)}. ${api.getUserName(targetPlayer)} has discarded a ${displayCard(targetCard)} and has drawn a new card.`)
    api.respond(targetPlayer, `You have been targetted by ${api.getUserName(currentPlayer)} with a ${displayCard(playedCard)}, and have discarded your ${displayCard(targetCard)}, and have now drawn a ${displayCard(newCard)}.`)
    api.respond(currentPlayer, `You have targetted ${api.getUserName(targetPlayer)} by playing a ${displayCard(playedCard)}. ${api.getUserName(targetPlayer)} has discarded a ${displayCard(targetCard)} and has drawn a new card.`)
  }
  targetHand.discardedCards.push(targetHand.cards.pop())
  targetHand.cards.push(newCard.action)
}

function king ({ api, model, targetPlayer, targetHand, targetCard, currentPlayer, playerHand, playedCard, playerCard }) {
  if (targetPlayer === currentPlayer) {
    api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} has played a ${displayCard(playedCard)} to no effect.`)
    api.respond(currentPlayer, `You have played a ${displayCard(playedCard)} to no effect.`)
  } else {
    targetHand.cards = [playerCard.action]
    playerHand.cards = [targetCard.action]
    api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} has targetted ${api.getUserName(targetPlayer)} with a ${displayCard(playedCard)} and exchanged hands with ${api.getUserName(targetPlayer)}.`)
    api.respond(targetPlayer, `${api.getUserName(currentPlayer)} has targetted you with a ${displayCard(playedCard)} and forced you to exchange cards with them. Your ${displayCard(targetCard)} has been exchanged for a ${displayCard(playerCard)}.`)
    api.respond(currentPlayer, `You have targetted ${api.getUserName(targetPlayer)} by playing a ${displayCard(playedCard)} and forced them to exchange cards with you. Your ${displayCard(playerCard)} has been exchanged for ${displayCard(targetCard)}.`)
  }
}

function countess ({ api, model, targetPlayer, currentPlayer, playedCard }) {
  api.respond(currentPlayer, `You have played a ${displayCard(playedCard)}.`)
}

function princess ({ api, model, targetPlayer, currentPlayer, playedCard, playerHand }) {
  api.respond(model.gameChannel, `${api.getUserName(currentPlayer)} has played the ${displayCard(playedCard)}, and has been eliminated from the round.`)
  api.respond(currentPlayer, `You have played the ${displayCard(playedCard)}, and have been eliminated from the round.`)
  eliminate({ api, model, playerHand })
}

function eliminate ({ api, model, playerHand, targetHand }) {
  const hand = playerHand || targetHand
  const discardedCard = cards.index[hand.cards.pop()]
  if (discardedCard) {
    api.respond(model.gameChannel, `${api.getUserName(hand.player)} has been forced to discard a ${displayCard(discardedCard)}.`)
    hand.discardedCards.push(discardedCard.action)
  }
}

module.exports = activateCardAction
