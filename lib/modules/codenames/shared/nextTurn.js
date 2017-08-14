const NL = '\n'

function nextTurn (api, data, model) {
  model.turnCounter++
  let activeTeam = model.activeTeam()
  let teamName = activeTeam.name
  let activeSpymaster = model.activeSpymaster()
  let solitaireSpyMaster = model.teams[0].spymaster
  let remainingWords = model.findRemainingWords(activeTeam.name).length

  if (remainingWords === 0) {
    api.respond(model.gameChannel, `${teamName.toLowerCase()}: ${teamName} Team have have won the game!`)
    model.gameOver = true
    model.winner = activeTeam
    model.save()
    return
  }

  if (activeTeam.solitaire) {
    api.respond(model.gameChannel, [
      `It is now :${teamName.toLowerCase()}: ${teamName} Team's turn!`,
      `*${api.getUserName(solitaireSpyMaster)}* (@${api.getUserById(solitaireSpyMaster).name}) you need to *cover* a :${teamName.toLowerCase()}: ${teamName} Team word using the *cover _word_* command.`
    ].join(NL))
  } else {
    api.respond(model.gameChannel, [
      `It is now :${teamName.toLowerCase()}: ${teamName} Team's turn!`,
      `*${api.getUserName(activeSpymaster)}* (@${api.getUserById(activeSpymaster).name}) it is your turn to give a *clue*.`
    ].join(NL))
  }
}

module.exports = nextTurn