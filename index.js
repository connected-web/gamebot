const path = require('path')
const express = require('express')
const { make } = require('promise-path')

const api = require('./lib/api/api')
const tokens = require('./tokens')
const routeFactory = require('./src/routes/factory')

const logpath = process.env.GAMEBOT_LOG_PATH || path.join(__dirname, 'logs')
const fileLabel = 'Gamebot Index'
console.log('[Gamebot Index] Logging to:', logpath)
const logger = require('./lib/logger')(logpath)
logger.log({
  level: 'info',
  fileLabel,
  message: `Log file created at ${new Date().toUTCString()}`
})

function makeBot (config) {
  logger.log({
    level: 'info',
    fileLabel,
    message: ['Making bot', config.name]
  })
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
  const bot = api(options, m => logger.log(m))
  return bot
}

function startBot (bot) {
  return bot.load()
    .then(bot.connect)
    .catch(bot.handleError)
}

async function initialise (logger) {
  try {
    await make(logpath)
    const bots = await Promise.all(tokens.map(makeBot).map(startBot))
    await startWebserver(bots, logger)
    logger.log({
      level: 'info',
      fileLabel,
      message: 'Initialised bots, restarters, and webserver.'
    })
  } catch (ex) {
    logger.log({
      level: 'error',
      fileLabel,
      message: ['Catch All', ex, ex.stack]
    })
  }
}

function startWebserver (bots, logger) {
  const app = express()
  const routes = routeFactory(bots)
  const port = process.env.PORT || 9000
  const environment = process.env.ENVIRONMENT || 'developer'
  app.get('/', (req, res) => res.send(`[Gamebot] Webserver environment: ${environment}`))
  app.use('/gamebot', routes)
  app.listen(port, () => logger.log({
    level: 'info',
    fileLabel,
    message: `Webserver listening on port: ${port}`
  }))

  return app
}

initialise(logger)
