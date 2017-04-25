/* global describe it beforeEach */
const codenames = require('../../../lib/modules/codenames/codenames')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const response = expectResponses.createResponse

describe('Codenames module (2 Player Game)', function () {
  var module, gamebot
  const gameChannel = 'codenames'

  beforeEach(() => {
    gamebot = mockGamebot()
    module = codenames(gamebot, false)
    module.reset()
  })

  describe('Starting a two-player game', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u7')
    })

    it('should allow an active player to start a two player game', (done) => {
      gamebot.respond = expectResponses([
        response(/^Codenames has begun, teams are:\n>Team Blue: Hannah, and John\n>Team Red: Solitaire Mode\nChoose a spy master for your team by saying "make me spy master"$/, gameChannel)
      ], done)
      gamebot.simulateMessage('start game', 'u7')
    })

    it('should allow an active player to set themselves as spy master for their team', (done) => {
      gamebot.simulateMessage('start game', 'u7')
      gamebot.respond = expectResponses([
        response(/^Hannah you are now a spy master$/, 'private'),
        response(/^Hannah has been assigned as a spy master for Team Blue$/, gameChannel)
      ], done)
      gamebot.simulateMessage('make me spymaster', 'u7')
    })
  })
})
