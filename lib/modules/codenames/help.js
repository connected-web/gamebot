const matchers = require('./matchers')
const NL = '\n'

function help(api, data) {
  const gamebot = api.options.slackbot.id;
  const posterName = api.getUserName(data.user);
  const response = [`You can use these commands wherever ${gamebot} is present; for sensitive commands please send them directly to ${gamebot} in private chat.`];
  Object.keys(matchers).map((id) => {
    let matcher = matchers[id]
    response.push(`${matcher.description}`);
    const examples = (matcher.examples || []).map((example) => {
      return `*${example}*`;
    });
    response.push(`>Examples: ${examples.join('   ')}`)
  })
  api.respond(data.user, response.join(NL));
}

module.exports = (model) => {
  return help
}
