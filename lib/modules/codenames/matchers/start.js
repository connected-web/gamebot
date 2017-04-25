const NL = '\n'

const grammarList = require('grammarlist')

function start (api, data, model) {
  const posterName = api.getUserName(data.user)

  function displayTeam (team) {
    const players = team.players.map(api.getUserName)
    if (team.solitaire) {
      return `>Team ${team.name}: Solitaire Mode`
    } else {
      return `>Team ${team.name}: ${grammarList(players, 'and')}`
    }
  }

  if (model.players.includes(data.user) === false) {
    return api.respond(data.user, `${posterName} - please join the game in order to begin playing. Say 'start game' when ready.`)
  }

  if (model.players.length < 2) {
    return api.respond(data.user, `Unable to start the game, there needs to be at least two players.`)
  }

  if (model.started) {
    return api.respond(data.user, `Unable to start the game, a game is already in progress.`)
  }

  if (model.players.length === 2 || model.players.length === 3) {
    // Assign everyone to team 1
    model.players.forEach((player) => {
      model.teams[0].players.push(player)
    })
    model.teams[1].solitaire = true
  } else {
    // Randomly sort players into teams
  }
  model.started = true

  api.respond(
    model.gameChannel, [`Codenames has begun, teams are:`]
    .concat(model.teams.map(displayTeam))
    .join(NL)
  )
}

module.exports = {
  name: 'Start game',
  regex: /start (game|codenames)/i,
  description: 'Start the current game; requires at least two players',
  examples: ['start game', 'start codenames'],
  handler: (model) => {
    return (api, data) => start(api, data, model)
  }
}
