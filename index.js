const api = require('./lib/api/api')
const tokens = require('./tokens.json')
const restarter = require('./lib/restarter')

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
  .then(startRestarter)
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
  return bots
}

function startRestarter (bots) {
  const gamebot = bots[0]
  restarter.start(gamebot)
}
