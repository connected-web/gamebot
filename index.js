const express = require('express')
const api = require('./lib/api/api')
const tokens = require('./tokens')
const restarter = require('./lib/restarter')
const routeFactory = require('./src/routes/factory')

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
  .then(startRestarter)
  .then(startWebserver)
  .catch((ex) => {
    console.error('Catch All', ex, ex.stack)
  })

function startRestarter (bots) {
  const gamebot = bots[0]
  restarter.start(gamebot)
  return bots
}

function startWebserver (bots) {
  const app = express()
  const routes = routeFactory(bots)
  const port = process.env.PORT || 9000
  const environment = process.env.ENVIRONMENT || 'developer'
  app.get('/', (req, res) => res.send(`[Gamebot] Webserver environment: ${environment}`))
  app.use('/gamebot', routes)
  app.listen(port, () => console.log(`[Gamebot Index] Webserver listening on port: ${port}`))
}
