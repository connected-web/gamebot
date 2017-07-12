/* global describe it beforeEach */
const expect = require('chai').expect
const resistance = require('../../../lib/modules/resistance/resistance')
const mockGamebot = require('../../lib/mockGamebot')
const NL = '\n'

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
          expect(response).to.include(`Thank you Claus, your mission action has been completed.`)
          expect(target).to.equal('u3')
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Claus has completed their mission action.`)
        },
        (target, response, params) => {
          expect(response).to.include(`Thank you John, your mission action has been completed.`)
          expect(target).to.equal('u1')
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`John has completed their mission action.`)
        },
        (target, response, params) => {
          expect(target).to.equal('u2')
          expect(response).to.include(`Thank you Henrietta, your mission action has been completed.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Henrietta has completed their mission action.`)
        },
        (target, response, params) => {
          expect(response).to.include(`Triela you are the leader. Mission 3 requires 2 players. Pick a team using *pick Name1, Name2, ...*`)
          expect(target).to.equal('u4')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `All mission actions have been completed; the results are as follows:`,
            `>Success (1) :success:`,
            `>Fail (1) :fail:`,
            `>Reverse (1) :reverse:`,
            'Overall mission status: Resistance :good_guy: victory',
            `Mission Progress: :skip: :good_guy: :2: :3: :3:`,
            'The leader token moves to *Triela*. Mission 3 requires 2 players. Pick a team using *pick Name1, Name2, ...*'
          ])
          expect(target).to.equal('resistance')
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`play success`, 'u2')
      gamebot.simulateMessage(`play fail`, 'u1')
      gamebot.simulateMessage(`play reverse`, 'u3')
    })

    it('should prevent players from playing an illegal fail when they are not a spy, or are a reverser', (done) => {
      gamebot.simulateMessage(`start game`, 'u0', 'resistance')
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
          expect(response).to.include(`Thank you Henrietta, your mission action has been completed.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Henrietta has completed their mission action.`)
        },
        (target, response, params) => {
          expect(response).to.include(`Triela you are the leader. Mission 3 requires 2 players. Pick a team using *pick Name1, Name2, ...*`)
          expect(target).to.equal('u4')
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response.split(NL)).to.deep.equal([
            `All mission actions have been completed; the results are as follows:`,
            `>Fail (1) :fail:`,
            `>Reverse (2) :reverse: :reverse:`,
            'Overall mission status: Spies :bad_guy: victory',
            `Mission Progress: :skip: :bad_guy: :2: :3: :3:`,
            `The leader token moves to *Triela*. Mission 3 requires 2 players. Pick a team using *pick Name1, Name2, ...*`
          ])
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
