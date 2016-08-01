module.exports = function(api) {
  // TODO: Look up channel name by ID

  const options = api.options || {};
  const defaultParams = options.message && options.message.params || {};

  function respond(channel, message, params) {
    // https://api.slack.com/methods/chat.postMessage
    return api.bot.postMessageToChannel(channel, message, params || defaultParams);
  }

  return respond;
};
