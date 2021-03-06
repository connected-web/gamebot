const SlackBot = require('slackbots')
const fileLabel = 'Gamebot Connect'

function isFunction (functionToCheck) {
  const getType = {}
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]'
}

function isAsyncFunction (functionToCheck) {
  const getType = {}
  return functionToCheck && getType.toString.call(functionToCheck) === '[object AsyncFunction]'
}

async function registerModules (modules, api) {
  const moduleRegistrations = modules.map(async (item) => {
    if (item.error === null) {
      try {
        if (isAsyncFunction(item.module)) {
          await item.module(api)
        } else if (isFunction(item.module)) {
          item.module(api)
        } else {
          api.log({
            level: 'info',
            fileLabel,
            message: ['Unable to register module:', item.file, ': module not recognised as function.']
          })
          return
        }
      } catch (ex) {
        item.error = ex
        item.stack = ex.stack
      }
    }

    if (item.error) {
      api.log({
        level: 'info',
        fileLabel,
        message: ['Unable to register module:', item.file, 'because of an item error:', item.error]
      })
      api.log({
        level: 'error',
        fileLabel,
        message: ['Item error stack:', item.stack]
      })
    } else {
      api.log({
        level: 'info',
        fileLabel,
        message: ['Registered module:', item.file]
      })
    }
  })

  return Promise.all(moduleRegistrations)
}

module.exports = function (api) {
  const options = api.options

  // Return a promise; resolve once connected to slack
  function connect () {
    // Create the bot
    // Needs to be set up at https://my.slack.com/services/new/bot - and set your token locally
    api.bot = new SlackBot(options.slackbot)
    api.log({
      level: 'info',
      fileLabel,
      message: ['Connecting using ', api.options.slackbot]
    })

    // Resolve the promise on connect
    const promise = new Promise((resolve, reject) => {
      // Start the bot up
      api.bot.on('start', async () => {
        api.log({
          level: 'info',
          fileLabel,
          message: ['Slackbot connected', api.options.slackbot]
        })

        const modules = api.modules || []

        await registerModules(modules, api)

        resolve(api)
      })
    })

    api.bot.on('open', function (ev) {
      api.log({
        level: 'info',
        fileLabel,
        message: ['Slackbot websocket [open]:', api.options.slackbot.name, ev]
      })
    })

    api.bot.on('close', function (ev) {
      api.log({
        level: 'info',
        fileLabel,
        message: ['Slackbot websocket [close]:', api.options.slackbot.name, ev]
      })

      setTimeout(() => {
        api.log({
          level: 'info',
          fileLabel,
          message: ['Killed process due to [close] after 5 seconds:', api.options.slackbot.name, ev]
        })
        process.exit(1)
      }, 5000)
    })

    api.bot.on('error', function (ev) {
      api.log({
        level: 'info',
        fileLabel,
        message: ['Slackbot websocket [error]:', api.options.slackbot.name, ev]
      })

      setTimeout(() => {
        api.log({
          level: 'info',
          fileLabel,
          message: ['Killed process due to [error] after 5 seconds:', api.options.slackbot.name, ev]
        })
        process.exit(1)
      }, 5000)
    })

    return promise
  }

  return connect
}
