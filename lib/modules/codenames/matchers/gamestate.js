const grammarList = require('grammarlist')
const matchGameState = /^(game state|list words)$/i
const NL = '\n'

function gameState (api, data, model) {
  function listPlayersInTeam (team) {
    return team.players.length ? team.players.map(api.getUserName) : ['Double Agents']
  }

  function findWordsForTeam (team) {
    return { team, words: model.words.filter(w => w.team === team.teamId) }
  }

  if (!model.words || model.words.length === 0) {
    const playerNames = model.players.map(api.getUserName)
    return api.respond(model.gameChannel, [`No words have been assigned.`, `Current players:`, grammarList(playerNames)].join(' '))
  }

  let spyMasters = model.spyMasters()

  let teamWordCounts = model.teams
    .map(findWordsForTeam)
    .sort((a, b) => a.words.length < b.words.length ? 1 : -1)
    .map(n => `:${n.team.name.toLowerCase()}: ${n.team.name} Team (${grammarList(listPlayersInTeam(n.team))}) have found ${n.words.filter(w => w.revealed).length} / ${n.words.length} words`)

  if(model.gameOver) {
    let gameOverInformation = [`Game end locations:`]
      .concat(
        model.words.map((location, index) => {
          let icon = model.getTeamIcon(location.team)
          let word = location.revealed ? `~${location.word}~` : location.word
          return `>${icon} ${word}`
        }),
        ...teamWordCounts
      )
      .join(NL)

    api.respond(data, gameOverInformation)
  }
  else if (spyMasters.includes(data.user)) {
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
        ...teamWordCounts
      )
      .join(NL)

    api.respond(data.user, spyMasterGameStateInformation)
  }
  else {
    let gameStateInformation = [`Game end locations:`]
      .concat(
        model.words.map((location, index) => {
          let icon = location.revealed ? model.getTeamIcon(location.team) : ':unclaimed:'
          let word = location.revealed ? `~${location.word}~` : location.word
          return `>${icon} ${word}`
        }),
        ...teamWordCounts
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
