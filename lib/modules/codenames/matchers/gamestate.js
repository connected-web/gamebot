const grammarList = require('grammarlist')
const matchGameState = /^(game state|list words)$/i
const NL = '\n'

function gameState (api, data, model) {
  function listPlayersInTeam (team) {
    let teamName = team.name
    let icon = `:${teamName.toLowerCase()}:`
    let describeTeamPlayer = (player) => {
      return `${icon} ${api.getUserName(player)}`
    }
    return team.players.map(describeTeamPlayer)
  }

  if (!model.words || model.words.length === 0) {
    const playerNames = model.players.map(api.getUserName)
    return api.respond(model.gameChannel, [`No words have been assigned.`, `Current players:`, grammarList(playerNames)].join(' '))
  }

  const teamPlayers = [].concat.apply([], model.teams.map(listPlayersInTeam))

  let spyMasters = model.spyMasters()

  if (spyMasters.includes(data.user)) {
    let groupedWords = [].concat.apply([],
      ['assassin', 'team1', 'team2', 'neutral'].map((team) => {
        return model.words.filter((location) => location.team === team)
      })
    )

    let spyMasterGameStateInformation = [`Current list of locations:`]
      .concat(
        groupedWords.map((location, index) => {
          let icon = model.getTeamIcon(location.team)
          let word = location.revealed ? `~${location.word}~` : location.word
          return `>${icon} ${word}`
        }),
        `Teams assigned: `,
        grammarList(teamPlayers)
      )
      .join(NL)

    api.respond(data.user, spyMasterGameStateInformation)
  } else {
    let gameStateInformation = [`Current list of locations:`]
      .concat(
        model.words.map((location, index) => {
          let icon = location.revealed ? model.getTeamIcon(location.team) : ':unclaimed:'
          let word = location.revealed ? `~${location.word}~` : location.word
          return `>${icon} ${word}`
        }),
        `Teams assigned: `,
        grammarList(teamPlayers)
      )
      .join(NL)

    api.respond(data, gameStateInformation)
  }
}

module.exports = {
  name: 'Game State',
  regex: matchGameState,
  description: 'View the current state of the game including the list of words.',
  examples: ['game state', 'list words'],
  handler: (model) => {
    return (api, data) => gameState(api, data, model)
  }
}
