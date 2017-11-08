const NL = '\n'

const grammarList = require('grammarlist')

function start (api, data, model) {
  const posterName = api.getUserName(data.user)

  function displayTeam (team) {
    const players = team.players.map(api.getUserName)
    let teamName = team.name
    let icon = `:${teamName.toLowerCase()}:`
    if (team.solitaire) {
      return `>${icon} ${team.name} Team: Solitaire Mode`
    } else {
      return `>${icon} ${team.name} Team: ${grammarList(players, 'and')}`
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
    let playerPool = [].concat(model.players)
    let team1Players, team2Players

    // Randomise who gets the most players
    if (Math.random() >= 0.5) {
      team1Players = pickXFrom(Math.ceil(playerPool.length / 2), playerPool)
      team2Players = playerPool
    } else {
      team2Players = pickXFrom(Math.ceil(playerPool.length / 2), playerPool)
      team1Players = playerPool
    }

    team1Players.forEach((player) => model.teams[0].players.push(player))
    team2Players.forEach((player) => model.teams[1].players.push(player))

    // Randomly assign team colour
    if (Math.random() >= 0.5) {
      model.teams[0].name = 'Red'
      model.teams[1].name = 'Blue'
    } else {
      model.teams[0].name = 'Blue'
      model.teams[1].name = 'Red'
    }
  }
  model.started = true
  model.save()

  api.respond(
    model.gameChannel, [`Codenames has begun, teams are:`]
    .concat(model.teams.map(displayTeam))
    .concat('Choose a spy master for your team by saying "make me spy master"')
    .join(NL)
  )
}

function pickXFrom (count, list) {
  let result = []
  while (result.length < count && list.length > 0) {
    let i = Math.floor(Math.random() * list.length)
    let item = list[i]
    list.splice(i, 1)
    result.push(item)
  }
  return result
}

module.exports = {
  name: 'Start game',
  regex: /^start (game|codenames)/i,
  description: 'Start the current game; requires at least two players',
  examples: ['start game', 'start codenames'],
  handler: (model) => {
    return (api, data) => start(api, data, model)
  }
}
