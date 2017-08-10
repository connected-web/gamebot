const matchGameState = /^(game state|list words)$/i
const NL = '\n'

function gameState (api, data, model) {
  if (!model.words || model.words.length === 0) {
    return api.respond(model.gameChannel, `No words have been assigned`)
  }

  let gameStateInformation = [`Current list of locations:`]
    .concat(
      model.words.map((item, index) => {
        let icon = ':unclaimed:'
        return `>${icon} ${item.word}`
      })
    )
    .join(NL)

  api.respond(model.gameChannel, gameStateInformation)
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
