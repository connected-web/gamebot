var SlackBot = require('slackbots');

// Create the bot
// Needs to be set up at https://my.slack.com/services/new/bot - and set your token locally
var bot = new SlackBot({
  token: process.env.GAMEBOT_TOKEN, // Add a bot
  name: 'Mr Wolf',
  id: '@gamebot'
});

bot.on('start', function() {
  // more information about additional params
  // https://api.slack.com/methods/chat.postMessage
  const params = {
    icon_url: 'https://avatars.slack-edge.com/2016-07-21/61753258595_de5830aea51e1509144e_48.jpg'
  };

  // define channel, where bot exist.
  // You can adjust it there https://my.slack.com/services
  bot.postMessageToChannel('random', 'Growwl~', params)
    .then(finish)
    .fail(catchError);
});

function finish(data) {
  console.log(data, JSON.stringify(data, null, 2));
  process.exit(0);
}

function catchError(e) {
  console.log('Slackerr', e);
}
