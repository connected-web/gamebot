const matchGameState = /^(game state)$/i

const cards = require('../cards')
const NL = '\n'

function multiply(string, count) {
  const result = []
  while (result.length < count) {
    result.push(string)
  }
  return result
}

function gameState(api, data, model) {
  const gamestate = []

  // Discarded cards, for each player, in the order they were discarded
  model.playerHands.forEach((playerHand) => {
    const discardedCards = playerHand.discardedCards.map(cards.displayCard)
    gamestate.push(`>*${api.getUserName(playerHand.player)}* : ${discardedCards.join(', ')}`)
  })

  // The tally of victory tokens
  const zeroes = model.playerHands.map(hand => hand.player).reduce((acc, item) => {
    acc[item] = 0
    return acc
  }, {})

  const scores = model.winners.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1
    return acc
  }, zeroes)

  const displayScores = []
  Object.keys(scores).forEach((player) => {
    const score = scores[player]
    const hearts = score
      ? multiply(':heart:', score)
      : [':broken_heart:']
    displayScores.push(`*${api.getUserName(player)}* : ${hearts.join(' ')}`)
  })
  gamestate.push(`>Scores at ${model.winners.length} : ${displayScores.join(', ')} :princess: :kissing_heart:`)

  // The name of the current player
  const currentPlayer = model.currentPlayer()
  if (currentPlayer) {
    gamestate.push(`>The current player is *${api.getUserName(currentPlayer)}*`)
  } else {
    gamestate.push(`>To start the next round, respond with *start game*.`)
  }

  // The number of cards left in deck
  gamestate.push(`>There are ${model.deck.length} cards left in the deck.`)

  api.respond(model.gameChannel, gamestate.join(NL))
}

module.exports = {
  name: 'Game State',
  regex: matchGameState,
  description: `View the current state of the game, including who's turn it is, who's playing, and which cards have been played.`,
  examples: ['game state'],
  handler: (model) => {
    return (api, data) => gameState(api, data, model)
  }
}
