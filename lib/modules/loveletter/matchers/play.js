const cards = require('../cards')

function playCard (api, data, model) {
  const cardName = data.text.match(module.exports.regex)[1].trim().toLowerCase()
  const cardDetails = cards.index[cardName]
  if (cardDetails) {
    api.respond(model.gameChannel, `You have played ${cardDetails.name} (${cardDetails.value}). ${cardDetails.description}`)
  }
}

module.exports = {
  name: 'Play card',
  regex: /^play,?\s([A-z\s]+)/i,
  description: 'Allows the current player to play a card on their turn',
  examples: ['play guard', 'play king'],
  handler: (model) => {
    return (api, data) => playCard(api, data, model)
  }
}
