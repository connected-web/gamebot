const NL = '\n'

function makeUserSpyMaster (api, data, model) {
  const posterName = api.getUserName(data.user)
  const team = model.teams.filter((team) => team.players.includes(data.user))[0]

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
      .concat(model.words.map((w) => `>${w}`))
      .join(NL))
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
