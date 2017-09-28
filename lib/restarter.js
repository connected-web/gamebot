// const delayInMs = 60000 * 60
let timeoutId = 0

function start () {
  restart()
  clearTimeout(timeoutId)
  // timeoutId = setTimeout(restart, delayInMs)
}

function restart () {
  console.log('Restarting the service')
  process.exit(0)
}

module.exports = {
  start
}
