var endpoint = function () {}

var server = false;

endpoint.route = '/api/howl/state';
endpoint.cacheDuration = '1 second';
endpoint.description = 'The current state of the howl...'

endpoint.configure = function (config) {
  server = config.server;
}

endpoint.render = function (req, res) {
  var data = {};
  try {
    data = fs.readFileSync(__dirname + '/../../state/howl-state.json');
  } catch (ex) {
    data.error = true;
    data.message = 'Unable to read data file: ' + ex;
    data.stack = ex.stack;
  }
  // send response
  res.jsonp(data);
}

module.exports = endpoint;
