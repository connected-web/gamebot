const accusations = [
  '{user} {predicate} a spy', '{user} {predicate} innocent', '{user} {predicate} the commander',
  '{user} {predicate} the body guard', '{user} {predicate} the assassin', '{user} {predicate} a commander',
  '{user} {predicate} playing like a blind spy', '{user} {predicate} evil', '{user} {predicate} good',
  '{user} {predicate} an accuser', '{user} {predicate} a reverser', '{user} {predicate} clearly a defector'
];

// Randomise starting accusation
var matcher = /[Aa]ccuse ([A-z]+( [A-z]+)?)/;

// Process the accusation
function accuse(api, data) {
  const options = api.options;
  const posterName = api.getUserName(data.user);
  const highlightName = data.text.match(matcher)[1];
  var name = (highlightName === 'me') ? posterName : highlightName;
  var predicate = 'is';
  if (name.toLowerCase() === 'mr wolf') {
    name = 'I';
    predicate = 'am';
  }
  const accusationNumber = Math.floor(Math.random() * accusations.length);
  const response = accusations[accusationNumber % accusations.length]
    .replace('{user}', name)
    .replace('{predicate}', predicate);
  api.respond(data, response);
}

module.exports = function (api) {
  api.matchers = api.matchers || [];
  api.matchers.push({
    'regex': matcher,
    'handler': accuse,
    'description': 'Matched an accusation'
  });
};
