const NL = '\n'

function makeUserSpyMaster (api, data, model) {
  const posterName = api.getUserName(data.user)
  const team = model.teams.filter((team) => team.players.includes(data.user))[0]

  if (model.words.length > 0) {
    return api.respond(data, `Unable to assign new spy master; words have already been assigned to teams`)
  }

  if (team) {
    team.spymaster = data.user
    api.respond(data, `${posterName} you are now a spy master`)
    api.respond(model.gameChannel, `${posterName} has been assigned as a spy master for Team ${team.name}`)
  } else {
    api.respond(data, `${posterName} you're not in a team, you can't be spy master`)
  }

  checkIfReady(api, data, model)
}

function checkIfReady (api, data, model) {
  if (model.teams[0].spymaster && model.teams[1].spymaster) {
    // ready to start a two team game
    model.pickWords()
  } else if (model.teams[0].spymaster && model.teams[1].solitaire) {
    // ready to start a single team game
    model.pickWords()
  }

  if (model.words.length > 0) {
    api.respond(module.gameChannel, [`Locations have been identified:`]
      .concat(model.words.map((item) => `>${item.word}`))
      .join(NL))
  }

  if (model.words.length > 0) {
    let assassinWords = model.words.filter((item) => item.team === 'assassin')
    let redWords = model.words.filter((item) => item.team === 'red')
    let blueWords = model.words.filter((item) => item.team === 'blue')
    let neutralWords = model.words.filter((item) => item.team === 'neutral')

    let spymasterInformation = [`Locations have been identified:`]
      .concat([].concat(assassinWords, blueWords, redWords, neutralWords)
      .map((item) => `>:${item.team}: ${item.word}`))
      .join(NL)

    model.teams.forEach((team) => {
      if (team.spymaster) {
        api.respond(team.spymaster, spymasterInformation)
      }
    })

    let spymaster = model.teams[0].spymaster
    let playerName = api.getUserName(spymaster)
    api.respond(spymaster, `${playerName} your operatives are now active. Give a one word clue, followed by a number; for example: *flying 3* to match 3 words relating to flying. Say *help clues* for more information.`)
  }
}

module.exports = {
  name: 'Make user a spy master',
  regex: /^make me (a )?spy ?master/i,
  description: 'Make the user a spy master for their team',
  examples: ['Make me spy master!'],
  handler: (model) => {
    return (api, data) => makeUserSpyMaster(api, data, model)
  }
}
