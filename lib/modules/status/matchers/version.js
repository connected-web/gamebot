module.exports = {
  name: 'Version Info',
  regex: /^what.+version.+?/i,
  description: 'Display the current version',
  examples: ['what version are you?', 'what version?', 'what version are you running?'],
  handler: (model) => {
    return (api, data) => {
      api.respond(model.gameChannel, `Gamebot is running version: '${model.version}'`)
    }
  }
}
