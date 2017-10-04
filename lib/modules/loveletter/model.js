const path = require('path')
const { read, write } = require('promise-path')
const statePath = path.join(process.cwd(), 'state/loveletter-state.json')
const cards = require('./cards')

function reset (model) {
  model.gameChannel = 'loveletter'
  model.players = []
  model.playerCards = []
  model.deck = []
  model.cardOutOfTheGame = false
  model.started = false
  model.gameOver = false
}

function getActiveCard(model){
  const activePlayer = model.currentPlayer()
  const playerCard = model.getPlayerCardFor(activePlayer)
  const cardId =  playerCard.activeCard
  return cards.index[cardId]
}

function getValidTargets (model) {
  const activeCard = model.getActiveCard()
  const currentPlayer = model.currentPlayer()
  const validTargets = model.playerCards
    .filter((pc) => !pc.protected)
    .filter((pc) => pc.player !== currentPlayer)

  if (activeCard.mayTargetSelf) {
    const currentPlayerCard = model.getPlayerCardFor(currentPlayer)
    validTargets.push(currentPlayerCard)
  }

  return validTargets
}

function getPlayerCardFor (model, playerId) {
  return model.playerCards.filter((pc) => pc.player === playerId)[0]
}

function currentPlayer (model) {
  return model.playerCards[0].player || false
}

function assignPlayerOrder (model) {
  const list = [].concat(model.players)
  while (list.length > 0) {
    let i = Math.floor(Math.random() * list.length)
    let player = list[i]
    list.splice(i, 1)
    model.playerCards.push({
      player,
      cards: []
    })
  }
}

function createDeck (model) {
  const deck = []
  cards.list.forEach((card) => {
    let i = 0
    while (i < card.count) {
      deck.push(card.action)
      i++
    }
  })

  const shuffledDeck = []
  while (deck.length > 0) {
    let index = Math.floor(Math.random() * deck.length)
    let card = deck[index]
    deck.splice(index, 1)
    shuffledDeck.push(card)
  }

  model.deck = shuffledDeck
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
      model.createDeck = () => createDeck(model)
      model.assignPlayerOrder = () => assignPlayerOrder(model)
      model.getCard = (action) => cards.index[action]
      model.getPlayerCardFor = (playerId) => getPlayerCardFor(model, playerId)
      model.getValidTargets = () => getValidTargets(model)
      model.getActiveCard = () => getActiveCard(model)
      model.reset = () => reset(model)
      model.save = () => saveModel(model)
      model.read = () => readModel(model)
      return model
    })
}

module.exports = create
