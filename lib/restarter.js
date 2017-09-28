const delayInMs = 60000 * 60
let timeoutId = 0

function start () {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(restart, delayInMs)
}

function restart () {
  process.exit(0)
}

module.exports = {
  start
}
