/* global describe it beforeEach */
const codenames = require('../../../lib/modules/loveletter/loveletter')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const response = expectResponses.createResponse

describe('Loveletter module (2 Player Game)', function () {
  var module, gamebot
  const gameChannel = 'loveletter'

  beforeEach((done) => {
    gamebot = mockGamebot()
    codenames(gamebot, false)
      .then((m) => {
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
        response(/^Love Letter has begun, the player order is:\n(>[A-z]+\n){2}[A-z]+ has the first turn.$/, gameChannel),
        response(/^Hey (John|Henrietta)! Your starting card is [A-Z][A-z]+ \(\d\) and your second card is [A-Z][A-z]+ \(\d\)\. Please take your turn by responding with \*play [A-Z][A-z]+\* or \*play [A-Z][A-z]+\*.$/),
        response(/^Hey (John|Henrietta)! Your starting card is [A-Z][A-z]+ \(\d\)\.$/)
      ], done)
      gamebot.simulateMessage('start game', 'u2')
    })
  })

  describe('Playing a card', () => {
    it('should allow players to play a card on their turn', (done) => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u2')
      gamebot.simulateMessage('start game', 'u2')
      gamebot.respond = expectResponses([
        response(/^You have played Priest \(2\)\. If you play a priest on your turn, choose an unprotected player, that player must reveal their card to you\.$/, gameChannel)
      ], done)
      gamebot.simulateMessage('play Priest', 'u1')
    })
  })
})
