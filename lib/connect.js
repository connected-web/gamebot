var SlackBot = require('slackbots');

const howls = ['Howwwwll~', 'Aawwwwooooh!', 'Snarl.', 'Growll', '*Pants*', 'Woof?', '{user} is a wereworlf...'];

module.exports = function(api) {

  const options = api.options;

  // Return a promise; resolve once connected to slack
  function connect() {

    // Create the bot
    // Needs to be set up at https://my.slack.com/services/new/bot - and set your token locally
    api.bot = new SlackBot(options.slackbot);

    console.log('Connecting using ', api.options.slackbot);

    // Resolve the promise on connect
    const promise = new Promise((resolve, reject) => {

      // Randomise starting howl
      var howlCount = Math.floor(Math.random() * howls.length);

      // Start the bot up
      api.bot.on('start', function() {

        console.log('Slackbot connected');

        // Handle slack messages
        api.bot.on('message', function(data) {
          try {
            // all ingoing events https://api.slack.com/rtm
            console.log('Bot event', data);

            if (data.type === 'message') {
              if (data.text.includes('woof') || data.text.includes('wolf') || data.text.includes('wolve')) {
                const response = howls[howlCount % howls.length].replace('{user}', data.user);
                const channel = 'random';
                api.respond(channel, response, options.message.params);
                howlCount++;
              }
            }
            const users = api.bot.getUsers();
            console.log('Users', JSON.stringify(users, null, 2));
          } catch (ex) {
            api.handleError(ex);
          }
        });

        resolve(api.bot);
      });
    });

    return promise;
  }

  return connect;
};
