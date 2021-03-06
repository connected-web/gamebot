module.exports = {
  name: 'Version Info',
  regex: /^(what.+version.+?|display current version)/i,
  description: 'Display the current version',
  examples: ['what version are you?', 'what version?', 'what version are you running?', 'display current version'],
  handler: (model) => {
    return (api, data) => {
      api.respond(model.statusChannel, `Gamebot is running version: *${model.version}*.`)
    }
  }
}
