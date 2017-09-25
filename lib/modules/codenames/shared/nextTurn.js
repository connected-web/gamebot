const NL = '\n'

function nextTurn (api, data, model) {
  model.turnCounter++
  let activeTeam = model.activeTeam()
  let teamName = activeTeam.name
  let teamIcon = `:${teamName.toLowerCase()}:`
  let activeSpymaster = model.activeSpymaster()
  let solitaireSpyMaster = model.teams[0].spymaster
  let remainingWords = model.findRemainingWords(activeTeam.name).length

  if (remainingWords === 0) {
    api.respond(model.gameChannel, `:${teamName.toLowerCase()}: ${teamName} Team have have won the game!`)
    model.gameOver = true
    model.winner = activeTeam
    model.save()
    return
  }

  if (activeTeam.solitaire) {
    api.respond(model.gameChannel, [
      `It is now ${teamIcon} ${teamName} Team's turn!`,
      `${api.mention(solitaireSpyMaster)} you need to *cover* a :${teamName.toLowerCase()}: ${teamName} Team word using the *cover _word_* command.`
    ].join(NL))
  } else {
    api.respond(model.gameChannel, [
      `It is now ${teamIcon} ${teamName} Team's turn!`,
      `${api.mention(activeSpymaster)} it is your turn to give a *clue*.`
    ].join(NL))
  }
}

module.exports = nextTurn
