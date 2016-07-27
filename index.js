var SlackBot = require('slackbots');

// Create the bot
// Needs to be set up at https://my.slack.com/services/new/bot - and set your token locally
var bot = new SlackBot({
  token: process.env.GAMEBOT_TOKEN, // Add a bot
  name: 'Mr Wolf',
  id: '@gamebot'
});

var howls = ['Howwwwll~', 'Aawwwwooooh!', 'Snarl.', 'Growll', '*Pants*', 'Woof?', '{user} is a wereworlf...'];
var howlCount = Math.floor(Math.random() * howls.length);

const params = {
    icon_url: 'https://avatars.slack-edge.com/2016-07-21/61753258595_de5830aea51e1509144e_48.jpg'
};

bot.on('start', function() {
  // more information about additional params

  bot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm
    console.log('Bot event', data);

    if (data.type === 'message') {
      if (data.text.includes('woof') || data.text.includes('wolf') || data.text.includes('wolve')) {
        respond('random', howls[howlCount % howls.length].replace('{user}', data.user));
        howlCount++;
      }
    }
    const users = bot.getUsers();
    console.log('Users', users);
  });
});

function respond(channel, message) {
  // https://api.slack.com/methods/chat.postMessage
  return bot.postMessageToChannel(channel, message, params);
}

function finish(data) {
  console.log(data, JSON.stringify(data, null, 2));
  process.exit(0);
}

function catchError(e) {
  console.log('Slackerr', e);
}
