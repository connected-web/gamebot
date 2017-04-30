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
    list.splice(i, 1)
    result.push({
      word
    })
  }

  result = assignTeams(result)

  model.words = result
}

function assignTeams (words) {
  let blueWords = []
  let redWords = []
  let assassinWords = []
  let neutralWords = []

  while (blueWords.length < 9) {
    let i = Math.floor(Math.random() * words.length)
    let word = words[i]
    blueWords.push(word)
    word.team = 'blue'
    words.splice(i, 1)
  }

  while (redWords.length < 8) {
    let i = Math.floor(Math.random() * words.length)
    let word = words[i]
    redWords.push(word)
    word.team = 'red'
    words.splice(i, 1)
  }

  while (assassinWords.length < 1) {
    let i = Math.floor(Math.random() * words.length)
    let word = words[i]
    assassinWords.push(word)
    word.team = 'assassin'
    words.splice(i, 1)
  }

  while (words.length > 0) {
    let word = words.pop()
    neutralWords.push(word)
    word.team = 'neutral'
  }

  return [].concat(blueWords, redWords, assassinWords, neutralWords).sort((a, b) => {
    return a.word.localeCompare(b.word, 'en', {
      'sensitivity': 'base'
    })
  })
}

function create () {
  let model = {}
  reset(model)
  model.pickWords = () => pickWords(model)
  model.reset = () => reset(model)
  return model
}

module.exports = create
