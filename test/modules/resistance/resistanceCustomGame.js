/* global describe it beforeEach */
const expect = require('chai').expect
const resistance = require('../../../lib/modules/resistance/resistance')
const roles = require('../../../lib/modules/resistance/role')
const mockGamebot = require('../../lib/mockGamebot')
const NL = '\n'

describe('Resistance module (Custom Game Mode)', function () {
  var module, gamebot

  beforeEach(() => {
    gamebot = mockGamebot()
    module = resistance(gamebot, false)
    module.reset()

    gamebot.simulateMessage('join the resistance', 'u1')
    gamebot.simulateMessage('join the resistance', 'u2')
    gamebot.simulateMessage('join game', 'u4')
    gamebot.simulateMessage('join spies', 'u5')
  })

  describe('Custom Game Modes', () => {
    describe('Setting a custom game mode', () => {
      it('should allow custom roles to be set (for a 3 player game)', (done) => {
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal(['Roles have been set to: :bad_guy: Assassin, :good_guy: Body Guard, and :good_guy: Resistance Commander'])
          expect(target).to.equal('resistance')
          expect(module.state.customGame).to.deep.equal({
            roles: [roles.Assassin, roles.Commander, roles.BodyGuard],
            missions: [2, 3, 2, 3, 3],
            twoFailsRequired: false
          })
          done()
        }
        gamebot.simulateMessage(`set roles Assassin, Commander, Body Guard`, 'u5')
      })

      it('should allow custom roles to be set (for a 5 player game)', (done) => {
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal(['Roles have been set to: :bad_guy: Assassin, :bad_guy: Deep Cover, :bad_guy: Spy Reverser, :good_guy: Body Guard, and :good_guy: Resistance Commander'])
          expect(target).to.equal('resistance')
          expect(module.state.customGame).to.deep.equal({
            roles: [roles.Assassin, roles.SpyReverser, roles.DeepCover, roles.Commander, roles.BodyGuard],
            missions: [2, 3, 2, 3, 3],
            twoFailsRequired: false
          })
          done()
        }
        gamebot.simulateMessage(`set roles Assassin, Spy Reverser, Deep Cover, Commander, Body Guard`, 'u5')
      })

      it('should show a banner in game state', (done) => {
        gamebot.simulateMessage(`set roles Assassin, deepCover, Commander, Body Guard`, 'u5')
        gamebot.simulateMessage(`start game`, 'u5')
        module.state.playerOrder = ['u1', 'u4', 'u2', 'u5']
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            '>Custom roles in play: :bad_guy: Assassin, :bad_guy: Deep Cover, :good_guy: Body Guard, and :good_guy: Resistance Commander',
            '>Mission Progress: :2: :3: :2: :3: :3:',
            '>Leader order: *John*, Triela, Henrietta, Rico, and finally *John*'
          ])
          expect(target.user).to.equal('u5')
          expect(module.state.customGame).to.deep.equal({
            roles: [roles.Assassin, roles.DeepCover, roles.Commander, roles.BodyGuard],
            missions: [2, 3, 2, 3, 3],
            twoFailsRequired: false
          })
          done()
        }
        gamebot.simulateMessage(`game state`, 'u5')
      })

      it('should prevent custom roles if named roles are not found', (done) => {
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([`Cannot set custom roles; the following roles were not recognised: Kitty, Lol Cat, and Tiger Man`])
          expect(target).to.equal('resistance')
          expect(module.state.customGame).to.equal(false)
          done()
        }
        gamebot.simulateMessage(`set roles Assassin, Lol Cat, Kitty, Tiger Man, Commander`, 'u5')
      })

      it('should prevent a game starting if there are the wrong number of players', (done) => {
        gamebot.simulateMessage('join the resistance', 'u3')
        gamebot.simulateMessage(`set roles deepcover, commander`, 'u5')
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([`Claus tried to start the game with 5 players, but a custom game mode is configured for 2 players. Use *set roles ...* or *reset roles* to continue.`])
          expect(target).to.equal('resistance')
          done()
        }
        gamebot.simulateMessage('start game', 'u3')
      })
    })

    describe('Resetting a custom game mode', () => {
      it('should indicate if there is no mode to reset', (done) => {
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal(['No custom game roles are set.'])
          expect(target).to.equal('resistance')
          expect(module.state.customGame).to.equal(false)
          done()
        }
        gamebot.simulateMessage(`reset roles`, 'u5')
      })

      it('should allow a custom game mode to be reset', (done) => {
        gamebot.simulateMessage(`set roles Assassin, Commander, Body Guard`, 'u5')
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal(['Game roles have been reset to defaults.'])
          expect(target).to.equal('resistance')
          expect(module.state.customGame).to.equal(false)
          done()
        }
        gamebot.simulateMessage(`reset roles`, 'u5')
      })
    })
  })
})
