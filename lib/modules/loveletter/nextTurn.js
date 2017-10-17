const cards = require('./cards')
const grammarList = require('grammarList')

function cardValue (playerHand) {
  return cards.findCard(playerHand.cards[0]).value
}

function sort (a, b) {
  if (a.sortnumber < b.sortnumber) return -1
  else if (a.sortnumber > b.sortnumber) return 1
  return 0
}

function displayFinalCards ({ api, model, winners }) {
  function displayFinalCard (playerHand) {
    const card = cards.findCard(playerHand.cards[0])
    return `${api.getUserName(playerHand.player)} had a ${cards.displayCard(card)}`
  }

  api.respond(model.gameChannel, `The final cards for each player are: ${grammarList(winners.map(displayFinalCard))}`)
}

function roundOver ({ api, model }) {
  if (model.cardOutOfTheGame) {
    const cardOutOfTheGame = cards.findCard(model.cardOutOfTheGame)
    api.respond(model.gameChannel, `The card out of the game was ${cards.displayCard(cardOutOfTheGame)}.`)
  } else {
    api.respond(model.gameChannel, `The card out of the game was drawn on the final round.`)
  }
}

function nextTurn ({ api, model }) {
  model.turn++

  const activePlayers = model.activePlayers()

  if (activePlayers.length === 1) {
    const winner = activePlayers[0].player
    api.respond(model.gameChannel, `${api.getUserName(winner)} has won the round! They have successfully delivered a love letter to the Princess via the ${cards.displayCard(activePlayers[0].cards[0])}, and received a token of her affection.`)
    model.winners.push(winner)
    roundOver({ api, model })
  } else if (model.deck.length === 0) {
    api.respond(model.gameChannel, `There are no more courtiers accessible, the player with access to the courtier closest to the Princess will have their love letter delivered to the Princess.`)
    const scoringPlayers = model.activePlayers().sort((a, b) => {
      let valueA = cardValue(a)
      let valueB = cardValue(b)
      return sort(valueA, valueB)
    })
    const topScore = cardValue(scoringPlayers[0])
    const winners = scoringPlayers.filter(playerHand => cardValue(playerHand) === topScore)
    if (winners.length === 1) {
      api.respond(model.gameChannel, `${api.getUserName(winners[0].player)} has won the round! They have successfully delivered a love letter to the Princess and received a token of her affection.`)
      model.winners.push(winners[0].player)
    } else {
      api.respond(model.gameChannel, `No one player had the highest courtier, the Princess has refused to give out a token of affection.`)
    }
    displayFinalCards({ api, model, scoringPlayers })
    roundOver({ api, model })
  } else {
    const nextPlayer = model.currentPlayer()
    const nextPlayerHand = model.getPlayerHandFor(nextPlayer)

    nextPlayerHand.protected = false

    api.respond(model.gameChannel, `It is now ${api.getUserName(nextPlayer)}'s turn.`)
    const nextCard = model.deck.pop()
    nextPlayerHand.cards.push(nextCard)
    const startingCard = nextPlayerHand.cards[0]
    const secondCard = nextPlayerHand.cards[1]
    api.respond(nextPlayer, [
      `You have drawn a ${cards.displayCard(secondCard)}`,
      ` to go with your ${cards.displayCard(startingCard)}.`,
      ` Please take your turn by responding with *play ${cards.findCard(startingCard).name}* or *play ${cards.findCard(secondCard).name}*.`
    ].join(''))
  }
}

module.exports = nextTurn
