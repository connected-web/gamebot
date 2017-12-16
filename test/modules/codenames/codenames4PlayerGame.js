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

    it('should allow an active player to start a four player game', (done) => {
      gamebot.respond = expectResponses([
        response(/^Codenames has begun, teams are:\n>:(red|blue): (Red|Blue) Team: [A-z]+, and [A-z]+\n>:(red|blue): (Red|Blue) Team: [A-z]+, and [A-z]+\nChoose a spy master for your team by saying "make me spy master"$/, gameChannel)
      ], done)
      gamebot.simulateMessage('start game', 'u7')
    })

    it('should announce messages after picking spy masters', (done) => {
      gamebot.simulateMessage('start game', 'u7')
      // override player selection to remove randomness
      module.model.teams[0].players = ['u1', 'u3']
      module.model.teams[1].players = ['u2', 'u7']

      gamebot.respond = expectResponses([
        response(/^John you are now a spy master$/, 'u1'),
        response(/^John has been assigned as a spy master for Team (Red|Blue)$/, gameChannel),
        response(/^Henrietta you are now a spy master$/, 'u2'),
        response(/^Henrietta has been assigned as a spy master for Team (Red|Blue)$/, gameChannel),
        response(/^Starting locations have been identified:(\n>:unclaimed:\s[A-z\s]+){25}\n:(blue|red): (Red|Blue) Team goes first. Spymaster ([A-z]+) has been notified to make the first pick.$/, gameChannel),
        response(/^Locations have been identified:(\n>:assassin: [A-z\s]+)(\n>:(blue|red): [A-z\s]+){17}(\n>:neutral: [A-z\s]+){7}$/, 'u1'),
        response(/^(John|Henrietta) your operatives are now active\. Give a one word clue, followed by a number; for example: \*flying 3\* to match 3 words relating to flying\. Say \*help clues\* for more information\./),
        response(/^Locations have been identified:(\n>:assassin: [A-z\s]+)(\n>:(blue|red): [A-z\s]+){17}(\n>:neutral: [A-z\s]+){7}$/, 'u2')
      ], done)
      gamebot.simulateMessage('make me spy master', 'u1')
      gamebot.simulateMessage('make me spy master', 'u2')
    })
  })
})
