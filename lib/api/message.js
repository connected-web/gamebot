module.exports = function (api) {
  const options = api.options || {}
  const defaultParams = options.message && (options.message.params || {})

  function message (user, message, params) {
    // https://api.slack.com/methods/chat.postMessage
    return api.bot.postTo(user, message, params || defaultParams)
  }

  return message
}
