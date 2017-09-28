const botChannel = 'bot_status'
const delayInMs = (60 - 30 * Math.random()) * 60 * 1000
let timeoutId = 0

function inMinutes (periodInMs) {
  return (periodInMs / 1000 / 60).toFixed(0)
}

function start (api) {
  clearTimeout(timeoutId)
  setTimeout(signalReady, 5000, api)
  timeoutId = setTimeout(signalRestart, delayInMs, api)
}

function signalReady (api) {
  api.respond(botChannel, `Started a restart timer for ${inMinutes(delayInMs)} minutes`)
}

function signalRestart (api) {
  api.respond(botChannel, `Restarting the service in 10 seconds!`)
  setTimeout(restart, 10000)
}

function restart () {
  process.exit(0)
}

module.exports = {
  start,
  delayInMs
}
