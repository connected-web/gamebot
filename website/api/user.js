const fs = require('fs');

var endpoint = function () {}
var gamebot;

endpoint.route = '/api/user/:name';
endpoint.cacheDuration = '30 seconds';
endpoint.description = 'A specific user'

endpoint.configure = function (config) {
  gamebot = config.gamebot;
}

endpoint.render = function (req, res) {
  // Index users
  var users = gamebot.users.members;
  var userIndex = {};
  users.forEach((user) => {
    userIndex[user.name] = user;
  });

  // Return user by name
  var data = userIndex[req.params.name] || {
    error: true,
    message: `User ${req.params.name} not found`
  };

  // send response
  res.jsonp(data);
}

module.exports = endpoint;
