const fs = require('fs');

var endpoint = function () {}

endpoint.route = '/api/users/list';
endpoint.cacheDuration = '30 seconds';
endpoint.description = 'A list of users'

endpoint.configure = function (config) {

}

endpoint.render = function (req, res) {
  var data = {};
  try {
    var users = JSON.parse(fs.readFileSync(__dirname + '/../../state/user-list.json', 'utf8'));
    data = users.members.map((user) => {
      return name;
    });
  } catch (ex) {
    data.error = true;
    data.message = 'Unable to read data file: ' + ex;
    data.stack = ex.stack;
  }
  // send response
  res.jsonp(data);
}

module.exports = endpoint;
