const write = require('promise-path').write;

// Howl responses
const howls = ['Howwwwll~', 'Aawwwwooooh!', 'Snarl.', 'Growll', '*Pants*', 'Woof?', '{user} {predicate} a werewolf...'];
const statePath = process.cwd() + '/state/howl-state.json';

// Randomise starting howl
var howlCount = 0;
var matcher = /(woof|wolf|wolve)/i;
var responses = [];

// Store data for external viewing
function saveState() {
  const data = {
    howlCount,
    matcher: matcher + '',
    howls,
    responses
  };

  const contents = JSON.stringify(data, null, 2);
  write(statePath, contents, 'utf8');
}

// Process the howl
function howl(api, data) {
  const options = api.options;
  const poster = api.getUserById(data.user);
  const posterName = (poster && poster.profile && poster.profile.first_name || poster.name) || data.user;
  const name = posterName;
  const predicate = 'is';
  if (name.toLowerCase() === 'mr wolf') {
    name = 'I';
    predicate = 'am';
  }
  const response = howls[howlCount % howls.length].replace('{user}', name)
    .replace('{user}', name)
    .replace('{predicate}', predicate);
  const channel = 'random';
  howlCount++;
  api.respond(channel, response);

  responses.push({
    channel,
    response
  });

  saveState();
}

module.exports = function(api) {
  api.matchers = api.matchers || [];
  api.matchers.push({
    'regex': matcher,
    'handler': howl,
    'description': 'Matched a howler'
  });

  const options = api.options || {};
  howlCount = options.howl && options.howl.seed || Math.floor(Math.random() * howls.length);
};
