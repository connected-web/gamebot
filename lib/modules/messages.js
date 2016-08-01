function handleMessage(api, data) {
  const matchers = api.matchers || [];
  const text = data.text;

  matchers.forEach(function(matcher) {
    if (matcher.regex.test(text)) {
      console.log(matcher.description, ':', text);
      matcher.handler(api, data);
    }
  });
}

module.exports = function(api) {
  api.matchers = api.matchers || [];

  // Handle slack messages
  api.bot.on('message', function(data) {
    try {
      // all ingoing events https://api.slack.com/rtm
      console.log('Bot event', data);

      if (data.type === 'message') {
        handleMessage(api, data);
      }
    } catch (ex) {
      api.handleError(ex);
    }
  });
}
