var SlackBot = require('slackbots');

const howls = ['Howwwwll~', 'Aawwwwooooh!', 'Snarl.', 'Growll', '*Pants*', 'Woof?', '{user} is a wereworlf...'];

// Return a promise; resolve once connected to slack
function connect(options) {

  // Create the bot
  // Needs to be set up at https://my.slack.com/services/new/bot - and set your token locally
  var bot = new SlackBot(options.slackbot);

  // Resolve the promise on connect
  const promise = new Promise((resolve, reject) => {

    // Randomise starting howl
    var howlCount = Math.floor(Math.random() * howls.length);

    // Start the bot up
    bot.on('start', function() {

      // Handle slack messages
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
        console.log('Users', JSON.stringify(users, null, 2));
      });

      resolve(bot);
    });
  });

  function respond(channel, message) {
    // https://api.slack.com/methods/chat.postMessage
    return bot.postMessageToChannel(channel, message, options.message.params);
  }

  return promise;
}

module.exports = connect;
