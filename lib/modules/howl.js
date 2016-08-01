// Howl responses
const howls = ['Howwwwll~', 'Aawwwwooooh!', 'Snarl.', 'Growll', '*Pants*', 'Woof?', '{user} is a werewolf...'];

// Randomise starting howl
var howlCount = Math.floor(Math.random() * howls.length);

// Process the howl
function howl(api, data) {
  const options = api.options;
  const response = howls[howlCount % howls.length].replace('{user}', data.user);
  const channel = 'random';
  howlCount++;
  api.respond(channel, response, options.message.params);
}

module.exports = function(api) {
  api.matchers = api.matchers || [];
  api.matchers.push({
    'regex': /(woof|wolf|wolve)/,
    'handler': howl,
    'description': 'Matched a howler'
  });
};
