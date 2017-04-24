const api = require('./lib/api')
const tokens = require('./tokens.json')

const bots = tokens.map(makeBot)

function makeBot (config) {
  const options = {
    slackbot: {
      token: config.token,
      name: config.name,
      id: config.id
    },
    message: {
      params: {
        icon_url: config.avatar
      }
    },
    modules: config.modules
  }
  const bot = api(options)

  return bot
}

function startBot (bot) {
  return bot.load()
    .then(bot.connect)
    .catch(bot.handleError)
}

Promise.all(bots.map(startBot))
  .then(startWebsite)
  .catch((ex) => {
    console.error('Catch All', ex, ex.stack)
  })

function startWebsite (bots) {
  var monitor = require('product-monitor')
  monitor({
    'serverPort': 9000,
    'productInformation': {
      'title': 'Gamebot Monitor'
    },
    'userContentPath': 'website',
    'gamebot': bots[0],
    'bots': bots
  })
}
