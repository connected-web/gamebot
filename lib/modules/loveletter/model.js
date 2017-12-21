const path = require('path')
const { read, write } = require('promise-path')
const statePath = path.join(process.cwd(), 'state/loveletter-state.json')
const cards = require('./cards')

function reset (model) {
  model.gameChannel = 'loveletter'
  model.players = []
  model.playerHands = []
  model.deck = []
  model.cardOutOfTheGame = false
  model.started = false
  model.roundOver = false
  model.winners = []
  model.currentPlayer = false
}

function getActiveCard (model) {
  const activePlayer = model.currentPlayer
  const playerHand = model.getPlayerHandFor(activePlayer)
  const cardId = playerHand.activeCard
  return cards.index[cardId]
}

function getValidTargets (model) {
  const activeCard = model.getActiveCard()
  const currentPlayer = model.currentPlayer
  const currentPlayerHand = model.getPlayerHandFor(currentPlayer)
  const validTargets = model.playerHands
    .filter((pc) => !pc.protected)
    .filter((pc) => pc.player !== currentPlayer)
    .filter((pc) => pc.cards.length)

  if (activeCard.mayTargetSelf) {
    validTargets.push(currentPlayerHand)
  }

  if (validTargets.length === 0) {
    validTargets.push(currentPlayerHand)
  }

  console.log('Valid targets: ', validTargets)

  return validTargets
}

function getPlayerHandFor (model, player) {
  return model.playerHands.filter((ph) => ph.player === player)[0]
}

function activePlayers (model) {
  return model.playerHands.filter(playerHand => playerHand.cards.length > 0)
}

function nextPlayer (model) {
  // Make a list of active players, but also include the current player
  const activePlayers = model.playerHands.filter(playerHand => playerHand.cards.length > 0 || playerHand.player === model.currentPlayer).map(ph => ph.player)
  if (!model.currentPlayer && activePlayers.length) {
    return activePlayers[0]
  }

  // Find the position of the current player
  const playerPosition = activePlayers.indexOf(model.currentPlayer)
  if (playerPosition === -1) {
    // Player not found in game
    return false
  }

  // Return the next player around, looping to the start if necessary
  return activePlayers[(playerPosition + 1) % activePlayers.length]
}

function getLastWinner (model) {
  if (model.winners.length > 0) {
    return model.winners[model.winners.length - 1]
  }
  return false
}

function assignPlayerOrder (model) {
  let list = [].concat(model.players)

  const lastWinner = getLastWinner(model)
  const theWinnerIsStillPlaying = list.includes(lastWinner)

  if (theWinnerIsStillPlaying) {
    const part1 = list.slice(list.indexOf(lastWinner))
    const part2 = list.slice(0, list.indexOf(lastWinner))
    list = [].concat(part1, part2)
  }

  while (list.length > 0) {
    let player = list.shift()
    model.playerHands.push({
      player,
      cards: [],
      discardedCards: []
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
      model.nextPlayer = () => nextPlayer(model)
      model.activePlayers = () => activePlayers(model)
      model.createDeck = () => createDeck(model)
      model.assignPlayerOrder = () => assignPlayerOrder(model)
      model.getCard = (action) => cards.index[action]
      model.getPlayerHandFor = (playerId) => getPlayerHandFor(model, playerId)
      model.getValidTargets = () => getValidTargets(model)
      model.getActiveCard = () => getActiveCard(model)
      model.reset = () => reset(model)
      model.save = () => saveModel(model)
      model.read = () => readModel(model)
      return model
    })
}

module.exports = create
