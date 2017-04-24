let endpoint = function () {}
let gamebot

endpoint.route = '/api/user/:name'
endpoint.cacheDuration = '30 seconds'
endpoint.description = 'A specific user'

endpoint.configure = function (config) {
  gamebot = config.gamebot
}

endpoint.render = function (req, res) {
  // Index users
  var users = gamebot.users.members
  var userIndex = {}
  users.forEach((user) => {
    userIndex[user.name] = user
  })

  // Return user by name
  var name = req.params.name
  var data = gamebot.findUserByName(name) || {
    error: true,
    message: `User ${req.params.name} not found`
  }

  // send response
  res.jsonp(data)
}

module.exports = endpoint
