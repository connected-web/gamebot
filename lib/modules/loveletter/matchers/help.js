const loadMatchers = require('../matchers')
let matchers
const NL = '\n'

function help (api, data) {
  matchers = matchers || loadMatchers()
  const gamebot = api.options.slackbot.id
  const response = [`You can use these commands wherever ${gamebot} is present; for sensitive commands please send them directly to ${gamebot} in private chat.`]
  Object.keys(matchers).map((id) => {
    let matcher = matchers[id]
    response.push(`*${matcher.name}* : ${matcher.description}`)
    const examples = (matcher.examples || []).map((example) => {
      return `*${example}*`
    })
    response.push(`>Examples: ${examples.join('   ')}`)
  })
  api.respond(data.user, response.join(NL))
}

module.exports = {
  name: 'Help',
  regex: /^(love\s?letter help)|(how do I( play love\s?letter)?)/i,
  description: 'Provide a list of commands on how to play love letter',
  examples: ['love letter help', 'how do I play love letter', 'how do I play'],
  handler: (model) => {
    return help
  }
}
