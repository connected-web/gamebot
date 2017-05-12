const grammarList = require('grammarlist')
const embolden = (name) => `*${name}*`

function pick (api, data, model) {
  const word = data.text.match(module.exports.regex)[1]

  const activeTeam = model.activeTeam()
  const activeSpymaster = model.activeSpymaster()
  const teamPlayers = activeTeam.players.filter((player) => player !== activeSpymaster)
  const playerNames = teamPlayers.map(api.getUserName)

  if (data.user === activeSpymaster) {
    api.respond(model.gameChannel, `*Warning*: Picks can not be made by spy masters`)
  } else if (teamPlayers.includes(data.user)) {
    if (model.words.map((item) => item.word).includes(word)) {
      api.respond(model.gameChannel, `${word} can be made as a pick.`)
    } else {
      api.respond(model.gameChannel, `*Warning*: ${word} is not a valid pick. Use *list words* to relist the available options`)
    }
  } else {
    api.respond(model.gameChannel, `*Warning*: Picks can only be made by players on the active team (${grammarList(playerNames.map(embolden))})`)
  }
}

module.exports = {
  name: 'Pick word',
  regex: /pick ([A-z]+)/i,
  description: 'Pick a word as a guess for your team',
  examples: ['pick elephant'],
  handler: (model) => {
    return (api, data) => pick(api, data, model)
  }
}
