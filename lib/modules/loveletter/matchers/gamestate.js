const matchGameState = /^(game state)$/i

const cards = require('../cards')
const NL = '\n'

function multiply (string, count) {
  const result = []
  while (result.length < count) {
    result.push(string)
  }
  return result
}

function gameState (api, data, model) {
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

  const scores = model.winners.reduce((acc, player) => {
    acc[player] = (acc[player] || 0) + 1
    return acc
  }, zeroes)

  const displayScores = []
  Object.keys(scores).sort((a, b) => {
    return scores[a] < scores[b] ? 1 : -1
  }).forEach((player) => {
    const score = scores[player]
    const hearts = score
      ? multiply(':love_letter:', score)
      : [':mailbox_with_no_mail:']
    displayScores.push(`*${api.getUserName(player)}* : ${hearts.join(' ')}`)
  })
  gamestate.push(`>Scores at Round ${model.winners.length} : ${displayScores.join(', ')} :princess: :kissing_heart:`)

  // The name of the current player
  const currentPlayer = model.currentPlayer
  const playersLeftInGame = model.playerHands.filter((pc) => pc.cards.length)
  if (currentPlayer && playersLeftInGame.length > 1) {
    gamestate.push(`>Waiting for *${api.getUserName(currentPlayer)}* to take their turn.`)
  } else {
    gamestate.push(`>The round is over. To start the next round, respond with *start next round*.`)
  }

  // The number of cards left in deck
  gamestate.push(`>There are ${model.deck.length} cards left in the deck.`)

  api.respond(data, gamestate.join(NL))
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
