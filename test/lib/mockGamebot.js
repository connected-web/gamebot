const api = require('../../lib/api');
const handleMessage = require('../../lib/handleMessage');
const LOG_ENABLED = false;

function mockGamebot() {
  var userIDIndex = {
    'u0': 'Test Bot',
    'u1': 'John',
    'u2': 'Henrietta',
    'u3': 'Claus',
    'u4': 'Triela',
    'u5': 'Rico',
    'u6': 'Angelica'
  };
  var channelIDIndex = {};

  var userNameIndex = {};
  Object.keys(userIDIndex).forEach((userId) => {
    userNameIndex[userIDIndex[userId].toLowerCase()] = userId;
  });

  gamebot = api({
    slackbot: {
      id: '@bot'
    }
  });

  gamebot.getUserName = (id) => {
    return userIDIndex[id] || id;
  };

  gamebot.getChannelName = (id) => {
    return channelIDIndex[id] || id;
  }

  gamebot.findUserByName = (name) => {
    return {
      name,
      id: userNameIndex[(name + '').toLowerCase()]
    };
  }

  gamebot.simulateMessage = (message, userId, channelId) => {
    handleMessage(gamebot, {
      type: 'message',
      text: message,
      user: userId,
      channel: channelId || 'private'
    }, LOG_ENABLED);
  };

  gamebot.respond = () => {};

  return gamebot;
}

module.exports = mockGamebot;
