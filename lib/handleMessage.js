function handleMessage(api, data, log = true) {
  const matchers = api.matchers || [];
  const text = data.text;

  const gamebot = api.findUserByName(api.options.slackbot.name);
  const sender = api.getUserById(data.user);

  // ignore messages if they came from gamebot
  if (sender && gamebot && sender.name === gamebot.name) {
    console.log('Originator was gamebot', gamebot, sender, text);
    return;
  }

  const channelName = api.getChannelName(data.channel);
  matchers.forEach(function (matcher) {
    // prevent messages being checked out of channel
    if (matcher.channels && matcher.channels.includes(channelName) === false) {
      return;
    }
    // check message
    if (matcher.regex.test(text)) {
      if (log) {
        console.log(`Matched "${matcher.description}" (${matcher.regex}) in "${text}"`);
      }
      matcher.handler(api, data);
    }
  });
}

module.exports = handleMessage;
