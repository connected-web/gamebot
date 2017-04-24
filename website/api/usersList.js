let endpoint = function () {}
let gamebot

endpoint.route = '/api/users/list'
endpoint.cacheDuration = '30 seconds'
endpoint.description = 'A list of users'

endpoint.configure = function (config) {
  gamebot = config.gamebot
}

endpoint.render = function (req, res) {
  var users = gamebot.users.members

  // convert to list of names
  var data = users.map((user) => {
    return user.name
  })

  // send response
  res.jsonp(data)
}

module.exports = endpoint
