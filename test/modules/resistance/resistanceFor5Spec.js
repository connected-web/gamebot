/* global describe it beforeEach */
const expect = require('chai').expect
const resistance = require('../../../lib/modules/resistance/resistance')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const NL = '\n'

describe('Resistance module (5 player)', function () {
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

  describe('Role Assignment', () => {
    it('should assign a player order at the start of a game', (done) => {
      gamebot.respond = (target, response, params) => {}
      gamebot.simulateMessage('start resistance', 'u0')
      expect(module.state.playerOrder).to.contain('u5')
      expect(module.state.playerOrder).to.contain('u4')
      expect(module.state.playerOrder).to.contain('u3')
      expect(module.state.playerOrder).to.contain('u2')
      expect(module.state.playerOrder).to.contain('u1')
      expect(module.state.playerOrder.length).to.equal(5)
      expect(module.state.turnCounter).to.equal(0)
      done()
    })

    it('should assign roles at the start of a game', (done) => {
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      }, {
        victoriousTeam: ':skip:'
      })

      const expectedResponses = [{
        message: [
          /[A-z\s]+ has started the game; all players will shortly receive their roles./,
          /Player order is: ([A-z]+,?)+\. \*([A-z]+)\* is the first leader\. First mission requires 2 players. Pick a team using \*pick Name1, Name 2, ...\*/
        ],
        channel: 'resistance'
      },
      {
        message: [
          /Congratulations ([A-z]+) \(Citizen u\d\) you have been assigned the role of :bad_guy: Assassin fighting for the Spies. May only/
        ]
      },
      {
        message: [
          /The following players are known to you as spies:\n>:bad_guy: [A-z]+\n>:bad_guy: [A-z]+$/
        ]
      },
      {
        message: [
          /Congratulations ([A-z]+) \(Citizen u\d\) you have been assigned the role of :bad_guy: Hidden Spy Reverser fighting for the Spies. May only/
        ]
      },
      {
        message: [
          /The following players are known to you as spies:\n>:bad_guy: [A-z]+\n>:bad_guy: [A-z]+$/
        ]
      },
      {
        message: [
          /Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :good_guy: Resistance Commander fighting for the Resistance\. May only/
        ]
      },
      {
        message: [
          /^The following players are known to you as spies:\n>:bad_guy: [A-z]+$/
        ]
      },
      {
        message: [
          /Congratulations ([A-z]+) \(Citizen u\d\) you have been assigned the role of :good_guy: Resistance Reverser fighting for the Resistance\. May only/
        ]
      },
      {
        message: [
          /Congratulations ([A-z]+) \(Citizen u\d\) you have been assigned the role of :good_guy: Generic Resistance fighting for the Resistance\. May only/
        ]
      },
      {
        message: [
          /[A-z]+ you are the leader\. Mission 3 requires 2 players\. Pick a team using \*pick Name1, Name2, \.\.\.\*/
        ]
      }
      ]

      gamebot.respond = expectResponses(expectedResponses, done)

      gamebot.simulateMessage('start resistance', 'u0')
    })

    it('should assign roles at the start of a game', (done) => {
      const expectedResponses = [{
        message: [
          /Non Player has started the game; all players will shortly receive their roles./,
          /Player order is: [A-z]+, [A-z]+, [A-z]+, [A-z]+, then [A-z]+\. \*[A-z]+\* is the first leader\. First mission requires 2 players\. Pick a team using \*pick Name1, Name 2, \.\.\.\*/
        ],
        channel: 'resistance'
      },
      {
        message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :good_guy: Resistance Commander fighting for the Resistance. May only/]
      },
      {
        message: [
          /The following players are known to you as spies:\n>:bad_guy: [A-z]+$/
        ]
      },
      {
        message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :good_guy: Resistance Reverser fighting for the Resistance. May only/]
      },
      {
        message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :good_guy: Generic Resistance fighting for the Resistance. May only/]
      },
      {
        message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :bad_guy: Assassin fighting for the Spies. May only/]
      },
      {
        message: [
          /The following players are known to you as spies:/,
          />:bad_guy: [A-z]+\n>:bad_guy: [A-z]+$/
        ]
      },
      {
        message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :bad_guy: Hidden Spy Reverser fighting for the Spies. May only/]
      },
      {
        message: [
          /The following players are known to you as spies:/,
          />:bad_guy: [A-z]+\n>:bad_guy: [A-z]+$/
        ]
      },
      {
        message: [/[A-z]+ you are the leader\. Mission 1 requires 2 players\. Pick a team using \*pick Name1, Name2, \.\.\.\*/]
      }
      ]

      gamebot.respond = expectResponses(expectedResponses, done)

      gamebot.simulateMessage('start resistance', 'u0')
    })

    it('should only assign the role of assassin to the assassin if there is an assassin present', () => {
      gamebot.simulateMessage('start resistance', 'u0')
      let badGuys = Object.keys(module.state.roles)
        .map((id) => module.state.roles[id])
        .filter((role) => role.team.name === 'Spies')

      badGuys.forEach((role) => {
        if (role.name !== 'Assassin' && role.assassin === true) {
          throw new Error(`Did not expect ${role.name} to be marked as an assassin in this configuration`)
        }
      })
    })
  })

  describe('Voting on Picks', (done) => {
    it('should allow players to vote on a valid pick', (done) => {
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico`, 'u1')

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(response).to.include(`John has voted, 4 players remaining.`)
          expect(target).to.equal('resistance')
        },
        (target, response, params) => {
          expect(response).to.include(`Henrietta has voted, 3 players remaining.`)
          expect(target).to.equal('resistance')
        },
        (target, response, params) => {
          expect(response).to.include(`Claus has voted, 2 players remaining.`)
          expect(target).to.equal('resistance')
        },
        (target, response, params) => {
          expect(response).to.include(`Triela has voted, 1 players remaining.`)
          expect(target).to.equal('resistance')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `Rico has voted.`,
            `Mission Approved! 4 votes (Henrietta, *Claus*, Triela, *Rico*), 1 rejects (*John*).`,
            `Players Claus, John, and Rico have been assigned to the current mission; awaiting their responses.`
          ])
          expect(target).to.equal('resistance')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `You are on an approved mission with John, and Rico.`,
            `Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.`
          ])
          expect(target).to.equal('u3')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `You are on an approved mission with Claus, and Rico.`,
            `Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.`
          ])
          expect(target).to.equal('u1')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `You are on an approved mission with Claus, and John.`,
            `Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.`
          ])
          expect(target).to.equal('u5')
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
    });

    ['lol no', 'Lol, no', 'lol. no.'].forEach((message) => {
      it(`should allow players to vote using "${message}"`, (done) => {
        gamebot.simulateMessage(`pick Claus, John`, 'u1')
        // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
        var expectedResponses = [
          (target, response, params) => {
            expect(response).to.include(`John has voted, 4 players remaining.`)
            expect(target).to.equal('resistance')
            done()
          }
        ]
        gamebot.respond = (target, response, params) => {
          var expectation = expectedResponses.shift();
          (expectation) ? expectation(target, response, params) : done(response)
        }
        gamebot.simulateMessage(`${message}`, 'u1')
      })
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
      gamebot.simulateMessage('start resistance', 'u0')
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      module.state.playerOrder = ['u1', 'u2', 'u3', 'u4', 'u5']
      gamebot.simulateMessage(`pick Claus, John, Rico`, 'u1')
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `Rico has voted.`,
            `Mission Approved! 4 votes (Henrietta, *Claus*, Triela, *Rico*), 1 rejects (*John*).`,
            `Players Claus, John, and Rico have been assigned to the current mission; awaiting their responses.`
          ])
          expect(target).to.equal('resistance')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `You are on an approved mission with John, and Rico.`,
            `Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.`
          ])
          expect(target).to.equal('u3')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `You are on an approved mission with Claus, and Rico.`,
            `Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.`
          ])
          expect(target).to.equal('u1')
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `You are on an approved mission with Claus, and John.`,
            `Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.`
          ])
          expect(target).to.equal('u5')
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`vote accept`, 'u5')
    })

    it('should allow players to change their pick', (done) => {
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, Rico, Henrietta`, 'u1')
      gamebot.respond = (target, response, params) => {
        expect(response).to.include('John has voted, 4 players remaining.')
        expect(module.state.votes.u1).to.equal('reject')
        gamebot.respond = (target, response, params) => {
          expect(response).to.include('John has resubmitted their vote, 4 players remaining.')
          expect(module.state.votes.u1).to.equal('accept')
          done()
        }
      }
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u1')
    })

    it('should prevent players to changing their pick once a pick has been approved', (done) => {
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick John, Rico, Henrietta`, 'u1')
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote accept`, 'u2')
      gamebot.simulateMessage(`vote accept`, 'u3')
      gamebot.simulateMessage(`vote accept`, 'u4')
      gamebot.simulateMessage(`vote accept`, 'u5')

      gamebot.respond = (target, response, params) => {
        expect(response).to.include('Unable to accept your vote, the current mission has already been approved.')
        expect(module.state.votes.u1).to.not.equal('accept')
        done()
      }
      gamebot.simulateMessage(`vote accept`, 'u1')
    })
  })

  describe('Failing a mission by being unable to reach consensus', () => {
    it('should allow players to reject 5 missions in a row', (done) => {
      gamebot.simulateMessage(`resistance start`, 'u1')
      module.state.playerOrder = ['u1', 'u4', 'u2', 'u5', 'u3']
      // First pick
      gamebot.simulateMessage(`pick John, Henrietta`, 'u1')
      gamebot.simulateMessage(`vote reject`, 'u2')
      gamebot.simulateMessage(`vote reject`, 'u3')
      gamebot.simulateMessage(`vote reject`, 'u4')
      gamebot.simulateMessage(`vote reject`, 'u5')
      gamebot.respond = (target, response, params) => {
        expect(response).to.match(/[A-z]+ you are the leader\. Mission 1 requires 2 players. Pick a team using \*pick Name1, Name2, \.\.\.\*/)
        expect(target).to.match(/u\d/)
        gamebot.respond = (target, response, params) => {
          expect(response).to.match(/[A-z]+ has voted\.\nMission Rejected! :x: 1 votes \(\*?[A-z]+\*?\), 4 rejects \(\*?[A-z]+\*?, \*?[A-z]+\*?, \*?[A-z]+\*?, \*?[A-z]+\*?\)\.\nThe leader token moves to \*[A-z]+\*. Mission 1 requires 2 players\. Pick a team using \*pick Name1, Name2, \.\.\.\*/)
          expect(module.state.voteHistory[0]).to.deep.equal([{
            'leader': 'u1',
            'picks': [
              'u1',
              'u2'
            ],
            'votes': {
              'u1': 'accept',
              'u2': 'reject',
              'u3': 'reject',
              'u4': 'reject',
              'u5': 'reject'
            }
          }])
        }
      }
      gamebot.simulateMessage(`vote accept`, 'u1')

      // Second pick
      gamebot.respond = (target, response, params) => {
        expect(response).to.include('Triela has picked *Claus*, and *Triela* to go on the next mission.')
      }
      gamebot.simulateMessage(`pick Triela, Claus`, 'u4')

      gamebot.respond = () => {}
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote reject`, 'u2')
      gamebot.simulateMessage(`vote reject`, 'u3')
      gamebot.simulateMessage(`vote reject`, 'u5')
      gamebot.respond = (target, response, params) => {
        expect(response).to.equal('Henrietta you are the leader. Mission 1 requires 2 players. Pick a team using *pick Name1, Name2, ...*')
        expect(target).to.equal('u2')
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'Triela has voted.',
            'Mission Rejected! :x: :x: 1 votes (*Triela*), 4 rejects (John, Henrietta, *Claus*, Rico).',
            'The leader token moves to *Henrietta*. Mission 1 requires 2 players. Pick a team using *pick Name1, Name2, ...*'
          ])
        }
      }
      gamebot.simulateMessage(`vote accept`, 'u4')

      // Third pick
      gamebot.respond = (target, response, params) => {
        expect(response).to.include('Henrietta has picked *Henrietta*, and *Rico* to go on the next mission.')
      }
      gamebot.simulateMessage(`pick Henrietta, Rico`, 'u2')

      gamebot.respond = () => {}
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote reject`, 'u3')
      gamebot.simulateMessage(`vote reject`, 'u4')
      gamebot.simulateMessage(`vote reject`, 'u5')
      gamebot.respond = (target, response, params) => {
        expect(response).to.equal('Rico you are the leader. Mission 1 requires 2 players. Pick a team using *pick Name1, Name2, ...*')
        expect(target).to.equal('u5')
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'Henrietta has voted.',
            'Mission Rejected! :x: :x: :x: 1 votes (*Henrietta*), 4 rejects (John, Claus, Triela, *Rico*).',
            'The leader token moves to *Rico*. Mission 1 requires 2 players. Pick a team using *pick Name1, Name2, ...*'
          ])
        }
      }
      gamebot.simulateMessage(`vote accept`, 'u2')

      // Fourth pick
      gamebot.respond = (target, response, params) => {
        expect(response).to.include('Rico has picked *Rico*, and *Triela* to go on the next mission.')
      }
      gamebot.simulateMessage(`pick Triela, Rico`, 'u5')

      gamebot.respond = () => {}
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote reject`, 'u2')
      gamebot.simulateMessage(`vote reject`, 'u3')
      gamebot.simulateMessage(`vote reject`, 'u4')
      gamebot.respond = (target, response, params) => {
        expect(response).to.equal('Claus you are the leader. Mission 1 requires 2 players. Pick a team using *pick Name1, Name2, ...*')
        expect(target).to.equal('u3')
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'Rico has voted.',
            'Mission Rejected! :x: :x: :x: :x: 1 votes (*Rico*), 4 rejects (John, Henrietta, Claus, *Triela*).',
            'The leader token moves to *Claus*. Mission 1 requires 2 players. Pick a team using *pick Name1, Name2, ...*'
          ])
        }
      }
      gamebot.simulateMessage(`vote accept`, 'u5')

      // Fifth pick
      gamebot.respond = (target, response, params) => {
        expect(response).to.include('Claus has picked *Claus*, and *Henrietta* to go on the next mission.')
      }
      gamebot.simulateMessage(`pick Claus, Henrietta`, 'u3')

      gamebot.respond = () => {}
      gamebot.simulateMessage(`vote reject`, 'u1')
      gamebot.simulateMessage(`vote reject`, 'u2')
      gamebot.simulateMessage(`vote reject`, 'u4')
      gamebot.simulateMessage(`vote reject`, 'u5')
      gamebot.respond = (target, response, params) => {
        expect(response).to.equal('John you are the leader. Mission 2 requires 3 players. Pick a team using *pick Name1, Name2, ...*')
        expect(target).to.equal('u1')
        gamebot.respond = (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'Claus has voted.',
            'Mission Rejected! :x: :x: :x: :x: :x: 1 votes (*Claus*), 4 rejects (John, *Henrietta*, Triela, Rico).',
            `Failed to reach consensus : overall mission status Spies :bad_guy: victory`,
            `Mission Progress: :bad_guy: :3: :2: :3: :3:`,
            `The leader token moves to *John*. Mission 2 requires 3 players. Pick a team using *pick Name1, Name2, ...*`
          ])
        }
        expect(module.state.missionHistory).to.deep.equal([{
          'failedToReachConsensus': true,
          'playResults': {},
          'success': false,
          'victoriousTeam': {
            'logo': ':bad_guy:',
            'name': 'Spies'
          }
        }])
        done()
      }
      gamebot.simulateMessage(`vote accept`, 'u3')
    })
  })

  describe('Playing cards onto a mission', () => {
    it('should allow players to succeed a 3 player mission with a fail and a reverse', (done) => {
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
      gamebot.simulateMessage(`play success`, 'u3')
      gamebot.simulateMessage(`play fail`, 'u1')
      gamebot.simulateMessage(`play reverse`, 'u2')
    })

    it('should allow players to fail a 3 player mission with two reverses and a fail', (done) => {
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
      gamebot.simulateMessage(`play reverse`, 'u2')
    })

    it('should allow players to fail a 3 player mission with a single reverse', (done) => {
      gamebot.simulateMessage(`start resistance`, 'u0', 'resistance')
      module.state.playerOrder = ['u1', 'u4', 'u2', 'u5', 'u3']
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico`, 'u1')
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
          expect(response).to.include(`Triela you are the leader. Mission 3 requires 2 players. Pick a team using *pick Name1, Name2, ...*`)
          expect(target).to.equal('u4')
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response.split(NL)).to.deep.equal([
            `All mission actions have been completed; the results are as follows:`,
            `>Success (2) :success: :success:`,
            `>Reverse (1) :reverse:`,
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
      gamebot.simulateMessage(`play success`, 'u5')
    })

    it('should allow players to fail a 3 player mission with two fails', (done) => {
      gamebot.simulateMessage(`start resistance`, 'u0', 'resistance')
      module.state.playerOrder = ['u1', 'u4', 'u2', 'u5', 'u3']
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico`, 'u1')
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
          expect(response).to.include(`Triela you are the leader. Mission 3 requires 2 players. Pick a team using *pick Name1, Name2, ...*`)
          expect(target).to.equal('u4')
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response.split(NL)).to.deep.equal([
            `All mission actions have been completed; the results are as follows:`,
            `>Success (1) :success:`,
            `>Fail (2) :fail: :fail:`,
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
      gamebot.simulateMessage(`play success`, 'u5')
    })

    it('should allow players to succeed a 3 player mission with three successes', (done) => {
      gamebot.simulateMessage(`start resistance`, 'u0', 'resistance')
      module.state.playerOrder = ['u1', 'u4', 'u2', 'u5', 'u3']
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })
      gamebot.simulateMessage(`pick Claus, John, Rico`, 'u1')
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
          expect(response).to.include(`Triela you are the leader. Mission 3 requires 2 players. Pick a team using *pick Name1, Name2, ...*`)
          expect(target).to.equal('u4')
        },
        (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response.split(NL)).to.deep.equal([
            `All mission actions have been completed; the results are as follows:`,
            `>Success (3) :success: :success: :success:`,
            'Overall mission status: Resistance :good_guy: victory',
            `Mission Progress: :skip: :good_guy: :2: :3: :3:`,
            `The leader token moves to *Triela*. Mission 3 requires 2 players. Pick a team using *pick Name1, Name2, ...*`
          ])
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
