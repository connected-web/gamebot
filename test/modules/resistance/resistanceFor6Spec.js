const expect = require('chai').expect;
const resistance = require('../../../lib/modules/resistance');
const mockGamebot = require('../../lib/mockGamebot');
const NL = '\n';

describe('Resistance module (6 player)', function () {

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
    gamebot.simulateMessage('join the resistance', 'u6');
  });

  describe('Role Assignment', () => {
    it('should assign roles at the start of a game', (done) => {
      module.chooseSeeds(10, 20);

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

  describe('Voting on Picks', (done) => {
    it('should allow players to vote on a valid pick', (done) => {
      gamebot.simulateMessage(`resistance pick Claus, John, Rico, Henrietta`, 'u0');

      // 'John', 'Henrietta', 'Claus', 'Triela', 'Rico', 'Angelica'
      var expectedResponses = [
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`John has voted, 5 players remaining.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Henrietta has voted, 4 players remaining.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Claus has voted, 3 players remaining.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Triela has voted, 2 players remaining.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Rico has voted, 1 players remaining.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Angelica has voted, no players remaining.`);
        },
        (target, response, params) => {
          expect(target).to.equal('resistance');
          expect(response).to.include(`Mission Approved! 4 votes (Henrietta, Claus, Triela, Rico), 2 rejects (John, Angelica)`);
          done();
        }
      ];
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      }
      gamebot.simulateMessage(`resistance vote reject`, 'u1');
      gamebot.simulateMessage(`resistance vote accept`, 'u2');
      gamebot.simulateMessage(`resistance vote accept`, 'u3');
      gamebot.simulateMessage(`resistance vote accept`, 'u4');
      gamebot.simulateMessage(`resistance vote accept`, 'u5');
      gamebot.simulateMessage(`resistance vote reject`, 'u6');
    });

    it('should prevent players to voting before a pick has been made', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u3');
        expect(response).to.include(`Unable to accept your vote, no valid pick has been made yet.`);
        done();
      };
      gamebot.simulateMessage(`resistance vote accept`, 'u3');
    });
  });

  describe('Playing cards onto a mission', () => {
    it('should allow players to succeed a 4 player mission with a fail and a reverse', (done) => {
      gamebot.simulateMessage(`resistance pick Claus, John, Rico, Henrietta`, 'u0');
      gamebot.simulateMessage(`resistance vote reject`, 'u1');
      gamebot.simulateMessage(`resistance vote accept`, 'u2');
      gamebot.simulateMessage(`resistance vote accept`, 'u3');
      gamebot.simulateMessage(`resistance vote accept`, 'u4');
      gamebot.simulateMessage(`resistance vote accept`, 'u5');
      gamebot.simulateMessage(`resistance vote reject`, 'u6');

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
      gamebot.simulateMessage(`resistance vote reject`, 'u1');
      gamebot.simulateMessage(`resistance vote accept`, 'u2');
      gamebot.simulateMessage(`resistance vote accept`, 'u3');
      gamebot.simulateMessage(`resistance vote accept`, 'u4');
      gamebot.simulateMessage(`resistance vote accept`, 'u5');
      gamebot.simulateMessage(`resistance vote reject`, 'u6');
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
      gamebot.simulateMessage(`resistance vote reject`, 'u1');
      gamebot.simulateMessage(`resistance vote accept`, 'u2');
      gamebot.simulateMessage(`resistance vote accept`, 'u3');
      gamebot.simulateMessage(`resistance vote accept`, 'u4');
      gamebot.simulateMessage(`resistance vote accept`, 'u5');
      gamebot.simulateMessage(`resistance vote reject`, 'u6');
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
  });
});
