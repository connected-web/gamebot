const grammarList = require('grammarlist')
const matchGameState = /^(game state)$/i
const NL = '\n'

function gameState (api, data, model) {
  api.respond(data, `Still working this bit out...`)
}

module.exports = {
  name: 'Game State',
  regex: matchGameState,
  description: `View the current state of the game, including who's turn it is, who's playing, and which cards have been played.`,
  examples: ['game state'],
  handler: (model) => {
    return (api, data) => gameState(api, data, model)
  }
}
