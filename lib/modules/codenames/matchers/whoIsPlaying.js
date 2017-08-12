function whoIsPlaying (api, data, model) {
  const playerNames = model.players.map(api.getUserName)
  api.respond(model.gameChannel, [`Current players:`].concat(playerNames.join(', ')).join(' '))
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
