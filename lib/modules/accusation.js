const accusations = ['{user} is a spy', '{user} is innocent', '{user} is the commander'];

// Randomise starting accusation
var accusationCount = Math.floor(Math.random() * accusations.length);;

// Process the howl
function accuse(api, data) {
  const options = api.options;
  const name = api.getUserById(data.user).profile.first_name;
  const response = accusations[accusationCount % accusations.length].replace('{user}', name);
  const channel = 'random';
  accusationCount++;
  api.respond(channel, response);
}

module.exports = function(api) {
  api.matchers = api.matchers || [];
  api.matchers.push({
    'regex': /(accuse me)/,
    'handler': accuse,
    'description': 'Matched an accusation'
  });
};
