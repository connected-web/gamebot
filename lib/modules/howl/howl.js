const write = require('promise-path').write

// Howl responses
const howls = ['Howwwwll~', 'Aawwwwooooh!', 'Snarl.', 'Growll', '*Pants*', 'Woof?', '{user} {predicate} a werewolf...']
const statePath = process.cwd() + '/state/howl-state.json'

// Randomise starting howl
var howlCount = 0
var matcher = /(woof|wolf|wolve)/i
var responses = []

// Store data for external viewing
function saveState () {
  const data = {
    howlCount,
    matcher: matcher + '',
    howls,
    responses
  }

  const contents = JSON.stringify(data, null, 2)
  write(statePath, contents, 'utf8')
}

// Process the howl
function woof (api, data) {
  let name = api.getUserName(data.user)
  let predicate = 'is'
  if (name.toLowerCase() === 'mr wolf') {
    name = 'I'
    predicate = 'am'
  }
  howlCount = howlCount || 0
  const response = howls[howlCount % howls.length].replace('{user}', name)
    .replace('{user}', name)
    .replace('{predicate}', predicate)
  howlCount++
  api.respond(data, response)

  responses.push({
    user: data.user,
    channel: data.channel,
    response
  })

  saveState()
}

function howl (api, data) {
  const name = api.getUserName(data.user)
  if (name) {
    api.respond(data, `${name}~ ${data.text}`)
  }
}

module.exports = function (api) {
  api.matchers = api.matchers || []
  api.matchers.push({
    regex: matcher,
    handler: woof,
    description: 'Matched a woof'
  }, {
    regex: /ho+w+l+/i,
    handler: howl,
    description: 'Matched a howl'
  })

  const options = api.options || {}
  howlCount = options.howl && (options.howl.seed || Math.floor(Math.random() * howls.length))
}
