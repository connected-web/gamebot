function makeUserSpyMaster (api, data, model) {
  const posterName = api.getUserName(data.user)
  const team = model.teams.filter((team) => team.players.includes(data.user))[0]

  if (team) {
    team.spymaster = data.user
    api.respond(data, `${posterName} you are now a spy master`)
    api.respond(module.gameChannel, `${posterName} has been assigned as a spy master for Team ${team.name}`)
  } else {
    api.respond(data, `${posterName} you're not in a team, you can't be spy master`)
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
