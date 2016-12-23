const load = require('./load');
const connect = require('./connect');
const respond = require('./respond');
const message = require('./message');
const handleError = require('./handleError');

module.exports = function(options) {
  const api = {};

  api.bot = null;
  api.matchers = [];
  api.options = options;
  api.load = load(api);
  api.connect = connect(api);
  api.respond = respond(api);
  api.message = message(api);
  api.handleError = handleError(api);

  return api;
};
