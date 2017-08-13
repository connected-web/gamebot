const matchGameState = /^(game state|list words)$/i
const NL = '\n'

function gameState (api, data, model) {
  if (!model.words || model.words.length === 0) {
    return api.respond(model.gameChannel, `No words have been assigned`)
  }

  let spyMasters = model.spyMasters()

  if (spyMasters.includes(data.user)) {
    let spyMasterGameStateInformation = [`Current list of locations:`]
      .concat(
        model.words.map((location, index) => {
          let icon = `:${location.team}:`
          let word = location.revealed ? `~${location.word}~` : location.word
          return `>${icon} ${word}`
        })
      )
      .join(NL)

    api.respond(data.user, spyMasterGameStateInformation)
  } else {
    let gameStateInformation = [`Current list of locations:`]
      .concat(
        model.words.map((location, index) => {
          let icon = location.revealed ? `:${location.team}:` : ':unclaimed:'
          let word = location.revealed ? `~${location.word}~` : location.word
          return `>${icon} ${word}`
        })
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
