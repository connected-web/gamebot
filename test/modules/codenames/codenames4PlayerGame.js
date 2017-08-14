/* global describe it beforeEach */
const codenames = require('../../../lib/modules/codenames/codenames')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const response = expectResponses.createResponse

describe('Codenames module (4 Player Game)', function () {
  var module, gamebot
  const gameChannel = 'codenames'

  beforeEach((done) => {
    gamebot = mockGamebot()
    codenames(gamebot, false)
      .then((m) => {
        module = m
        module.reset()
        done()
      })
  })

  describe('Starting a four-player game', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u2')
      gamebot.simulateMessage('join game', 'u3')
      gamebot.simulateMessage('join game', 'u7')
    })

    it('should allow an active player to start a two player game', (done) => {
      gamebot.respond = expectResponses([
        response(/^Codenames has begun, teams are:\n>Team Blue: [A-z]+, and [A-z]+\n>Team Red: [A-z]+, and [A-z]+\nChoose a spy master for your team by saying "make me spy master"$/, gameChannel)
      ], done)
      gamebot.simulateMessage('start game', 'u7')
    })
  })
})
