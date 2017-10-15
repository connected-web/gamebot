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
        response(/^Hey \*(John|Henrietta)\*! Your starting cards are \*_[A-Z][A-z]+ \(\d\)_\*, and \*_[A-Z][A-z]+ \(\d\)_\*\. Please take your turn by responding with \*play [A-Z][A-z]+\* or \*play [A-Z][A-z]+\*.$/),
        response(/^Hey \*(John|Henrietta)\*! Your starting card is \*_[A-Z][A-z]+ \(\d\)_\*\. \*(John|Henrietta)\* is the first player.$/)
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
      const playerHand = module.model.playerHands.filter((pc) => pc.player === currentPlayer)[0]
      playerHand.cards = ['prince', 'priest']
      gamebot.respond = expectResponses([
        response(/^(John|Henrietta) has played a \*_[A-z]+ \(\d\)_\*\./, gameChannel),
        response(/^Please choose a player to target by responding with \*target Henrietta\*, or \*target John\*/, currentPlayer)
      ], done)
      gamebot.simulateMessage(`play ${playerHand.cards[0]}`, currentPlayer)
    })

    it('should prevent players from playing a card who are not in the game', (done) => {
      gamebot.respond = expectResponses([response(/^Unable to play card, you are not part of this game\.$/, 'u3')], done)
      gamebot.simulateMessage('play King', 'u3')
    })

    it('should prevent players from playing a card when it is not their turn', (done) => {
      const currentPlayer = module.model.currentPlayer()
      const notCurrentPlayer = module.model.players.filter((player) => player !== currentPlayer)[0]
      gamebot.respond = expectResponses([response(/^Unable to play card, you are not the current player. Waiting for [A-z]+ to take their turn\.$/, notCurrentPlayer)], done)
      gamebot.simulateMessage('play King', notCurrentPlayer)
    })

    it('should prevent players from playing an invalid card name', (done) => {
      const currentPlayer = module.model.currentPlayer()
      gamebot.respond = expectResponses([response(/^Unable to play card, _[A-z]+_ is not a valid card\.$/, currentPlayer)], done)
      gamebot.simulateMessage('play Kingy', currentPlayer)
    })

    it(`should prevent players from playing a valid card they don't have`, (done) => {
      const currentPlayer = module.model.currentPlayer()
      const playerHand = module.model.playerHands.filter((pc) => pc.player === currentPlayer)[0]
      const notPlayerHand = ['guard', 'priest', 'baron', 'handmaid', 'prince', 'king', 'countess', 'princess'].filter((card) => !playerHand.cards.includes(card))[0]

      gamebot.respond = expectResponses([response(/^Unable to play card, you do not have a _[A-z]+_ card in your hand\.$/, currentPlayer)], done)
      gamebot.simulateMessage(`play ${notPlayerHand}`, currentPlayer)
    })

    it('should prevent players playing a second card on their turn', (done) => {
      const currentPlayer = module.model.currentPlayer()
      const playerHand = module.model.playerHands.filter((pc) => pc.player === currentPlayer)[0]

      gamebot.simulateMessage(`play ${playerHand.cards[0]}`, currentPlayer)
      gamebot.respond = expectResponses([response(/^Unable to play card, you have already played _[A-z]+_ this turn. Please a target a player using \*target playerName\*\.$/, currentPlayer)], done)
      gamebot.simulateMessage(`play ${playerHand.cards[0]}`, currentPlayer)
    })
  })

  describe('Targetting a player', () => {
    it('should be possible to target a player, when playing a guard', (done) => {
      done()
    })

    it('should be possible to target a player, when playing a priest', (done) => {
      done()
    })

    it('should not be possible to target a player if they are protected by a handmaid', (done) => {
      done()
    })

    it('should not be possible for a player to target themselves when playing a baron', (done) => {
      done()
    })
  })
})
