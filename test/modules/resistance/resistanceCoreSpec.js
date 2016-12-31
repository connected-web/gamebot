const expect = require('chai').expect;
const resistance = require('../../../lib/modules/resistance');
const mockGamebot = require('../../lib/mockGamebot');
const NL = '\n';

describe('Resistance module (core)', function () {

  var module, gamebot;

  beforeEach(() => {
    gamebot = mockGamebot();
    module = resistance(gamebot, false);
    module.reset();
  });

  describe('Stop and Reset', () => {
    it('should respond to players wanting to stop the current game', (done) => {
      gamebot.respond = (channel, response, params) => {
        expect(channel).to.equal('resistance');
        expect(response).to.equal('Test Bot has stopped the game; all players have been executed.');
        done();
      };
      gamebot.simulateMessage('stop resistance', 'u0');
    });

    it('should allow players to reset the game without losing players', (done) => {
      // Add users
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.simulateMessage('join the resistance', 'u2');
      gamebot.simulateMessage('join the resistance', 'u3');
      gamebot.respond = (channel, response, params) => {
        expect(channel).to.equal('resistance');
        expect(response).to.equal('Test Bot has reset the game. Current players are Claus, Henrietta, and John.');
        done();
      };
      gamebot.simulateMessage('reset resistance', 'u0');
    });

    it('should allow players to reset the game without any players', (done) => {
      // Add users
      gamebot.respond = (channel, response, params) => {
        expect(channel).to.equal('resistance');
        expect(response).to.equal('Test Bot has reset the game. No players have registered to play.');
        done();
      };
      gamebot.simulateMessage('reset resistance', 'u0');
    });
  });

  describe('Leaving and Joining', () => {
    it('should respond to players wanting to join using "join resistance"', (done) => {
      // Listen for specific responses
      gamebot.respond = (channel, response, params) => {
        expect(response).to.equal([`Welcome to the Resistance John.`, `Your assigned code is u1.`, 'Please await further instructions from command.'].join(NL));
        gamebot.respond = (channel, response, params) => {
          expect(response).to.equal(`John has joined the resistance. There are now 1 players.`);
          done();
        }
      };
      // Add the user
      gamebot.simulateMessage('join the resistance', 'u1');
    });

    it('should respond to players wanting to join using "join the resistance"', (done) => {
      // Listen for specific responses
      gamebot.respond = (channel, response, params) => {
        expect(response).to.equal([`Welcome to the Resistance Claus.`, `Your assigned code is u3.`, 'Please await further instructions from command.'].join(NL));
        gamebot.respond = (channel, response, params) => {
          expect(response).to.equal(`Claus has joined the resistance. There are now 1 players.`);
          done();
        }
      };
      // Add the user
      gamebot.simulateMessage('join the resistance', 'u3');
    });

    it('should respond to players who have already joined', (done) => {
      // Add the user
      gamebot.simulateMessage('join the resistance', 'u2');
      // Then start listening
      gamebot.respond = (channel, response, params) => {
        expect(response).to.equal(`Friend Henrietta, you are already part of the Resistance. Your assigned code is u2.`);
        done();
      };
      // Join a second time
      gamebot.simulateMessage('join the resistance', 'u2');
    });

    it('should respond to players who want to leave', (done) => {
      // Add users
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.simulateMessage('join the resistance', 'u2');
      gamebot.simulateMessage('join the resistance', 'u3');
      // Then start listening
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal('sameChannel');
        expect(response).to.equal(`Goodbye comrade Henrietta, until next time.`);
        gamebot.respond = (channel, response, params) => {
          expect(channel).to.equal('resistance');
          expect(response).to.equal('Henrietta has left the resistance. There are now 2 players.');
          done();
        };
      };
      // Remove user
      gamebot.simulateMessage('leave the resistance', 'u2', 'sameChannel');
    });
  });

  describe('List Players', () => {
    it('should be able respond with an empty list of players', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal('sameChannel');
        expect(response).to.equal(`No one is currently registered to play resistance.`);
        done();
      };
      gamebot.simulateMessage(`Who's playing resistance?`, 'u1', 'sameChannel');
    });

    it('should be able respond with the current list of players', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.simulateMessage('join the resistance', 'u2');
      gamebot.simulateMessage('join the resistance', 'u3');
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal('sameChannel');
        expect(response).to.equal(`The current list of players is: John, Henrietta, Claus`);
        done();
      };
      gamebot.simulateMessage(`Who's playing resistance?`, 'u1', 'sameChannel');
    });
  });

  describe('Role Information', () => {
    it('should be able to remind players that they have no role assigned', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1');
        expect(response).to.equal(`John, your role is... unassigned :good_guy: :bad_guy:.`);
        done();
      };
      gamebot.simulateMessage(`What's my role?`, 'u1');
    });

    it('should be able to remind players that are not even playing', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1');
        expect(response).to.equal(`John, you are not part of the resistance. Contact command if you want to join.`);
        done();
      };
      gamebot.simulateMessage(`What's my role?`, 'u1');
    });

    it('should be able to describe a given role', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal('sameChannel');
        expect(response).to.equal(['>Hidden Spy Reverser : Team :bad_guy:.', '>May only play :success: or :reverse:; hidden to the Commander. Attempt to fail three missions for your team.'].join(NL));
        done();
      };
      gamebot.simulateMessage(`describe resistance role hidden spy reverser`, 'u1', 'sameChannel');
    });

    it('should list available roles if a given role is not found', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target.channel).to.equal('sameChannel');
        expect(response).to.include(`Did not match role 'Hidden Backstabber Captain'. Available types: Spy Reverser, False Commander`);
        done();
      };
      gamebot.simulateMessage(`describe resistance role Hidden Backstabber Captain`, 'u1', 'sameChannel');
    });
  });

  describe('Role Configurations', () => {
    [5, 6, 7, 8, 9, 10].forEach((x) => {
      it(`should list the available roles for ${x} players`, (done) => {
        gamebot.respond = (target, response, params) => {
          expect(target.channel).to.equal('sameChannel');
          expect(response).to.include(`The resistance roles for ${x} players are:`);
          expect(response).to.include(`:good_guy: Generic Resistance`);
          expect(response).to.include(`:bad_guy: False Commander`);
          done();
        };
        gamebot.simulateMessage(`resistance roles for ${x} players`, 'u1', 'sameChannel');
      });
    });

    [1, 2, 3, 4, 11].forEach((x) => {
      it(`should let the user know that there are no configuration for ${x} players`, (done) => {
        gamebot.respond = (target, response, params) => {
          expect(target.channel).to.equal('sameChannel');
          expect(response).to.include(`No resistance roles are configured for ${x} players.`);
          done();
        };
        gamebot.simulateMessage(`resistance roles for ${x} players`, 'u1', 'sameChannel');
      });
    });
  });


  describe('Picks', () => {
    it('should allow a user to pick players', (done) => {
      gamebot.simulateMessage('join the resistance', 'u2');
      gamebot.simulateMessage('join the resistance', 'u5');
      gamebot.simulateMessage('join the resistance', 'u6');
      gamebot.simulateMessage('join the resistance', 'u3');
      gamebot.simulateMessage('join the resistance', 'u4');

      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Test Bot has picked Angelica, Henrietta, and Rico to go on the next mission.`);
          expect(module.state.picks).to.deep.equal(['u2', 'u5', 'u6']);
        },
        (target, response, params) => {
          expect(target).to.equal('u2');
          expect(response).to.include(`Angelica, Henrietta, and Rico`);
          expect(response).to.include(`Please vote by responding with *resistance vote accept* or *resistance vote reject*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include(`Angelica, Henrietta, and Rico`);
          expect(response).to.include(`Please vote by responding with *resistance vote accept* or *resistance vote reject*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u6');
          expect(response).to.include(`Angelica, Henrietta, and Rico`);
          expect(response).to.include(`Please vote by responding with *resistance vote accept* or *resistance vote reject*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u3');
          expect(response).to.include(`Angelica, Henrietta, and Rico`);
          expect(response).to.include(`Please vote by responding with *resistance vote accept* or *resistance vote reject*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u4');
          expect(response).to.include(`Angelica, Henrietta, and Rico`);
          expect(response).to.include(`Please vote by responding with *resistance vote accept* or *resistance vote reject*`);
          done();
        }
      ];
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      }
      gamebot.simulateMessage(`resistance pick Henrietta, Rico, Angelica`, 'u0');
    });

    it('should prevent picking players who have not joined the game', (done) => {
      gamebot.simulateMessage('join the resistance', 'u2');
      gamebot.simulateMessage('join the resistance', 'u5');
      gamebot.simulateMessage('join the resistance', 'u6');
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('resistance');
        expect(response).to.include(`Some of the picks were not recognised as players; John.`);
        expect(module.state.picks).to.deep.equal([]);
        done();
      };
      gamebot.simulateMessage(`resistance pick Rico, John, Henrietta`, 'u0');
    });

    it('should prevent picking players who have urecognised names', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.simulateMessage('join the resistance', 'u2');
      gamebot.simulateMessage('join the resistance', 'u3');
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('resistance');
        expect(response).to.include(`Some of the picks were not recognised as players; James.`);
        expect(module.state.picks).to.deep.equal([]);
        done();
      };
      gamebot.simulateMessage(`resistance pick Claus, John, James, Henrietta`, 'u0');
    });
  });

  describe('Playing cards onto a mission', () => {
    it('should prevent non-players from playing cards', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1');
        expect(response).to.include(`Unable to accept your mission action; you are not part of the current game.`);
        expect(module.state.approved).to.equal(false);
        done();
      };
      gamebot.simulateMessage(`play resistance success`, 'u1');
    });

    it('should prevent players playing cards without an approved pick', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1');
        expect(response).to.include(`Unable to accept your mission action; no mission has been approved yet.`);
        done();
      };
      expect(module.state.approved).to.equal(false);
      gamebot.simulateMessage(`play resistance fail`, 'u1');
    });

    it('should prevent non-mission players from playing cards', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1');
        expect(response).to.include(`Unable to accept your mission action; you are not part of the approved mission.`);
        done();
      };
      module.state.picks = ['u0'];
      module.state.approved = true;
      gamebot.simulateMessage(`play resistance reverse`, 'u1');
    });

    it('should reject actions for players who have already played', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1');
        expect(response).to.include(`Unable to accept your mission action; your mission action has already completed.`);
        done();
      };
      module.state.picks = ['u1'];
      module.state.plays = {
        u1: 'success'
      };
      module.state.approved = true;
      gamebot.simulateMessage(`play resistance success`, 'u1');
    });

    it('should accept actions from players on mission', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1');
        expect(response).to.include(`Thank you John, your mission action has been completed.`);
        gamebot.respond = (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include('John has completed their mission action.');
          expect(module.state.plays).to.deep.equal({
            'u1': 'success'
          });
          done();
        };
      };
      module.state.picks = ['u1', 'u2'];
      module.state.approved = true;
      gamebot.simulateMessage(`play resistance success`, 'u1');
    });
  });

  describe('Help', () => {
    it('should allow a user to request help on resistance', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u1');
        const botname = '@bot';
        expect(response).to.include(`You can use these commands wherever ${botname} is present; for sensitive commands please send them directly to ${botname} in private chat.`);
        done();
      };
      gamebot.simulateMessage(`How do I play resistance?`, 'u1');
    });
  });
});
