const accusations = ['{user} is a spy', '{user} is innocent', '{user} is the commander'];

// Randomise starting accusation
var accusationCount = Math.floor(Math.random() * accusations.length);;

// Process the accusation
function accuse(api, data) {
  const options = api.options;
  const posterName = api.getUserById(data.user).profile.first_name;
  const highlightName = data.text.match(/accuse ([A-z]+)/)[1];
  const name = (highlightName === 'me') ? posterName : highlightName;
  const response = accusations[accusationCount % accusations.length].replace('{user}', name);
  const channel = 'random';
  accusationCount++;
  api.respond(channel, response);
}

module.exports = function(api) {
  api.matchers = api.matchers || [];
  api.matchers.push({
    'regex': /accuse ([A-z]+)/,
    'handler': accuse,
    'description': 'Matched an accusation'
  });
};
