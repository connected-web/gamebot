/* global describe it beforeEach */
const expect = require('chai').expect
const resistance = require('../../../lib/modules/resistance/resistance')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const NL = '\n'

describe('Resistance module (6 player)', function () {
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
    gamebot.simulateMessage('join the resistance', 'u6')
  })

  describe('Role Assignment', () => {
    for (let i = 0; i < 10; i++) {
      it(`should assign roles at the start of a game (${i})`, (done) => {
        const expectedResponses = [{
          message: [
            /Non Player has started the game; all players will shortly receive their roles\./,
            /Player order is: [A-z]+, [A-z]+, [A-z]+, [A-z]+, [A-z]+, then [A-z]+\. \*[A-z]+\* is the first leader. First mission requires 2 players\. Pick a team using \*pick Name1, Name 2, \.\.\.\*/
          ],
          channel: 'resistance'
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :good_guy: Resistance Reverser fighting for the Resistance\. May only/]
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :good_guy: Generic Resistance fighting for the Resistance\. May only/]
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :bad_guy: False Commander fighting for the Spies\. May only/]
        },
        {
          message: [
            /^The following players are known to you as spies:/,
            />:bad_guy: [A-z]+\n>:bad_guy: [A-z]+$/
          ]
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :bad_guy: Spy Reverser fighting for the Spies\. May only/]
        },
        {
          message: [
            /The following players are known to you as spies:/,
            />:bad_guy: [A-z]+\n>:bad_guy: [A-z]+$/
          ]
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :good_guy: Resistance Commander fighting for the Resistance\. May only/]
        },
        {
          message: [
            /^The following players are known to you as spies:/,
            />:bad_guy: [A-z]+\n>:bad_guy: [A-z]+$/
          ]
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :good_guy: Body Guard fighting for the Resistance\. May only/]
        },
        {
          message: [
            /^The following players are known to you as commanders:/,
            />:bad_guy: \? :good_guy: [A-z]\n>:bad_guy: \? :good_guy: [A-z]$/
          ]
        },
        {
          message: [/[A-z]+ you are the leader\. Mission 1 requires 2 players\. Pick a team using \*pick Name1, Name2, ...\*/]
        }
        ]

        gamebot.respond = expectResponses(expectedResponses, done)

        gamebot.simulateMessage('start resistance', 'u0')
      })
    }

    it('should assign the role of assassin to all bad guys if there are no assassins', () => {
      gamebot.simulateMessage('start resistance', 'u0')
      let badGuys = Object.keys(module.state.roles)
        .map((id) => module.state.roles[id])
        .filter((role) => role.team.name === 'Spies')

      badGuys.forEach((role) => {
        if (role.assassin !== true) {
          throw new Error(`Expected ${role.name} to be an assassin in this configuration`)
        }
      })
    })
  })

  describe('Voting on Picks', (done) => {
    it('should allow players to vote on a valid pick', (done) => {
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      }, {
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico, Henrietta`, 'u6')

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`John has voted, 5 players remaining.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Henrietta has voted, 4 players remaining.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Claus has voted, 3 players remaining.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Triela has voted, 2 players remaining.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Rico has voted, 1 players remaining.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response.split(NL)).to.deep.equal([
            `Angelica has voted.`,
            `Mission Approved! 4 votes (*Henrietta*, *Claus*, Triela, *Rico*), 2 rejects (*John*, Angelica).`,
            `Players Claus, Henrietta, John, and Rico have been assigned to the current mission; awaiting their responses.`
          ])
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'You are on an approved mission with Henrietta, John, and Rico.',
            'Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.'
          ])
          expect(target).to.equal('u3')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'You are on an approved mission with Claus, Henrietta, and Rico.',
            'Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.'
          ])
          expect(target).to.equal('u1')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'You are on an approved mission with Claus, Henrietta, and John.',
            'Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.'
          ])
          expect(target).to.equal('u5')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'You are on an approved mission with Claus, John, and Rico.',
            'Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.'
          ])
          expect(target).to.equal('u2')
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')
      gamebot.simulateMessage(`vote accept`, 'u5')
      gamebot.simulateMessage(`vote reject`, 'u6')
    })

    it('should prevent players to voting before a pick has been made', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u3')
        expect(response).to.include(`Unable to accept your vote, no valid pick has been made yet.`)
        done()
      }
      gamebot.simulateMessage(`vote accept`, 'u3')
    })
  })

  describe('Notifications to players on a mission', () => {
    it('should allow players to vote on a valid pick', (done) => {
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico`, 'u6')
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')
      gamebot.simulateMessage(`vote accept`, 'u5')

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response.split(NL)).to.deep.equal([
            `Angelica has voted.`,
            `Mission Approved! 4 votes (Henrietta, *Claus*, Triela, *Rico*), 2 rejects (*John*, Angelica).`,
            `Players Claus, John, and Rico have been assigned to the current mission; awaiting their responses.`
          ])
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'You are on an approved mission with John, and Rico.',
            'Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.'
          ])
          expect(target).to.equal('u3')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'You are on an approved mission with Claus, and Rico.',
            'Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.'
          ])
          expect(target).to.equal('u1')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'You are on an approved mission with Claus, and John.',
            'Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.'
          ])
          expect(target).to.equal('u5')
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`vote reject`, 'u6')
    })
  })

  describe('Playing cards onto a mission', () => {
    it('should allow players to succeed a 4 player mission with a fail and a reverse', (done) => {
      gamebot.simulateMessage(`start resistance`, 'u0', 'resistance')
      module.state.playerOrder = ['u6', 'u5', 'u3', 'u4', 'u1', 'u2']
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      }, {
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico, Henrietta`, 'u6')
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')
      gamebot.simulateMessage(`vote accept`, 'u5')
      gamebot.simulateMessage(`vote reject`, 'u6')

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u3')
          expect(response).to.include(`Thank you Claus, your mission action has been completed.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Claus has completed their mission action.`)
        },
        (target, response, params) => {
          expect(target).to.equal('u1')
          expect(response).to.include(`Thank you John, your mission action has been completed.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`John has completed their mission action.`)
        },
        (target, response, params) => {
          expect(target).to.equal('u5')
          expect(response).to.include(`Thank you Rico, your mission action has been completed.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Rico has completed their mission action.`)
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
          expect(response).to.equal('Rico you are the leader. Mission 4 requires 3 players. Pick a team using *pick Name1, Name2, ...*')
          expect(target).to.equal('u5')
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response.split(NL)).to.deep.equal([
            `All mission actions have been completed; the results are as follows:`,
            `>Success (2) :success: :success:`,
            `>Fail (1) :fail:`,
            `>Reverse (1) :reverse:`,
            'Overall mission status: Resistance :good_guy: victory',
            `Mission Progress: :skip: :skip: :good_guy: :3: :4:`,
            `The leader token moves to *Rico*. Mission 4 requires 3 players. Pick a team using *pick Name1, Name2, ...*`
          ])
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`play success`, 'u3')
      gamebot.simulateMessage(`play fail`, 'u1')
      gamebot.simulateMessage(`play reverse`, 'u5')
      gamebot.simulateMessage(`play success`, 'u2')
    })

    it('should allow players to fail a 4 player mission with two reverses and a fail', (done) => {
      gamebot.simulateMessage(`start resistance`, 'u0', 'resistance')
      module.state.playerOrder = ['u6', 'u5', 'u3', 'u4', 'u1', 'u2']
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      }, {
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico, Henrietta`, 'u6')
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')
      gamebot.simulateMessage(`vote accept`, 'u5')
      gamebot.simulateMessage(`vote reject`, 'u6')
      gamebot.simulateMessage(`play success`, 'u3')
      gamebot.simulateMessage(`play fail`, 'u1')
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
          expect(response).to.equal(`Rico you are the leader. Mission 4 requires 3 players. Pick a team using *pick Name1, Name2, ...*`)
          expect(target).to.equal('u5')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `All mission actions have been completed; the results are as follows:`,
            `>Success (1) :success:`,
            `>Fail (1) :fail:`,
            `>Reverse (2) :reverse: :reverse:`,
            'Overall mission status: Spies :bad_guy: victory',
            `Mission Progress: :skip: :skip: :bad_guy: :3: :4:`,
            `The leader token moves to *Rico*. Mission 4 requires 3 players. Pick a team using *pick Name1, Name2, ...*`
          ])
          expect(target).to.equal('resistance')
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`play reverse`, 'u2')
    })

    it('should allow players to fail a 3 player mission with a single reverse', (done) => {
      gamebot.simulateMessage(`start resistance`, 'u0', 'resistance')
      module.state.playerOrder = ['u6', 'u5', 'u3', 'u4', 'u1', 'u2']
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico`, 'u6')
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')
      gamebot.simulateMessage(`vote accept`, 'u5')
      gamebot.simulateMessage(`vote reject`, 'u6')
      gamebot.simulateMessage(`play success`, 'u3')
      gamebot.simulateMessage(`play reverse`, 'u1')

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u5')
          expect(response).to.include(`Thank you Rico, your mission action has been completed.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Rico has completed their mission action.`)
        },
        (target, response, params) => {
          expect(response).to.equal(`Rico you are the leader. Mission 3 requires 4 players. Pick a team using *pick Name1, Name2, ...*`)
          expect(target).to.equal('u5')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `All mission actions have been completed; the results are as follows:`,
            `>Success (2) :success: :success:`,
            `>Reverse (1) :reverse:`,
            'Overall mission status: Spies :bad_guy: victory',
            `Mission Progress: :skip: :bad_guy: :4: :3: :4:`,
            `The leader token moves to *Rico*. Mission 3 requires 4 players. Pick a team using *pick Name1, Name2, ...*`
          ])
          expect(target).to.equal('resistance')
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`play success`, 'u5')
    })

    it('should allow players to fail a 3 player mission with two fails', (done) => {
      gamebot.simulateMessage(`start resistance`, 'u0', 'resistance')
      module.state.playerOrder = ['u6', 'u5', 'u3', 'u4', 'u1', 'u2']
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico`, 'u6')
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')
      gamebot.simulateMessage(`vote accept`, 'u5')
      gamebot.simulateMessage(`vote reject`, 'u6')
      gamebot.simulateMessage(`play fail`, 'u3')
      gamebot.simulateMessage(`play fail`, 'u1')

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u5')
          expect(response).to.include(`Thank you Rico, your mission action has been completed.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Rico has completed their mission action.`)
        },
        (target, response, params) => {
          expect(response).to.equal(`Rico you are the leader. Mission 3 requires 4 players. Pick a team using *pick Name1, Name2, ...*`)
          expect(target).to.equal('u5')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `All mission actions have been completed; the results are as follows:`,
            `>Success (1) :success:`,
            `>Fail (2) :fail: :fail:`,
            'Overall mission status: Spies :bad_guy: victory',
            `Mission Progress: :skip: :bad_guy: :4: :3: :4:`,
            `The leader token moves to *Rico*. Mission 3 requires 4 players. Pick a team using *pick Name1, Name2, ...*`
          ])
          expect(target).to.equal('resistance')
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`play success`, 'u5')
    })

    it('should allow players to succeed a 3 player mission with three successes', (done) => {
      gamebot.simulateMessage(`start resistance`, 'u0', 'resistance')
      module.state.playerOrder = ['u6', 'u5', 'u3', 'u4', 'u1', 'u2']
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico`, 'u6')
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')
      gamebot.simulateMessage(`vote accept`, 'u5')
      gamebot.simulateMessage(`vote reject`, 'u6')
      gamebot.simulateMessage(`play success`, 'u3')
      gamebot.simulateMessage(`play success`, 'u1')

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u5')
          expect(response).to.include(`Thank you Rico, your mission action has been completed.`)
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include(`Rico has completed their mission action.`)
        },
        (target, response, params) => {
          expect(response).to.include(`Rico you are the leader. Mission 3 requires 4 players. Pick a team using *pick Name1, Name2, ...*`)
          expect(target).to.equal('u5')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `All mission actions have been completed; the results are as follows:`,
            `>Success (3) :success: :success: :success:`,
            'Overall mission status: Resistance :good_guy: victory',
            `Mission Progress: :skip: :good_guy: :4: :3: :4:`,
            `The leader token moves to *Rico*. Mission 3 requires 4 players. Pick a team using *pick Name1, Name2, ...*`
          ])
          expect(target).to.equal('resistance')
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`play success`, 'u5')
    })
  })
})
