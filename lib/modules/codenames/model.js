const words = require('./words')

function reset (model) {
  model.gameChannel = 'codenames'
  model.players = []
  model.teams = [{
    name: 'Blue',
    players: [],
    spymaster: false,
    solitaire: false
  }, {
    name: 'Red',
    players: [],
    spymaster: false,
    solitaire: false
  }]
  model.words = []
  model.started = false
}

function pickWords (model) {
  let result = []
  let list = words()
  while (result.length < 25) {
    let i = Math.floor(Math.random() * list.length)
    let word = list[i]
    list = list.splice(i, 1)
    result.push(word)
  }
  model.words = result
}

function create () {
  let model = {}
  reset(model)
  model.pickWords = () => pickWords(model)
  model.reset = () => reset(model)
  return model
}

module.exports = create
