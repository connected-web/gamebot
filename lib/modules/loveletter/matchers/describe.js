const grammarList = require('grammarlist')
const cards = require('../cards')

function describe (api, data, model) {
  const searchCard = data.text.match(module.exports.regex)[1].trim().toLowerCase()
  const card = cards.findCard(searchCard)

  if (card) {
    describeCard(api, data, card)
  } else {
    const cardChoices = ([].concat(cards.list)).sort((a, b) => a.value - b.value).forEach(card => describeCard(api, data, card))
  }
}

const number = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

function describeCard(api, data, card) {
  if (card.count === 1) {
    api.respond(data, `>There is ${number[card.count]} ${cards.displayCard(card)} card in the game. ${card.description}`)
  } else {
    api.respond(data, `>There are ${number[card.count]} ${cards.displayCard(card)} cards in the game. ${card.description}`)
  }
}

module.exports = {
  name: 'Describe Card',
  regex: /^describe ([A-z\d]+)/i,
  description: 'Describe all cards, or a specific card by name, or number',
  examples: ['describe cards', 'describe prince', 'describe 8'],
  handler: (model) => {
    return (api, data) => describe(api, data, model)
  }
}
