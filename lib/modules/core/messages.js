const handleMessage = require('../../api/handleMessage')

module.exports = function (api) {
  api.matchers = api.matchers || []

  // Handle slack messages
  api.bot.on('message', function (data) {
    try {
      // all ingoing events https://api.slack.com/rtm
      api.log({
        level: 'info',
        fileLabel: 'Messages',
        message: [`${api.options.slackbot.name} event`, data]
      })

      // normalise a message edit into a normal message
      if (data.subtype === 'message_changed' && data.message) {
        data.text = data.message.text
        data.user = data.message.user
      }
      // continue handling
      if (data.type === 'message') {
        handleMessage(api, data)
      }
    } catch (ex) {
      api.handleError(ex)
    }
  })
}
