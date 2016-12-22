const api = require('./lib/api');
const tokens = require('tokens.json');

const options = {
  slackbot: {
    token: tokens.GAMEBOT_TOKEN, // Add a bot
    name: 'Mr Wolf',
    id: '@gamebot',
  },
  message: {
    params: {
      icon_url: 'https://avatars.slack-edge.com/2016-07-21/61753258595_de5830aea51e1509144e_48.jpg'
    }
  }
};

const gamebot = api(options);

gamebot.load()
  .then(gamebot.connect)
  .catch(gamebot.handleError);
