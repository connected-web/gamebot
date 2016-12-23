module.exports = function (api) {
  const options = api.options || {};
  const defaultParams = options.message && options.message.params || {};

  function respond(id, message, params) {
    const user = api.getUserById(id) || {};
    const channel = api.getChannelById(id) || {};
    const address = user.name || channel.name || id;

    // https://api.slack.com/methods/chat.postMessage
    return api.bot.postTo(address, message, params || defaultParams);
  }

  return respond;
};
