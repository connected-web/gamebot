const expect = require('chai').expect;
const resistance = require('../../../lib/modules/resistance');
const mockGamebot = require('../../lib/mockGamebot');
const NL = '\n';

describe('Resistance module (5 player)', function () {

  var module, gamebot;

  beforeEach(() => {
    gamebot = mockGamebot();
    module = resistance(gamebot, false);
    module.reset();

    gamebot.simulateMessage('join the resistance', 'u1');
    gamebot.simulateMessage('join the resistance', 'u2');
    gamebot.simulateMessage('join the resistance', 'u3');
    gamebot.simulateMessage('join the resistance', 'u4');
    gamebot.simulateMessage('join the resistance', 'u5');
  });

  describe('Role Assignment', () => {
    it('should assign a player order at the start of a game', (done) => {
      module.chooseSeeds(145, 455);
      gamebot.respond = (target, response, params) => {};
      gamebot.simulateMessage('start resistance', 'u0');
      expect(module.state.playerOrder).to.deep.equal(['u5', 'u3', 'u4', 'u2', 'u1']);
      expect(module.state.turnCounter).to.equal(0);
      done();
    });

    it('should assign roles at the start of a game', (done) => {
      module.chooseSeeds(245, 272);

      const expectedResponses = [
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([`Test Bot has started the game; all players will shortly receive their roles.`, `Player order is: John, Rico, Triela, Henrietta, then Claus. John has first pick.`]);
          expect(target).to.equal('resistance');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Claus (Citizen u3) you have been assigned the role of :bad_guy: False Commander fighting for the Spies. May only');
          expect(target).to.equal('u3');
        },
        (target, response, params) => {
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Claus');
          expect(response).to.include('>:bad_guy: Henrietta');
          expect(target).to.equal('u3');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Henrietta (Citizen u2) you have been assigned the role of :bad_guy: Hidden Spy Reverser fighting for the Spies. May only');
          expect(target).to.equal('u2');
        },
        (target, response, params) => {
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Claus');
          expect(response).to.include('>:bad_guy: Henrietta');
          expect(target).to.equal('u2');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Triela (Citizen u4) you have been assigned the role of :good_guy: Resistance Commander fighting for the Resistance. May only');
          expect(target).to.equal('u4');
        },
        (target, response, params) => {
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Claus');
          expect(target).to.equal('u4');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Rico (Citizen u5) you have been assigned the role of :good_guy: Resistance Reverser fighting for the Resistance. May only');
          expect(target).to.equal('u5');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations John (Citizen u1) you have been assigned the role of :good_guy: Generic Resistance fighting for the Resistance. May only');
          expect(target).to.equal('u1');
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
      module.chooseSeeds(8667, 234);

      const expectedResponses = [
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([`Test Bot has started the game; all players will shortly receive their roles.`, `Player order is: John, Henrietta, Claus, Triela, then Rico. John has first pick.`]);
          expect(target).to.equal('resistance');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Rico (Citizen u5) you have been assigned the role of :good_guy: Resistance Commander fighting for the Resistance. May only');
        },
        (target, response, params) => {
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Henrietta');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Triela (Citizen u4) you have been assigned the role of :good_guy: Resistance Reverser fighting for the Resistance. May only');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Claus (Citizen u3) you have been assigned the role of :good_guy: Generic Resistance fighting for the Resistance. May only');
          expect(target).to.equal('u3');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Henrietta (Citizen u2) you have been assigned the role of :bad_guy: False Commander fighting for the Spies. May only');
        },
        (target, response, params) => {
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Henrietta');
          expect(response).to.include('>:bad_guy: John');
          expect(target).to.equal('u2');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations John (Citizen u1) you have been assigned the role of :bad_guy: Hidden Spy Reverser fighting for the Spies. May only');
        },
        (target, response, params) => {
          expect(target).to.equal('u1');
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Henrietta');
          expect(response).to.include('>:bad_guy: John');
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

  describe('Voting on Picks', (done) => {
    it('should allow players to vote on a valid pick', (done) => {
      gamebot.simulateMessage(`resistance pick Claus, John, Rico, Henrietta`, 'u0');

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`John has voted, 4 players remaining.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Henrietta has voted, 3 players remaining.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Claus has voted, 2 players remaining.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Triela has voted, 1 players remaining.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response.split(NL)).to.deep.equal([`Rico has voted.`, `Mission Approved! 4 votes (Henrietta, Claus, Triela, Rico), 1 rejects (John).`, `Players Claus, Henrietta, John, and Rico have been assigned to the current mission; awaiting their responses.`]);
        },
        (target, response, params) => {
          expect(target).to.equal('u3');
          expect(response).to.include(`You are on an approved mission; please play *success*, *fail*, or *reverse* according to your role. e.g. *play resistance success*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u1');
          expect(response).to.include(`You are on an approved mission; please play *success*, *fail*, or *reverse* according to your role. e.g. *play resistance success*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include(`You are on an approved mission; please play *success*, *fail*, or *reverse* according to your role. e.g. *play resistance success*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u2');
          expect(response).to.include(`You are on an approved mission; please play *success*, *fail*, or *reverse* according to your role. e.g. *play resistance success*`);
          done();
        }
      ];
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      }
      gamebot.simulateMessage(`vote reject`, 'u1');
      gamebot.simulateMessage(`vote accept`, 'u2');
      gamebot.simulateMessage(`vote accept`, 'u3');
      gamebot.simulateMessage(`vote accept`, 'u4');
      gamebot.simulateMessage(`vote accept`, 'u5');
    });

    it('should prevent players to voting before a pick has been made', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u3');
        expect(response).to.include(`Unable to accept your vote, no valid pick has been made yet.`);
        done();
      };
      gamebot.simulateMessage(`vote accept`, 'u3');
    });
  });

  describe('Notifications to players on a mission', () => {
    it('should allow players to vote on a valid pick', (done) => {
      gamebot.simulateMessage(`resistance pick Claus, John, Rico`, 'u0');
      gamebot.simulateMessage(`vote reject`, 'u1');
      gamebot.simulateMessage(`vote accept`, 'u2');
      gamebot.simulateMessage(`vote accept`, 'u3');
      gamebot.simulateMessage(`vote accept`, 'u4');

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([`Rico has voted.`, `Mission Approved! 4 votes (Henrietta, Claus, Triela, Rico), 1 rejects (John).`, `Players Claus, John, and Rico have been assigned to the current mission; awaiting their responses.`]);
          expect(target).to.equal('resistance');
        },
        (target, response, params) => {
          expect(target).to.equal('u3');
          expect(response).to.include(`You are on an approved mission; please play *success*, *fail*, or *reverse* according to your role. e.g. *play resistance success*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u1');
          expect(response).to.include(`You are on an approved mission; please play *success*, *fail*, or *reverse* according to your role. e.g. *play resistance success*`);
        },
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include(`You are on an approved mission; please play *success*, *fail*, or *reverse* according to your role. e.g. *play resistance success*`);
          done();
        }
      ];
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      }
      gamebot.simulateMessage(`vote accept`, 'u5');
    });
  });

  describe('Playing cards onto a mission', () => {
    it('should allow players to succeed a 4 player mission with a fail and a reverse', (done) => {
      gamebot.simulateMessage(`resistance pick Claus, John, Rico, Henrietta`, 'u0');
      gamebot.simulateMessage(`vote reject`, 'u1');
      gamebot.simulateMessage(`vote accept`, 'u2');
      gamebot.simulateMessage(`vote accept`, 'u3');
      gamebot.simulateMessage(`vote accept`, 'u4');
      gamebot.simulateMessage(`vote accept`, 'u5');
      gamebot.simulateMessage(`vote reject`, 'u6');

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u3');
          expect(response).to.include(`Thank you Claus, your mission action has been completed.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Claus has completed their mission action.`);
        },
        (target, response, params) => {
          expect(target).to.equal('u1');
          expect(response).to.include(`Thank you John, your mission action has been completed.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`John has completed their mission action.`);
        },
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include(`Thank you Rico, your mission action has been completed.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Rico has completed their mission action.`);
        },
        (target, response, params) => {
          expect(target).to.equal('u2');
          expect(response).to.include(`Thank you Henrietta, your mission action has been completed.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Henrietta has completed their mission action.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response.split(NL)).to.deep.equal([`All mission actions have been completed; the results are as follows:`, `>Success (2) :success: :success:`, `>Fail (1) :fail:`, `>Reverse (1) :reverse:`, 'Overall mission status: Resistance :good_guy: victory']);
          done();
        }
      ];
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      };
      gamebot.simulateMessage(`play resistance success`, 'u3');
      gamebot.simulateMessage(`play resistance fail`, 'u1');
      gamebot.simulateMessage(`play resistance reverse`, 'u5');
      gamebot.simulateMessage(`play resistance success`, 'u2');
    });

    it('should allow players to fail a 4 player mission with two reverses and a fail', (done) => {
      gamebot.simulateMessage(`resistance pick Claus, John, Rico, Henrietta`, 'u0');
      gamebot.simulateMessage(`vote reject`, 'u1');
      gamebot.simulateMessage(`vote accept`, 'u2');
      gamebot.simulateMessage(`vote accept`, 'u3');
      gamebot.simulateMessage(`vote accept`, 'u4');
      gamebot.simulateMessage(`vote accept`, 'u5');
      gamebot.simulateMessage(`vote reject`, 'u6');
      gamebot.simulateMessage(`play resistance success`, 'u3');
      gamebot.simulateMessage(`play resistance fail`, 'u1');
      gamebot.simulateMessage(`play resistance reverse`, 'u5');

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u2');
          expect(response).to.include(`Thank you Henrietta, your mission action has been completed.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Henrietta has completed their mission action.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response.split(NL)).to.deep.equal([`All mission actions have been completed; the results are as follows:`, `>Success (1) :success:`, `>Fail (1) :fail:`, `>Reverse (2) :reverse: :reverse:`, 'Overall mission status: Spies :bad_guy: victory']);
          done();
        }
      ];
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      };
      gamebot.simulateMessage(`play resistance reverse`, 'u2');
    });

    it('should allow players to fail a 3 player mission with a single reverse', (done) => {
      gamebot.simulateMessage(`resistance pick Claus, John, Rico`, 'u0');
      gamebot.simulateMessage(`vote reject`, 'u1');
      gamebot.simulateMessage(`vote accept`, 'u2');
      gamebot.simulateMessage(`vote accept`, 'u3');
      gamebot.simulateMessage(`vote accept`, 'u4');
      gamebot.simulateMessage(`vote accept`, 'u5');
      gamebot.simulateMessage(`vote reject`, 'u6');
      gamebot.simulateMessage(`play resistance success`, 'u3');
      gamebot.simulateMessage(`play resistance reverse`, 'u1');

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include(`Thank you Rico, your mission action has been completed.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Rico has completed their mission action.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response.split(NL)).to.deep.equal([`All mission actions have been completed; the results are as follows:`, `>Success (2) :success: :success:`, `>Reverse (1) :reverse:`, 'Overall mission status: Spies :bad_guy: victory']);
          done();
        }
      ];
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      };
      gamebot.simulateMessage(`play resistance success`, 'u5');
    });

    it('should allow players to fail a 3 player mission with two fails', (done) => {
      gamebot.simulateMessage(`resistance pick Claus, John, Rico`, 'u0');
      gamebot.simulateMessage(`vote reject`, 'u1');
      gamebot.simulateMessage(`vote accept`, 'u2');
      gamebot.simulateMessage(`vote accept`, 'u3');
      gamebot.simulateMessage(`vote accept`, 'u4');
      gamebot.simulateMessage(`vote accept`, 'u5');
      gamebot.simulateMessage(`vote reject`, 'u6');
      gamebot.simulateMessage(`play resistance fail`, 'u3');
      gamebot.simulateMessage(`play resistance fail`, 'u1');

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include(`Thank you Rico, your mission action has been completed.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Rico has completed their mission action.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response.split(NL)).to.deep.equal([`All mission actions have been completed; the results are as follows:`, `>Success (1) :success:`, `>Fail (2) :fail: :fail:`, 'Overall mission status: Spies :bad_guy: victory']);
          done();
        }
      ];
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      };
      gamebot.simulateMessage(`play resistance success`, 'u5');
    });

    it('should allow players to succeed a 3 player mission with three successes', (done) => {
      gamebot.simulateMessage(`resistance pick Claus, John, Rico`, 'u0');
      gamebot.simulateMessage(`vote reject`, 'u1');
      gamebot.simulateMessage(`vote accept`, 'u2');
      gamebot.simulateMessage(`vote accept`, 'u3');
      gamebot.simulateMessage(`vote accept`, 'u4');
      gamebot.simulateMessage(`vote accept`, 'u5');
      gamebot.simulateMessage(`vote reject`, 'u6');
      gamebot.simulateMessage(`play resistance success`, 'u3');
      gamebot.simulateMessage(`play resistance success`, 'u1');

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('u5');
          expect(response).to.include(`Thank you Rico, your mission action has been completed.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Rico has completed their mission action.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response.split(NL)).to.deep.equal([`All mission actions have been completed; the results are as follows:`, `>Success (3) :success: :success: :success:`, 'Overall mission status: Resistance :good_guy: victory']);
          done();
        }
      ];
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      };
      gamebot.simulateMessage(`play resistance success`, 'u5');
    });
  });
});
