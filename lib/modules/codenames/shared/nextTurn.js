const NL = '\n'

function nextTurn (api, data, model) {
  model.turnCounter++
  let activeTeam = model.activeTeam()
  let activeSpymaster = model.activeSpymaster()
  let solitaireSpyMaster = model.teams[0].spymaster
  if (activeTeam.solitaire) {
    api.respond(model.gameChannel, [
      `It is now :${activeTeam.name.toLowerCase()}: ${activeTeam.name} Team's turn!`,
      `*${api.getUserName(solitaireSpyMaster)}* (${api.getUserById(solitaireSpyMaster).name}) you need to *cover* a :${activeTeam.name.toLowerCase()}: ${activeTeam.name} Team word using the *cover _word_* command.`
    ].join(NL))
  } else {
    api.respond(model.gameChannel, [
      `It is now :${activeTeam.name.toLowerCase()}: ${activeTeam.name} Team's turn!`,
      `*${api.getUserName(activeSpymaster)}* (@${api.getUserById(activeSpymaster).name}) it is your turn to give a *clue*.`
    ].join(NL))
  }
}

module.exports = nextTurn
