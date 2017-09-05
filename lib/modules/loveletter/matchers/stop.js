function stop (api, data, model) {
  model.reset()
  model.save()

  let posterName = api.getUserName(data.user)
  api.respond(model.gameChannel, `${posterName} has stopped the game. All players have left the castle.`)
}

module.exports = {
  name: 'Stop game',
  regex: /^stop (game|codenames)/i,
  description: 'Stop the current game; clears all state including the list of players',
  examples: ['stop game', 'stop codenames'],
  handler: (model) => {
    return (api, data) => stop(api, data, model)
  }
}
