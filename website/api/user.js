const fs = require('fs');

var endpoint = function () {}
var userIndex = false;

endpoint.route = '/api/user/:name';
endpoint.cacheDuration = '30 seconds';
endpoint.description = 'A specific user'

endpoint.configure = function (config) {

}

endpoint.render = function (req, res) {
  var data = {};
  try {
    if (!userIndex) {
      var users = JSON.parse(fs.readFileSync(__dirname + '/../../state/user-list.json', 'utf8'));
      userIndex = {};
      users.members.forEach((user) => {
        userIndex[user.name] = user;
      });
    }
    data = userIndex[req.params.name] || {
      error: true,
      message: `User ${req.params.name} not found`
    };
  } catch (ex) {
    data.error = true;
    data.message = 'Unable to read data file: ' + ex;
    data.stack = ex.stack;
  }
  // send response
  res.jsonp(data);
}

module.exports = endpoint;
