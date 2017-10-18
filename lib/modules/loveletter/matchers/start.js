const startRound = require('../startRound')

module.exports = {
  name: 'Start game',
  regex: /^start (game|codenames)/i,
  description: 'Start the current game; requires at least two players',
  examples: ['start game', 'start loveletter'],
  handler: (model) => {
    return (api, data) => startRound(api, data, model)
  }
}
