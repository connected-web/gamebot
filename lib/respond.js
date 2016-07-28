module.exports = function(api) {
  // TODO: Look up channel name by ID

  function respond(channel, message, params) {
    // https://api.slack.com/methods/chat.postMessage
    return api.bot.postMessageToChannel(channel, message, params);
  }

  return respond;
};
