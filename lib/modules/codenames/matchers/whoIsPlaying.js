const grammarList = require('grammarlist')

function whoIsPlaying (api, data, model) {
  function listPlayersInTeam (team) {
    let teamName = team.name
    let icon = `:${teamName.toLowerCase()}:`
    let describeTeamPlayer = (player) => {
      return `${icon} ${teamName} ${api.getUserName(player)}`
    }
    return team.players.map(describeTeamPlayer)
  }

  if (model.teams[0].players.length > 0) {
    const teamPlayers = [].concat.apply([], model.teams.map(listPlayersInTeam))
    api.respond(model.gameChannel, [`Teams assigned:`].concat(grammarList(teamPlayers)).join(' '))
  } else {
    const playerNames = model.players.map(api.getUserName)
    api.respond(model.gameChannel, [`Teams not assigned, current players:`].concat(grammarList(playerNames)).join(' '))
  }
}

module.exports = {
  name: 'Who is Playing',
  regex: /^(who is playing|list players|list teams)/i,
  description: 'List the current game players',
  examples: ['who is playing', 'list players'],
  handler: (model) => {
    return (api, data) => whoIsPlaying(api, data, model)
  }
}
