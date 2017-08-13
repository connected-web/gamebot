const path = require('path')
const write = require('promise-path').write
const read = require('promise-path').read
const words = require('./words')
const statePath = path.join(process.cwd(), 'state/codenames-state.json')

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
  model.clues = []
  model.started = false
  model.turnCounter = 0
  model.gameOver = false
}

function activeSpymaster (model) {
  return model.activeTeam().spymaster
}

function activeTeam (model) {
  return (model.teams[model.turnCounter % model.teams.length])
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

function findRemainingWords (model, teamName) {
  return model.words.filter((location) => location.team === teamName.toLowerCase() && !location.revealed)
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

function saveModel (model) {
  const contents = JSON.stringify(model, null, 2)
  return write(statePath, contents, 'utf8')
}

function readModel (model) {
  return read(statePath, 'utf8')
    .then(JSON.parse)
    .then((data) => {
      Object.keys(data).forEach((key) => {
        model[key] = data[key]
      })
      return model
    })
    .catch((ex) => {
      console.error('Unable to read codenames state', ex)
      console.error(ex.stack)
    })
}

function create () {
  let model = {}
  reset(model)

  return readModel(model)
    .then((model) => {
      model.pickWords = () => pickWords(model)
      model.reset = () => reset(model)
      model.activeSpymaster = () => activeSpymaster(model)
      model.activeTeam = () => activeTeam(model)
      model.findRemainingWords = (teamName) => findRemainingWords(model, teamName)
      model.save = () => saveModel(model)
      model.read = () => readModel(model)
      return model
    })
}

module.exports = create
