const cards = [
  {
    name: 'Princess',
    value: 8,
    count: 1,
    action: 'princess',
    description: `If you hold this card at the end of the round, you win a token of affection from the Princess. If you discard this card, or are forced to discard this card, then you are immediately knocked out of the current round.`,
    requiresTarget: false
  },
  {
    name: 'Countess',
    value: 7,
    count: 1,
    action: 'countess',
    description: `If the countess is caught with either the Prince or the King in your hand, then you must discard this card.`,
    requiresTarget: false
  },
  {
    name: 'King',
    value: 6,
    count: 1,
    action: 'king',
    description: `If you play the king on your turn, choose another player and exchange cards with them.`,
    requiresTarget: true
  },
  {
    name: 'Prince',
    value: 5,
    count: 2,
    action: 'prince',
    description: `If you play the prince on your turn, choose an unprotected player, including yourself, and force that player to discard and draw a new card.`,
    requiresTarget: true
  },
  {
    name: 'Handmaid',
    value: 4,
    count: 2,
    action: 'handmaid',
    description: `If you play a hand maid on your turn, you will be protected from all effects that require a player to be targetted until your next turn.`,
    requiresTarget: true
  },
  {
    name: 'Baron',
    value: 3,
    count: 2,
    action: 'baron',
    description: `If you play a baron on your turn, choose an unprotected player, and force that player to compare their card with you. The player with the lowest value card is knocked out of the round.`,
    requiresTarget: true
  },
  {
    name: 'Priest',
    value: 2,
    count: 2,
    action: 'priest',
    description: `If you play a priest on your turn, choose an unprotected player, that player must reveal their card to you.`,
    requiresTarget: true
  },
  {
    name: 'Guard',
    value: 1,
    count: 5,
    action: 'guard',
    description: `If you play a guard on your turn, choose an unprotected player, then guess which card they have. If you are correct, that player must discard their card and is then knocked out of the round.`,
    requiresTarget: true
  }
]

function index (cards) {
  const result = {}

  cards.forEach((card) => {
    result[card.action] = card
  })

  return result
}

module.exports = {
  list: cards,
  index: index(cards)
}
