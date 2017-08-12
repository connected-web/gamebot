const grammarList = require('grammarlist')
const embolden = (name) => `*${name}*`

const nextTurn = require('../shared/nextTurn')

function endTurn (api, data, model) {
  const activeTeam = model.activeTeam()
  const activeSpymaster = model.activeSpymaster()
  const teamPlayers = activeTeam.players.filter((player) => player !== activeSpymaster)
  const playerNames = teamPlayers.map(api.getUserName)

  if (!teamPlayers.includes(data.user)) {
    api.respond(model.gameChannel, `*Warning*: Only players on the active team can end their team's turn (${grammarList(playerNames.map(embolden))})`)
  } else {
    nextTurn(api, data, model)
    model.save()
  }
}

module.exports = {
  name: 'End turn',
  regex: /^end turn/i,
  description: 'End the current turn without making any further guesses',
  examples: ['end turn'],
  handler: (model) => {
    return (api, data) => endTurn(api, data, model)
  }
}
