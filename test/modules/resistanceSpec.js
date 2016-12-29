const expect = require('chai').expect;
const api = require('../../lib/api');
const handleMessage = require('../../lib/handleMessage');
const resistance = require('../../lib/modules/resistance');
const NL = '\n';
const LOG_ENABLED = false;
const SAVE_TO_DISK = false;

describe('Resistance module', function () {

  var module, gamebot;

  var userIDIndex = {
    'u0': 'Test Bot',
    'u1': 'John',
    'u2': 'Henrietta',
    'u3': 'Claus',
    'u4': 'Triela',
    'u5': 'Rico',
    'u6': 'Angelica'
  };
  var userNameIndex = {};
  Object.keys(userIDIndex).forEach((userId) => {
    userNameIndex[userIDIndex[userId].toLowerCase()] = userId;
  });

  beforeEach((done) => {
    gamebot = api({
      slackbot: {
        id: '@bot'
      }
    });

    gamebot.getUserName = (id) => {
      return userIDIndex[id] || id;
    };

    gamebot.findUserByName = (name) => {
      return {
        name,
        id: userNameIndex[(name + '').toLowerCase()]
      };
    }

    gamebot.simulateMessage = (message, userId, channelId) => {
      handleMessage(gamebot, {
        type: 'message',
        text: message,
        user: userId,
        channel: channelId
      }, LOG_ENABLED);
    };

    resistance(gamebot, SAVE_TO_DISK)
      .then((result) => {
        module = result;
      })
      .then(done);

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

  describe('Role Assignment', () => {
    it('should assign roles at the start of a game', (done) => {
      module.chooseSeeds(10, 20);
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.simulateMessage('join the resistance', 'u2');
      gamebot.simulateMessage('join the resistance', 'u3');
      gamebot.simulateMessage('join the resistance', 'u4');
      gamebot.simulateMessage('join the resistance', 'u5');
      gamebot.simulateMessage('join the resistance', 'u6');

      const expectedResponses = [
        (target, response, params) => {
          expect(response).to.equal(`Test Bot has started the game; all players will shortly receive their roles.`);
          expect(target).to.equal('resistance');
        },
        (target, response, params) => {
          expect(target).to.equal('u3');
          expect(response).to.include('Congratulations Claus (Citizen u3) you have been assigned the role of :good_guy: Resistance Reverser fighting for the Resistance. May only');
        },
        (target, response, params) => {
          expect(target).to.equal('u2');
          expect(response).to.include('Congratulations Henrietta (Citizen u2) you have been assigned the role of :good_guy: Generic Resistance fighting for the Resistance. May only');
        },
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include('Congratulations Rico (Citizen u5) you have been assigned the role of :bad_guy: False Commander fighting for the Spies. May only');
        },
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Rico');
          expect(response).to.include('>:bad_guy: Angelica');
        },
        (target, response, params) => {
          expect(target).to.equal('u6');
          expect(response).to.include('Congratulations Angelica (Citizen u6) you have been assigned the role of :bad_guy: Spy Reverser fighting for the Spies. May only');
        },
        (target, response, params) => {
          expect(target).to.equal('u6');
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Rico');
          expect(response).to.include('>:bad_guy: Angelica');
        },
        (target, response, params) => {
          expect(target).to.equal('u1');
          expect(response).to.include('Congratulations John (Citizen u1) you have been assigned the role of :good_guy: Resistance Commander fighting for the Resistance. May only');
        },
        (target, response, params) => {
          expect(target).to.equal('u1');
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Rico');
          expect(response).to.include('>:bad_guy: Angelica');
        },
        (target, response, params) => {
          expect(target).to.equal('u4');
          expect(response).to.include('Congratulations Triela (Citizen u4) you have been assigned the role of :good_guy: Body Guard fighting for the Resistance. May only');
        },
        (target, response, params) => {
          expect(target).to.equal('u4');
          expect(response).to.include('The following players are known to you as commanders:');
          expect(response).to.include('>:bad_guy: ? :good_guy: John');
          expect(response).to.include('>:bad_guy: ? :good_guy: Rico');
          done();
        }
      ];

      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      }

      gamebot.simulateMessage('start resistance', 'u0');
    });

    it('should assign roles at the start of a game based on a new seed', (done) => {
      module.chooseSeeds(6, 23);
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.simulateMessage('join the resistance', 'u2');
      gamebot.simulateMessage('join the resistance', 'u3');
      gamebot.simulateMessage('join the resistance', 'u4');
      gamebot.simulateMessage('join the resistance', 'u5');
      gamebot.simulateMessage('join the resistance', 'u6');

      const expectedResponses = [
        (target, response, params) => {
          expect(response).to.equal(`Test Bot has started the game; all players will shortly receive their roles.`);
          expect(target).to.equal('resistance');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Angelica (Citizen u6) you have been assigned the role of :bad_guy: False Commander fighting for the Spies. May only ');
        },
        (target, response, params) => {
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Angelica');
          expect(response).to.include('>:bad_guy: Rico');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Rico (Citizen u5) you have been assigned the role of :bad_guy: Spy Reverser fighting for the Spies. May only');
        },
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Angelica');
          expect(response).to.include('>:bad_guy: Rico');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Henrietta (Citizen u2) you have been assigned the role of :good_guy: Resistance Commander fighting for the Resistance. May only');
        },
        (target, response, params) => {
          expect(target).to.equal('u2');
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Angelica');
          expect(response).to.include('>:bad_guy: Rico');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Triela (Citizen u4) you have been assigned the role of :good_guy: Body Guard fighting for the Resistance. May only');
        },
        (target, response, params) => {
          expect(target).to.equal('u4');
          expect(response).to.include('The following players are known to you as commanders:');
          expect(response).to.include('>:bad_guy: ? :good_guy: Henrietta');
          expect(response).to.include('>:bad_guy: ? :good_guy: Angelica');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Claus (Citizen u3) you have been assigned the role of :good_guy: Resistance Reverser fighting for the Resistance. May only');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations John (Citizen u1) you have been assigned the role of :good_guy: Generic Resistance fighting for the Resistance. May only');
          done();
        }
      ];

      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      }

      gamebot.simulateMessage('start resistance', 'u0');
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
          expect(response).to.include(`Test Bot has picked Henrietta, Rico, and Angelica to go on the next mission.`);
          expect(module.state.picks).to.deep.equal(['u2', 'u5', 'u6']);
        },
        (target, response, params) => {
          expect(target).to.equal('u2');
          expect(response).to.include(`Henrietta, Rico, and Angelica`);
          expect(response).to.include(`Please vote by responding with *resistance vote accept* or *resistance vote reject*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include(`Henrietta, Rico, and Angelica`);
          expect(response).to.include(`Please vote by responding with *resistance vote accept* or *resistance vote reject*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u6');
          expect(response).to.include(`Henrietta, Rico, and Angelica`);
          expect(response).to.include(`Please vote by responding with *resistance vote accept* or *resistance vote reject*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u3');
          expect(response).to.include(`Henrietta, Rico, and Angelica`);
          expect(response).to.include(`Please vote by responding with *resistance vote accept* or *resistance vote reject*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u4');
          expect(response).to.include(`Henrietta, Rico, and Angelica`);
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
