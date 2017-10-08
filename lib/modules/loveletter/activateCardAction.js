function activateCardAction (api, model, playerHand, targetPlayer) {
  api.respond(model.gameChannel, `The active card that has been played is ${playerHand.activeCard}. Targetted player is: ${api.getUserName(targetPlayer)}.`)
}

module.exports = activateCardAction
