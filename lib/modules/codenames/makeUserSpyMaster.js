function makeUserSpyMaster (api, data, model) {
  const posterName = api.getUserName(data.user)

  api.respond(data, `${posterName} you are now a spy master`)
  api.respond(module.gameChannel, `${posterName} has been assigned as a spy master for X team`)
}

module.exports = (model) => {
  return (api, data) => makeUserSpyMaster(api, data, model)
}
