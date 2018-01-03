function setWordlist (api, data, model) {
  const wordlists = ['xmas', 'starwars', 'standard']
  let wordlist = data.text.match(module.exports.regex)[1].trim().toLowerCase()

  let posterName = api.getUserName(data.user)
  if (wordlists.includes(wordlist)) {
    model.wordlist = wordlist
    model.save()
    api.respond(model.gameChannel, `${posterName} has set the wordlist to "${model.wordlist}".`)
  } else {
    api.respond(model.gameChannel, `"${wordlist}" is not a valid wordlist, choose from one of: ${wordlists.join(', ')}`)
  }
}

module.exports = {
  name: 'Set wordlist',
  regex: /^set word\s?list ([A-z]+)/i,
  description: 'Set the wordlist',
  examples: ['set wordlist standard', 'set wordlist xmas'],
  handler: (model) => {
    return (api, data) => setWordlist(api, data, model)
  }
}
