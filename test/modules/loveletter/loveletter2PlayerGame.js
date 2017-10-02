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
        response(/^Your starting card is [A-z]+\.$/, 'u1'),
        response(/^Your starting card is [A-z]+\.$/, 'u2')
      ], done)
      gamebot.simulateMessage('start game', 'u2')
    })
  })
})
