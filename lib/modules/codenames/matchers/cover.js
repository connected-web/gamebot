const nextTurn = require('../shared/nextTurn')

function cover (api, data, model) {
  const word = data.text.match(module.exports.regex)[1].toLowerCase().trim()

  const activeTeam = model.activeTeam()
  const solitaireSpyMaster = model.teams[0].spymaster
  const activeSpymaster = model.activeSpymaster()

  if (activeTeam.solitaire && activeSpymaster === solitaireSpyMaster) {
    api.respond(model.gameChannel, `*Warning*: Cover can only be used by spy masters in solitaire games`)
  } else if (isValidTeamLocation(model, word, 'team2')) {
    coverLocation(api, data, word, model)
  } else {
    api.respond(solitaireSpyMaster, `*Warning*: Cannot cover ${word}, it is not a valid Red Team location`)
  }
}

function isValidTeamLocation (model, word, teamId) {
  return (model.words.filter((item) => item.word.toLowerCase() === word.toLowerCase() && item.team === teamId).length > 0)
}

function coverLocation (api, data, word, model) {
  // collection information
  let location = model.words.filter((item) => item.word.toLowerCase() === word.toLowerCase())[0]
  let activeTeam = model.activeTeam()
  let teamName = activeTeam.name

  if (location.revealed) {
    api.respond(model.gameChannel, `*Warning*: ${word} has already been revealed. Pick a different word!`)
  } else {
    // reveal location
    location.revealed = true
    api.respond(model.gameChannel, `${word} has been covered as a ${model.getTeamIcon(location.team)} ${model.findTeam(location.team).name} location, the :${teamName.toLowerCase()}: ${teamName} Team have ended their turn!`)
    nextTurn(api, data, model)
  }
  model.save()
}

module.exports = {
  name: 'Cover word',
  regex: /^cover\s([A-z\s-]+)/i,
  description: 'Cover a word during a solitaire game',
  examples: ['cover hamster'],
  handler: (model) => {
    return (api, data) => cover(api, data, model)
  }
}
