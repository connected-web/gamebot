/* global module */
const accusations = [
  '{user} {predicate} on the red team',
  '{user} {predicate} a panda',
  '{user} revealed the location of the commander',
  '{user} {predicate} literally hitler',
  '{user} {predicate} a lamp',
  '{user} read{s} like book, if that book was Mein Kampf',
  '{user} play{s} like a unicorn',
  '{user} {predicate} a facist',
  '{user} {predicate} a liberal',
  '{user} love{s} casting spells to summon Cthulhu',
  '{user} {predicate} a reverser',
  '{user} {predicate} roarsome',
  '{user} {predicate} secretly visiting the princess',
  '{user} {predicate} dating the prince',
  '{user} like{s} tickling puppies'
]

// Randomise starting accusation
var matcher = /[Aa]ccuse ([A-z]+( [A-z]+)?)/

// Process the accusation
function accuse (api, data) {
  const posterName = api.getUserName(data.user)
  const highlightName = data.text.match(matcher)[1]
  var name = (highlightName === 'me') ? posterName : highlightName
  var predicate = 'is'
  var plural = 's'
  if (name.toLowerCase() === 'mr wolf') {
    name = 'I'
    predicate = 'am'
    plural = ''
  }
  const accusationNumber = Math.floor(Math.random() * accusations.length)
  const response = accusations[accusationNumber % accusations.length]
    .replace('{user}', name)
    .replace('{predicate}', predicate)
    .replace('{s}', plural)
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
