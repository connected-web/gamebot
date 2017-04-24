const handleMessage = require('../handleMessage')

module.exports = function (api) {
  api.matchers = api.matchers || []

  // Handle slack messages
  api.bot.on('message', function (data) {
    try {
      // all ingoing events https://api.slack.com/rtm
      console.log('Bot event', data)

      if (data.type === 'message') {
        handleMessage(api, data)
      }
    } catch (ex) {
      api.handleError(ex)
    }
  })
}
