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

  describe('Voting on Picks', (done) => {
    it('should allow players to vote on a valid pick', (done) => {
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.simulateMessage('join the resistance', 'u2');
      gamebot.simulateMessage('join the resistance', 'u3');
      gamebot.simulateMessage('join the resistance', 'u4');
      gamebot.simulateMessage('join the resistance', 'u5');
      gamebot.simulateMessage('join the resistance', 'u6');
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
      gamebot.simulateMessage('join the resistance', 'u1');
      gamebot.simulateMessage('join the resistance', 'u2');
      gamebot.simulateMessage('join the resistance', 'u3');
      gamebot.simulateMessage('join the resistance', 'u4');
      gamebot.simulateMessage('join the resistance', 'u5');
      gamebot.simulateMessage('join the resistance', 'u6');

      gamebot.respond = (target, response, params) => {
        expect(target).to.equal('u3');
        expect(response).to.include(`Unable to accept your vote, no valid pick has been made yet.`);
        done();
      };
      gamebot.simulateMessage(`resistance vote accept`, 'u3');

    });
  });
});
