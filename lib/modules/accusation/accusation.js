/* global module */
const accusations = [
  '{user} {predicate} plays for the red team',
  '{user} {predicate} a panda',
  '{user} {predicate} the commander iguana',
  '{user} {predicate} literally hitler',
  '{user} {predicate} a lamp',
  '{user} {predicate} reads like book, if that book was Mein Kampf',
  '{user} {predicate} playing like a unicorn',
  '{user} {predicate} a facist',
  '{user} {predicate} liberal',
  '{user} {predicate} love', '{user} {predicate} a reverser',
  '{user} {predicate} is roarsome',
  '{user} {predicate} is the princess',
  '{user} {predicate} has been sleeping with the prince'
]

// Randomise starting accusation
var matcher = /[Aa]ccuse ([A-z]+( [A-z]+)?)/

// Process the accusation
function accuse (api, data) {
  const posterName = api.getUserName(data.user)
  const highlightName = data.text.match(matcher)[1]
  var name = (highlightName === 'me') ? posterName : highlightName
  var predicate = 'is'
  if (name.toLowerCase() === 'mr wolf') {
    name = 'I'
    predicate = 'am'
  }
  const accusationNumber = Math.floor(Math.random() * accusations.length)
  const response = accusations[accusationNumber % accusations.length]
    .replace('{user}', name)
    .replace('{predicate}', predicate)
  api.respond(data, response)
}

module.exports = function (api) {
  api.matchers = api.matchers || []
  api.matchers.push({
    'regex': matcher,
    'handler': accuse,
    'description': 'Matched an accusation'
  })
}
