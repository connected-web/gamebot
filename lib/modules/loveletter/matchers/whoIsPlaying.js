const grammarList = require('grammarlist')

function whoIsPlaying (api, data, model) {
  let players = model.players.map(player => api.getUserName(player))
  api.respond(model.gameChannel, 'The players currently in the castle are: ' + grammarList(players))
}

module.exports = {
  name: 'Who is Playing',
  regex: /^(who is playing|list players)/i,
  description: 'List the current game players',
  examples: ['who is playing', 'list players'],
  handler: (model) => {
    return (api, data) => whoIsPlaying(api, data, model)
  }
}
