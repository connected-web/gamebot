const api = require('../../lib/api/api')
const handleMessage = require('../../lib/api/handleMessage')
const LOG_ENABLED = false

function mockGamebot () {
  var userIDIndex = {
    'ux': 'Test Bot',
    'u0': 'Non Player',
    'u1': 'John',
    'u2': 'Henrietta',
    'u3': 'Claus',
    'u4': 'Triela',
    'u5': 'Rico',
    'u6': 'Angelica',
    'u7': 'Hannah'
  }
  var channelIDIndex = {}

  var userNameIndex = {}
  Object.keys(userIDIndex).forEach((userId) => {
    userNameIndex[userIDIndex[userId].toLowerCase()] = userId
  })

  let gamebot = api({
    slackbot: {
      token: 'xyz123',
      name: 'Test Bot',
      id: '@testbot'
    }
  })

  gamebot.getUserById = (userId) => {
    const user = userIDIndex[userId]
    return {
      id: userId,
      name: user
    }
  }

  gamebot.getUserName = (id) => {
    return userIDIndex[id] || id
  }

  gamebot.getChannelName = (id) => {
    return channelIDIndex[id] || id
  }

  gamebot.findUserByName = (name) => {
    return {
      name,
      id: userNameIndex[(name + '').toLowerCase()]
    }
  }

  gamebot.simulateMessage = (message, userId, channelId) => {
    handleMessage(gamebot, {
      type: 'message',
      text: message,
      user: userId,
      channel: channelId || 'private'
    }, LOG_ENABLED)
  }

  gamebot.respond = () => {}

  return gamebot
}

module.exports = mockGamebot
