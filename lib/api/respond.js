const messageDelay = 100

module.exports = function (api) {
  const options = api.options || {}
  const defaultParams = options.message && (options.message.params || {})

  let unsentMessages = []
  let promptId = 0

  function respond (event, message, params) {
    const user = (event) ? api.getUserById(event.user) || api.getUserById(event + '') || {} : {}
    const channel = (event) ? api.getChannelById(event.channel) || api.getChannelById(event + '') || {} : {}
    const address = channel.name || user.name || event

    unsentMessages.push({ address, message, params })
    prompt()
  }

  function prompt () {
    if (promptId) {
      clearTimeout(promptId)
    }
    promptId = setTimeout(sendUnsentMessages, messageDelay)
  }

  function sendUnsentMessages () {
    console.log('Sending unsent message', unsentMessages.length, 'messages remaining')
    let { address, message, params } = unsentMessages.shift()
    api.bot.postTo(address, message, Object.assign({}, defaultParams, params))

    if (unsentMessages.length > 0) {
      prompt()
    }
  }

  return respond
}
