const botChannel = 'bot_status'
const delayInMs = 60000 * 60
let timeoutId = 0

function start (api) {
  clearTimeout(timeoutId)
  setTimeout(signalReady, 5000, api)
  timeoutId = setTimeout(signalRestart, delayInMs, api)
}

function signalReady (api) {
  api.respond(botChannel, `Started a restart timer for ${delayInMs / 1000 / 60} minutes`)
}

function signalRestart (api) {
  api.respond(botChannel, `Restarting the service in 10 seconds!`)
  setTimeout(restart, 10000)
}

function restart () {
  process.exit(0)
}

module.exports = {
  start
}
