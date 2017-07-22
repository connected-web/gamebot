/* global describe it beforeEach */
const expect = require('chai').expect
const resistance = require('../../../lib/modules/resistance/resistance')
const role = require('../../../lib/modules/resistance/role')
const mockGamebot = require('../../lib/mockGamebot')

describe('Resistance Invalid Plays', function () {
  var module, gamebot

  beforeEach(() => {
    gamebot = mockGamebot()
    module = resistance(gamebot, false)
    module.reset()

    gamebot.simulateMessage('join the resistance', 'u1')
    gamebot.simulateMessage('join the resistance', 'u2')
    gamebot.simulateMessage('join the resistance', 'u3')
    gamebot.simulateMessage('join the resistance', 'u4')
    gamebot.simulateMessage('join the resistance', 'u5')
  })

  describe('Playing cards onto a mission', () => {
    it('should prevent players from playing a reverse when they are not a reverser', (done) => {
      gamebot.simulateMessage(`resistance start`, 'u1')
      module.state.playerOrder = ['u1', 'u4', 'u2', 'u5', 'u3']
      module.state.roles.u3 = role.GenericResistance
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Henrietta`, 'u1')
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')
      gamebot.simulateMessage(`vote accept`, 'u5')

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u3')
          expect(response).to.include(`It is illegal for your role to play 'reverse', please make a valid choice.`)
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`play reverse`, 'u3')
    })

    it('should prevent players from playing an illegal fail when they are not a spy, or are a reverser', (done) => {
      gamebot.simulateMessage(`start game`, 'u0', 'resistance')
      module.state.roles.u2 = role.GenericResistance
      module.state.playerOrder = ['u1', 'u4', 'u2', 'u5', 'u3']
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, Rico, Henrietta`, 'u1')
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')
      gamebot.simulateMessage(`vote accept`, 'u5')
      gamebot.simulateMessage(`vote reject`, 'u6')
      gamebot.simulateMessage(`play fail`, 'u3')
      gamebot.simulateMessage(`play reverse`, 'u5')

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u2')
          expect(response).to.include(`It is illegal for your role to play 'fail', please make a valid choice.`)
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`play fail`, 'u2')
    })
  })
})
