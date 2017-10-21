const grammarList = require('grammarlist')
const cards = require('../cards')

function describe (api, data, model) {
  const searchCard = data.text.match(module.exports.regex)[1].trim().toLowerCase()
  const card = cards.findCard(searchCard)

  if (card) {
    if (card.count === 1) {
      api.respond(data, `There is ${card.count}x ${cards.displayCard(card)} card in the game. ${card.description}`)
    } else {
      api.respond(data, `There are ${card.count}x ${cards.displayCard(card)} cards in the game. ${card.description}`)
    }
  } else {
    const cardChoices = ([].concat(cards.list)).sort((a, b) => a.value - b.value).map(card => `*describe ${card.name}*`)
    api.respond(data, `No card with the name ${searchCard} could be found, try: ${grammarList(cardChoices, 'or', false)}`)
  }
}

module.exports = {
  name: 'Describe Card',
  regex: /^describe ([A-z\d]+)/i,
  description: 'Describe a specific card by name',
  examples: ['describe guard', 'describe priest', 'describe baron', 'describe handmaid', 'describe prince', 'describe king', 'describe countess', 'describe princess'],
  handler: (model) => {
    return (api, data) => describe(api, data, model)
  }
}
