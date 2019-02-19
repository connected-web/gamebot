const timeSince = require('time-until')

module.exports = {
  name: 'Uptime Info',
  regex: /^(uptime|how long have you been running)\??/i,
  description: 'Display the uptime',
  examples: ['uptime', 'how long have you been running?', ''],
  handler: (model) => {
    return (api, data) => {
      const now = new Date()
      const uptime = timeSince(now, model.startTime)
      if (uptime.string === 'now') {
        api.respond(model.statusChannel, `Gamebot has just started!`)
      } else {
        api.respond(model.statusChannel, `Gamebot has been running for ${uptime.string}.`)
      }
    }
  }
}
