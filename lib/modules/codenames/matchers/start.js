const startGame = require('../shared/startGame')

module.exports = {
  name: 'Start game',
  regex: /^start (game|codenames)/i,
  description: 'Start the current game; requires at least two players',
  examples: ['start game', 'start codenames'],
  handler: (model) => {
    return (api, data) => startGame(api, data, model)
  }
}
