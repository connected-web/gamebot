const path = require('path')
const { read, write } = require('promise-path')
const statePath = path.join(process.cwd(), 'state/loveletter-state.json')

function reset (model) {
  model.gameChannel = 'loveletter'
  model.players = []
  model.playerHands = []
  model.deck = []
  model.cardOutOfTheGame = false
  model.playerHands = []
  model.started = false
  model.gameOver = false
}

function currentPlayer (model) {
  return model.playerHands[0] || false
}

function assignPlayerOrder (model) {
  const list = [].concat(model.players)
  while (list.length > 0) {
    let i = Math.floor(Math.random() * list.length)
    let player = list[i]
    list.splice(i, 1)
    model.playerHands.push({
      player,
      cards: []
    })
  }
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
      console.error('Unable to read loveletter state', ex)
      console.error(ex.stack)
    })
}

function create () {
  let model = {}
  reset(model)

  return readModel(model)
    .then((model) => {
      model.currentPlayer = () => currentPlayer(model)
      model.assignPlayerOrder = () => assignPlayerOrder(model)
      model.reset = () => reset(model)
      model.save = () => saveModel(model)
      model.read = () => readModel(model)
      return model
    })
}

module.exports = create
