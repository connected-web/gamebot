function activateCardAction (api, model, targetPlayer, guessedCard) {
  let currentPlayerId = model.currentPlayer()
  let playerHand = model.getPlayerHandFor(currentPlayerId)

  if(guessedCard) {
    api.respond(model.gameChannel, `${api.mention(targetPlayer)} has been targetted by ${api.getUserName(currentPlayerId)}, do they have a ${guessedCard.name} (${guessedCard.value})?`)
  } else {
    api.respond(model.gameChannel, `${api.mention(targetPlayer)} has been targetted by ${api.getUserName(currentPlayerId)}.`)
  }
}

module.exports = activateCardAction
