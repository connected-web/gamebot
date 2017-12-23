function setWordlist (api, data, model) {
  model.wordlist = data.text.match(module.exports.regex)[1].trim().toLowerCase()
  model.save()

  let posterName = api.getUserName(data.user)
  api.respond(model.gameChannel, `${posterName} has set the wordlist to "${model.wordlist}".`)
}

module.exports = {
  name: 'Set wordlist',
  regex: /^set wordlist ([A-z]+)/i,
  description: 'Set the wordlist',
  examples: ['set wordlist standard', 'set wordlist xmas'],
  handler: (model) => {
    return (api, data) => setWordlist(api, data, model)
  }
}
