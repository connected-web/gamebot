/* global describe it beforeEach */
const expect = require('chai').expect
const resistance = require('../../../lib/modules/resistance/resistance')
const role = require('../../../lib/modules/resistance/role')
const mockGamebot = require('../../lib/mockGamebot')
const NL = '\n'

describe('Resistance module (Core)', function () {
  var module, gamebot
  const gameChannel = 'resistance'

  beforeEach(() => {
    gamebot = mockGamebot()
    module = resistance(gamebot, false)
    module.reset()
  })

  describe('Stop and Reset', () => {
    it('should respond to players wanting to stop the current game', (done) => {
      gamebot.respond = (channel, response, params) => {
        expect(channel).to.equal('resistance')
        expect(response).to.equal('Non Player has stopped the game; all players have been executed.')
        done()
      }
      gamebot.simulateMessage('stop resistance', 'u0')
    })

    it('should allow players to reset the game without losing players', (done) => {
      // Add users
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u3')
      gamebot.respond = (channel, response, params) => {
        expect(channel).to.equal('resistance')
        expect(response).to.equal('Non Player has reset the game. Current players are Claus, Henrietta, and John.')
        done()
      }
      gamebot.simulateMessage('reset resistance', 'u0')
    })

    it('should allow players to reset the game without any players', (done) => {
      // Add users
      gamebot.respond = (channel, response, params) => {
        expect(channel).to.equal('resistance')
        expect(response).to.equal('Non Player has reset the game. No players have registered to play.')
        done()
      }
      gamebot.simulateMessage('reset resistance', 'u0')
    })
  })

  describe('Leaving and Joining', () => {
    ['join resistance', 'join the resistance', 'join spies'].forEach((joinMessage) => {
      it(`should respond to players wanting to join using "${joinMessage}"`, (done) => {
        // Listen for specific responses
        gamebot.respond = (channel, response, params) => {
          expect(response).to.equal([`Welcome to the Resistance John.`, `Your assigned code is u1.`, 'Please await further instructions from command.'].join(NL))
          gamebot.respond = (channel, response, params) => {
            expect(response).to.equal(`John has joined the resistance. There are now 1 players.`)
            done()
          }
        }
        // Add the user
        gamebot.simulateMessage(joinMessage, 'u1')
      })
    })

    it('should respond to players who have already joined', (done) => {
      // Add the user
      gamebot.simulateMessage('join the resistance', 'u2')
      // Then start listening
      gamebot.respond = (channel, response, params) => {
        expect(response).to.equal(`Friend Henrietta, you are already part of the Resistance. Your assigned code is u2.`)
        done()
      }
      // Join a second time
      gamebot.simulateMessage('join the resistance', 'u2')
    })

    it('should respond to players who want to leave', (done) => {
      // Add users
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u3')
      // Then start listening
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal(gameChannel)
        expect(response).to.equal(`Goodbye comrade Henrietta, until next time.`)
        gamebot.respond = (channel, response, params) => {
          expect(channel).to.equal('resistance')
          expect(response).to.equal('Henrietta has left the resistance. There are now 2 players.')
          done()
        }
      }
      // Remove user
      gamebot.simulateMessage('leave the resistance', 'u2', gameChannel)
    })
  })

  describe('List Players', () => {
    it('should be able respond with an empty list of players', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal(gameChannel)
        expect(response).to.equal(`No one is currently registered to play resistance.`)
        done()
      }
      gamebot.simulateMessage(`Who's playing resistance?`, 'u1', gameChannel)
    })

    it('should be able respond with a list of players', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal(gameChannel)
        expect(response).to.equal(`The current list of players is: Henrietta, and John`)
        done()
      }
      gamebot.simulateMessage(`Who is playing?`, 'u1', gameChannel)
    })

    it('should be able respond with the current list of players', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u3')
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal(gameChannel)
        expect(response).to.equal(`The current list of players is: Claus, Henrietta, and John`)
        done()
      }
      gamebot.simulateMessage(`Who's playing resistance?`, 'u1', gameChannel)
    })
  })

  describe('Role Information', () => {
    [`What's my role?`, 'whoami', 'who am I?'].forEach((command) => {
      it(`should respond to "${command}" to remind players have a role assigned`, (done) => {
        gamebot.simulateMessage('join the resistance', 'u1')
        gamebot.respond = (target, response, params) => {
          expect(target).to.equal('u1')
          expect(response.split(NL)).to.deep.equal([`John, your role is...`, `>Janitor : Team :good_guy:.`, `>Maintains a productive work environment`])
          done()
        }
        module.state.roles = {
          u1: {
            name: 'Janitor',
            description: 'Maintains a productive work environment',
            team: {
              logo: ':good_guy:'
            },
            validMissionActions: ['success']
          }
        }
        gamebot.simulateMessage(command, 'u1')
      })
    })

    it('should be able to remind players that are not even playing', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1')
        expect(response).to.equal(`John, you are not part of the resistance. Contact command if you want to join.`)
        done()
      }
      gamebot.simulateMessage(`What's my role?`, 'u1')
    })

    it('should be able to describe a given role', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal(gameChannel)
        expect(response).to.equal(['>Hidden Spy Reverser : Team :bad_guy:.', '>May only play :success: or :reverse:; hidden to the Commander. Attempt to fail three missions for your team.'].join(NL))
        done()
      }
      gamebot.simulateMessage(`describe resistance role hidden spy reverser`, 'u1', gameChannel)
    })

    it('should list available roles if a given role is not found', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal(gameChannel)
        expect(response).to.include(`Did not match role 'Hidden Backstabber Captain'. Available types: Spy Reverser, False Commander`)
        done()
      }
      gamebot.simulateMessage(`describe resistance role Hidden Backstabber Captain`, 'u1', gameChannel)
    })
  })

  describe('Role Configurations', () => {
    [4].forEach((x) => {
      it(`should list the available roles for ${x} players`, (done) => {
        gamebot.respond = (target, response, params) => {
          expect(response).to.include(`The resistance roles for ${x} players are:`)
          expect(response).to.include(`:good_guy: Resistance Reverser`)
          expect(response).to.include(`:bad_guy: Hidden Spy Reverser`)
          expect(target.channel).to.equal(gameChannel)
          done()
        }
        gamebot.simulateMessage(`resistance roles for ${x} players`, 'u1', gameChannel)
      })
    });

    [5, 6, 7, 8, 9, 10].forEach((x) => {
      it(`should list the available roles for ${x} players`, (done) => {
        gamebot.respond = (target, response, params) => {
          expect(response).to.include(`The resistance roles for ${x} players are:`)
          expect(response).to.include(`:good_guy: Generic Resistance`)
          expect(response).to.include(`:bad_guy: `)
          expect(target.channel).to.equal(gameChannel)
          done()
        }
        gamebot.simulateMessage(`resistance roles for ${x} players`, 'u1', gameChannel)
      })
    });

    [1, 2, 3, 11].forEach((x) => {
      it(`should let the user know that there are no configuration for ${x} players`, (done) => {
        gamebot.respond = (target, response, params) => {
          expect(response).to.include(`No resistance roles are configured for ${x} players.`)
          expect(target.channel).to.equal(gameChannel)
          done()
        }
        gamebot.simulateMessage(`resistance roles for ${x} players`, 'u1', gameChannel)
      })
    })
  })

  describe('Picks', () => {
    it('should prevent anyone but the current leader from making a pick', (done) => {
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u5')
      gamebot.simulateMessage('join the resistance', 'u6')
      gamebot.simulateMessage('join the resistance', 'u3')
      gamebot.simulateMessage('join the resistance', 'u4')
      gamebot.simulateMessage('start game', 'u0')
      module.state.playerOrder = ['u4', 'u1', 'u3', 'u2', 'u5']
      gamebot.respond = (target, response, params) => {
        expect(response).to.include(`Only the leader (*Triela*) can make picks.`)
        expect(target.channel).to.equal(gameChannel)
        done()
      }
      gamebot.simulateMessage('pick John, Triela, Rico', 'u6', 'resistance')
    })

    it('should allow the leader to pick players', (done) => {
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u5')
      gamebot.simulateMessage('join the resistance', 'u6')
      gamebot.simulateMessage('join the resistance', 'u3')
      gamebot.simulateMessage('join the resistance', 'u4')
      gamebot.simulateMessage('start game', 'u0')
      module.state.playerOrder = ['u4', 'u6', 'u2', 'u3', 'u5']
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      })

      var expectedResponses = [
        (target, response, params) => {
          expect(response).to.include(`Triela has picked *Angelica*, *Henrietta*, and *Rico* to go on the next mission.`)
          expect(response).to.include(`Leader order: *Triela*, Angelica, Henrietta, Claus, and finally Rico`)
          expect(module.state.picks).to.deep.equal(['u2', 'u5', 'u6'])
          expect(target).to.equal('resistance')
        },
        (target, response, params) => {
          expect(target).to.equal('u2')
          expect(response).to.include(`*Angelica*, *Henrietta*, and *Rico*`)
          expect(response).to.include(`Please vote by responding with *vote accept* or *vote reject*`)
        },
        (target, response, params) => {
          expect(target).to.equal('u5')
          expect(response).to.include(`*Angelica*, *Henrietta*, and *Rico*`)
          expect(response).to.include(`Please vote by responding with *vote accept* or *vote reject*`)
        },
        (target, response, params) => {
          expect(target).to.equal('u6')
          expect(response).to.include(`*Angelica*, *Henrietta*, and *Rico*`)
          expect(response).to.include(`Please vote by responding with *vote accept* or *vote reject*`)
        },
        (target, response, params) => {
          expect(target).to.equal('u3')
          expect(response).to.include(`*Angelica*, *Henrietta*, and *Rico*`)
          expect(response).to.include(`Please vote by responding with *vote accept* or *vote reject*`)
        },
        (target, response, params) => {
          expect(target).to.equal('u4')
          expect(response).to.include(`*Angelica*, *Henrietta*, and *Rico*`)
          expect(response).to.include(`Please vote by responding with *vote accept* or *vote reject*`)
          done()
        }
      ]
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params) : done(response)
      }
      gamebot.simulateMessage(`pick Henrietta, Rico, Angelica`, 'u4')
    })

    it('should prevent picking players who have not joined the game', (done) => {
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u5')
      gamebot.simulateMessage('join the resistance', 'u6')
      gamebot.respond = (target, response, params) => {
        expect(response).to.include(`Some of the picks were not recognised as players; John.`)
        expect(target).to.equal('resistance')
        expect(module.state.picks).to.deep.equal([])
        done()
      }
      gamebot.simulateMessage(`pick Rico, John, Henrietta`, 'u4')
    })

    it('should prevent picking players who have unrecognised names', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u3')
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('resistance')
        expect(response).to.include(`Some of the picks were not recognised as players; James.`)
        expect(module.state.picks).to.deep.equal([])
        done()
      }
      gamebot.simulateMessage(`pick Claus, John, James, Henrietta`, 'u0')
    })

    it('should prevent non-players from voting on a pick', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u3')
      gamebot.simulateMessage('join the resistance', 'u4')
      gamebot.simulateMessage('join the resistance', 'u6')
      gamebot.simulateMessage(`pick John, Angelica`, 'u6')
      gamebot.respond = (target, response, params) => {
        expect(response).to.include(`Unable to accept your vote; you are not part of the current game.`)
        expect(target).to.equal('u5')
        done()
      }
      gamebot.simulateMessage(`vote accept`, 'u5')
    })

    it('should reject picks that have less than 2 players', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u3')
      gamebot.simulateMessage('join the resistance', 'u4')
      gamebot.simulateMessage('join the resistance', 'u6')
      gamebot.respond = (target, response, params) => {
        expect(response).to.include(`Need to pick 2 valid players onto this mission.`)
        done()
      }
      gamebot.simulateMessage(`pick Angelica`, 'u6')
    })

    it('should reject picks that contain the same player more then once', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u3')
      gamebot.simulateMessage('join the resistance', 'u4')
      gamebot.simulateMessage('join the resistance', 'u6')
      gamebot.respond = (target, response, params) => {
        expect(response).to.include(`Unable to make a pick with the same player multiple times.`)
        done()
      }
      gamebot.simulateMessage(`pick Angelica, Angelica`, 'u6')
    })
  })

  describe('Pick Order', () => {
    it('should report that there are no players', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join the resistance', 'u5')
      gamebot.simulateMessage('join the resistance', 'u6')
      gamebot.respond = (target, response, params) => {
        expect(response).to.include(`No leaders; game not started`)
        expect(target.channel).to.equal('private')
        done()
      }
      gamebot.simulateMessage(`What is the player order?`, gameChannel)
    });

    [`What's the pick order?`, `player order`, `leader order`].forEach((message) => {
      it(`saying "${message}" should report on the player order`, (done) => {
        gamebot.simulateMessage('join the resistance', 'u1')
        gamebot.simulateMessage('join the resistance', 'u2')
        gamebot.simulateMessage('join the resistance', 'u5')
        gamebot.simulateMessage('join the resistance', 'u6')
        gamebot.simulateMessage('join the resistance', 'u3')
        gamebot.simulateMessage('start game')
        module.state.playerOrder = ['u3', 'u5', 'u1', 'u6', 'u2']
        module.state.turnCounter = 2
        module.state.voteHistory = [
          [{}, {}]
        ]
        gamebot.respond = (target, response, params) => {
          expect(response).to.include(`Leader order: Claus, Rico, *John*, Angelica, and finally Henrietta`)
          expect(target.channel).to.equal('private')
          done()
        }
        gamebot.simulateMessage(message, gameChannel)
      })
    })
  })

  describe('Playing cards onto a mission', () => {
    it('should prevent non-players from playing cards', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1')
        expect(response).to.include(`Unable to accept your mission action; you are not part of the current game.`)
        expect(module.state.approved).to.equal(false)
        done()
      }
      gamebot.simulateMessage(`play success`, 'u1')
    })

    it('should prevent players playing cards without an approved pick', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1')
        expect(response).to.include(`Unable to accept your mission action; no mission has been approved yet.`)
        done()
      }
      expect(module.state.approved).to.equal(false)
      gamebot.simulateMessage(`play fail`, 'u1')
    })

    it('should prevent non-mission players from playing cards', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1')
        expect(response).to.include(`Unable to accept your mission action; you are not part of the approved mission.`)
        done()
      }
      module.state.picks = ['u0']
      module.state.approved = true
      gamebot.simulateMessage(`play reverse`, 'u1')
    })

    it('should reject actions for players who have already played', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1')
        expect(response).to.include(`Unable to accept your mission action; your mission action has already completed.`)
        done()
      }
      module.state.picks = ['u1']
      module.state.plays = {
        u1: 'success'
      }
      module.state.approved = true
      gamebot.simulateMessage(`play success`, 'u1')
    })

    it('should accept actions from players on mission', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1')
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1')
        expect(response).to.include(`Thank you John, your mission action has been completed.`)
        gamebot.respond = (target, response, params) => {
          expect(target).to.equal('resistance')
          expect(response).to.include('John has completed their mission action.')
          expect(module.state.plays).to.deep.equal({
            'u1': 'success'
          })
          done()
        }
      }
      module.state.roles.u1 = role.GenericResistance
      module.state.roles.u2 = role.GenericResistance
      module.state.picks = ['u1', 'u2']
      module.state.approved = true
      gamebot.simulateMessage(`play success`, 'u1')
    })
  })

  describe('Game state', () => {
    it('should report on the empty state of the game', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(response).to.include(`No leaders; game not started`)
        expect(response).to.not.include(`>Mission Progress:`)
        done()
      }
      gamebot.simulateMessage(`game state`, 'u1')
    })

    it('should use the 2 fails required icon on an appropriate fourth mission', (done) => {
      gamebot.simulateMessage('join spies', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join resistance', 'u3')
      gamebot.simulateMessage('join game', 'u4')
      gamebot.simulateMessage('start game', 'u1')
      module.state.playerOrder = ['u1', 'u3', 'u4', 'u2']
      module.state.customGame = {
        roles: [
          role.Assassin, role.SpyReverser, role.DeepCover, role.FalseCommander
        ],
        missions: [2, 3, 2, 3, 3],
        twoFailsRequired: true
      }
      gamebot.respond = (target, response, params) => {
        expect(response.split(NL)).to.deep.equal([
          `>Custom roles in play: :bad_guy: Assassin, :bad_guy: Deep Cover, :bad_guy: False Commander, and :bad_guy: Spy Reverser`,
          `>Mission Progress: :2: :3: :2: :3-2fr: :3:`,
          `>Leader order: *John*, Claus, Triela, Henrietta, and finally *John*`
        ])
        done()
      }
      gamebot.simulateMessage(`game state`, 'u1')
    })

    it('should report on the first pick of the game', (done) => {
      gamebot.simulateMessage('join spies', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join resistance', 'u3')
      gamebot.simulateMessage('join game', 'u4')
      gamebot.simulateMessage('start game', 'u1')
      module.state.playerOrder = ['u1', 'u3', 'u4', 'u2']
      gamebot.respond = (target, response, params) => {
        expect(response.split(NL)).to.deep.equal([
          `>Mission Progress: :2: :3: :2: :3: :3:`,
          `>Leader order: *John*, Claus, Triela, Henrietta, and finally *John*`
        ])
        done()
      }
      gamebot.simulateMessage(`game state`, 'u1')
    })

    it('should report on the first pick of the game', (done) => {
      gamebot.simulateMessage('join spies', 'u1')
      gamebot.simulateMessage('join the resistance', 'u2')
      gamebot.simulateMessage('join resistance', 'u3')
      gamebot.simulateMessage('join game', 'u4')
      gamebot.simulateMessage('start game', 'u1')
      module.state.playerOrder = ['u1', 'u3', 'u4', 'u2']
      gamebot.respond = (target, response, params) => {
        expect(response.split(NL)).to.deep.equal([
          `>Mission Progress: :2: :3: :2: :3: :3:`,
          `>Leader order: *John*, Claus, Triela, Henrietta, and finally *John*`
        ])
        done()
      }
      gamebot.simulateMessage(`game state`, 'u1')
    })
  })

  describe('Vote history', () => {
    it('should allow a user to request the voting history for the game', (done) => {
      module.state.missionHistory = [{
        playResults: {
          fail: 1,
          success: 2,
          reverse: 1
        },
        victoriousTeam: {
          name: 'Resistance',
          logo: ':good_guy:'
        },
        success: true
      }]
      module.state.voteHistory = [
        [{
          leader: 'u1',
          picks: ['u2', 'u5'],
          votes: {
            u1: 'reject',
            u2: 'accept',
            u4: 'reject',
            u5: 'accept'
          }
        }, {
          leader: 'u5',
          picks: ['u1', 'u5'],
          votes: {
            u1: 'accept',
            u2: 'reject',
            u4: 'reject',
            u5: 'accept'
          }
        }, {
          leader: 'u2',
          picks: ['u2', 'u5'],
          votes: {
            u1: 'reject',
            u2: 'accept',
            u4: 'reject',
            u5: 'accept'
          }
        }, {
          leader: 'u4',
          picks: ['u5', 'u4'],
          votes: {
            u1: 'reject',
            u2: 'reject',
            u4: 'reject',
            u5: 'accept'
          }
        }, {
          leader: 'u1',
          picks: ['u1', 'u4'],
          votes: {
            u1: 'accept',
            u2: 'accept',
            u4: 'accept',
            u5: 'reject'
          }
        }],
        [{
          leader: 'u5',
          picks: ['u2', 'u5', 'u4'],
          votes: {
            u1: 'reject',
            u2: 'accept',
            u4: 'accept',
            u5: 'accept'
          }
        }]
      ]

      gamebot.respond = (target, response, params) => {
        expect(response.split(NL)).to.deep.equal([
          `Mission 1 vote history:`,
          `>:1: Leader: _John_, Pick: *Henrietta*, *Rico*, 2 approve (*Henrietta*, *Rico*), 2 rejects (John, Triela)`,
          `>:2: Leader: _Rico_, Pick: *John*, *Rico*, 2 approve (*John*, *Rico*), 2 rejects (Henrietta, Triela)`,
          `>:3: Leader: _Henrietta_, Pick: *Henrietta*, *Rico*, 2 approve (*Henrietta*, *Rico*), 2 rejects (John, Triela)`,
          `>:4: Leader: _Triela_, Pick: *Rico*, *Triela*, 1 approve (*Rico*), 3 rejects (John, Henrietta, *Triela*)`,
          `>:5: Leader: _John_, Pick: *John*, *Triela*, 3 approve (*John*, Henrietta, *Triela*), 1 rejects (Rico)`,
          `>Result: :good_guy: :success: :success: :reverse: :fail:`,
          `Mission 2 vote history:`,
          `>:1: Leader: _Rico_, Pick: *Henrietta*, *Rico*, *Triela*, 3 approve (*Henrietta*, *Triela*, *Rico*), 1 rejects (John)`,
          `>No mission result`
        ])
        expect(target).to.equal('u1')
        done()
      }
      gamebot.simulateMessage(`vote history`, 'u1')
    })
  })

  describe('Help', () => {
    it('should allow a user to request help on resistance', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1')
        const botname = '@testbot'
        expect(response).to.include(`You can use these commands wherever ${botname} is present; for sensitive commands please send them directly to ${botname} in private chat.`)
        done()
      }
      gamebot.simulateMessage(`How do I play resistance?`, 'u1')
    })
  })
})
