function makeUserSpyMaster (api, data, model) {
  const posterName = api.getUserName(data.user)

  api.respond(data, `${posterName} you are now a spy master`)
  api.respond(module.gameChannel, `${posterName} has been assigned as a spy master for X team`)
}

module.exports = {
  name: 'Make user a spy master',
  regex: /^make me spy ?master/i,
  description: 'Make the user a spy master',
  examples: ['Make me a spy master!'],
  handler: (model) => {
    return (api, data) => makeUserSpyMaster(api, data, model)
  }
}
