const accusations = ['{user} {predicate} a spy', '{user} {predicate} innocent', '{user} {predicate} the commander'];

// Randomise starting accusation
var accusationCount = Math.floor(Math.random() * accusations.length);;
var matcher = /[Aa]ccuse ([A-z]+( [A-z]+)?)/;

// Process the accusation
function accuse(api, data) {
  const options = api.options;
  const poster = api.getUserById(data.user);
  const posterName = poster.profile && poster.profile.first_name || poster.name;
  const highlightName = data.text.match(matcher)[1];
  const name = (highlightName === 'me') ? posterName : highlightName;
  const predicate = 'is';
  if (name.toLowerCase() === 'mr wolf') {
    name = 'I';
    predicate = 'am';
  }
  const response = accusations[accusationCount % accusations.length]
    .replace('{user}', name)
    .replace('{predicate}', predicate);
  const channel = 'random';
  accusationCount++;
  api.respond(channel, response);
}

module.exports = function(api) {
  api.matchers = api.matchers || [];
  api.matchers.push({
    'regex': matcher,
    'handler': accuse,
    'description': 'Matched an accusation'
  });
};
