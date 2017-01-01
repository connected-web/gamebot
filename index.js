const api = require('./lib/api');
const tokens = require('./tokens.json');

const options = {
  slackbot: {
    token: tokens.GAMEBOT_TOKEN, // Add a bot
    name: tokens.GAMEBOT_NAME || 'Mr Wolf',
    id: tokens.GAMEBOT_ID || '@gamebot',
  },
  message: {
    params: {
      icon_url: tokens.GAMEBOT_AVATAR || 'https://avatars.slack-edge.com/2016-07-21/61753258595_de5830aea51e1509144e_48.jpg'
    }
  }
};

const gamebot = api(options);

gamebot.load()
  .then(gamebot.connect)
  .catch(gamebot.handleError);
