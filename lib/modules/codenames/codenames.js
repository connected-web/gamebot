const gameChannel = 'codenames';
const matchers = require('./matchers')
const NL = '\n'

let model = {}

// Process the accusation
function makeUserSpyMaster(api, data) {
  const posterName = api.getUserName(data.user);

  api.respond(data, `${posterName} you are now a spy master`);
  api.respond(gameChannel, `${posterName} has been assigned as a spy master for X team`);
}

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

function reset() {
  model = {}
}

module.exports = function (api) {

  let handlers = {
    makeUserSpyMaster,
    help
  }

  function lookup(id) {
    let matcher = matchers[id]
    return {
      regex: matcher.regex,
      description: matcher.description,
      handler: handlers[id]
    }
  }

  api.matchers = api.matchers || [];
  Object.keys(matchers).map(lookup).forEach((matcher) => api.matchers.push(matcher))

  return {
    reset
  }
};
