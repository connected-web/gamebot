module.exports = function (api) {
  const options = api.options || {};
  const defaultParams = options.message && options.message.params || {};

  function respond(event, message, params) {
    const user = api.getUserById(event.user) || {};
    const channel = api.getChannelById(event.channel) || {};
    const address = channel.name || user.name || event;

    // https://api.slack.com/methods/chat.postMessage
    return api.bot.postTo(address, message, params || defaultParams);
  }

  return respond;
};
