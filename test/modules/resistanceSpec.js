const expect = require('chai').expect;
const api = require('../../lib/api');
const handleMessage = require('../../lib/handleMessage');
const resistance = require('../../lib/modules/resistance');
const NL = '\n';
const LOG_ENABLED = false;
const SAVE_TO_DISK = false;

describe('Resistance module', function () {

  var module, gamebot;

  beforeEach((done) => {
    gamebot = api({
      slackbot: {
        id: '@bot'
      }
    });

    gamebot.getUserName = (id) => {
      return {
        'u0': 'Test Bot',
        'u1': 'John',
        'u2': 'Henrietta',
        'u3': 'Claus'
      }[id] || id;
    };

    gamebot.simulateMessage = (message, userId, channelId) => {
      handleMessage(gamebot, {
        type: 'message',
        text: message,
        user: userId,
        channel: channelId
      }, LOG_ENABLED);
    };

    module = resistance(gamebot, SAVE_TO_DISK).then(done);

    gamebot.respond = () => {};
    gamebot.simulateMessage('stop resistance', 'u0');
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
        expect(response).to.equal('Test Bot has reset the game. Current players are John, Henrietta, and Claus.');
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

  describe('Role Assignment', () => {
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
