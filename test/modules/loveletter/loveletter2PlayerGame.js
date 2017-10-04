/* global describe it beforeEach */
const codenames = require('../../../lib/modules/loveletter/loveletter')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const response = expectResponses.createResponse

describe('Loveletter module (2 Player Game)', function () {
  var module,
    gamebot
  const gameChannel = 'loveletter'

  beforeEach((done) => {
    gamebot = mockGamebot()
    codenames(gamebot, false).then((m) => {
      module = m
      module.reset()
      done()
    })
  })

  describe('Starting a game', () => {
    it('should allow players to start a game', (done) => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u2')
      gamebot.respond = expectResponses([
        response(/^Love Letter has begun, the player order is:\n(>[A-z]+\n){2}<@u\d> has the first turn.$/, gameChannel),
        response(/^Hey (John|Henrietta)! Your starting card is [A-Z][A-z]+ \(\d\) and your second card is [A-Z][A-z]+ \(\d\)\. Please take your turn by responding with \*play [A-Z][A-z]+\* or \*play [A-Z][A-z]+\*.$/),
        response(/^Hey (John|Henrietta)! Your starting card is [A-Z][A-z]+ \(\d\)\.$/)
      ], done)
      gamebot.simulateMessage('start game', 'u2')
    })
  })

  describe('Playing a card', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u2')
      gamebot.simulateMessage('start game', 'u2')
    })

    it('should allow players to play a card on their turn', (done) => {
      const currentPlayer = module.model.currentPlayer()
      const playerCard = module.model.playerCards.filter((pc) => pc.player === currentPlayer)[0]
      gamebot.respond = expectResponses([
        response(/^You have played [A-z]+ \(\d\)\. If.../, gameChannel),
        response(/^Please choose a player to target by responding with \*target _Name_\*/, currentPlayer)
      ], done)
      gamebot.simulateMessage(`play ${playerCard.cards[0]}`, currentPlayer)
    })

    it('should prevent players from playing a card who are not in the game', (done) => {
      gamebot.respond = expectResponses([response(/^Unable to play card, you are not part of this game\.$/, 'u3')], done)
      gamebot.simulateMessage('play King', 'u3')
    })

    it('should prevent players from playing an invalid card name', (done) => {
      const currentPlayer = module.model.currentPlayer()
      gamebot.respond = expectResponses([response(/^Unable to play card, _[A-z]+_ is not a valid card\.$/, currentPlayer)], done)
      gamebot.simulateMessage('play Kingy', currentPlayer)
    })

    it(`should prevent players from playing a valid card they don't have`, (done) => {
      const currentPlayer = module.model.currentPlayer()
      const playerCard = module.model.playerCards.filter((pc) => pc.player === currentPlayer)[0]
      const notPlayerCard = ['guard', 'priest', 'baron', 'handmaid', 'prince', 'king', 'countess', 'princess'].filter((card) => !playerCard.cards.includes(card))[0]

      gamebot.respond = expectResponses([response(/^Unable to play card, you do not have a _[A-z]+_ card in your hand\.$/, currentPlayer)], done)
      gamebot.simulateMessage(`play ${notPlayerCard}`, currentPlayer)
    })

    it('should prevent players playing a second card on their turn', (done) => {
      const currentPlayer = module.model.currentPlayer()
      const playerCard = module.model.playerCards.filter((pc) => pc.player === currentPlayer)[0]

      gamebot.simulateMessage(`play ${playerCard.cards[0]}`, currentPlayer)
      gamebot.respond = expectResponses([response(/^Unable to play card, you have already played _[A-z]+_ this turn. Please a target a player using \*target playerName\*\.$/, currentPlayer)], done)
      gamebot.simulateMessage(`play ${playerCard.cards[0]}`, currentPlayer)
    })
  })
})
