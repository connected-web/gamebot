const expect = require('chai').expect;
const resistance = require('../../../lib/modules/resistance');
const mockGamebot = require('../../lib/mockGamebot');
const NL = '\n';

describe('Resistance module (Assassinations)', function () {

  var module, gamebot;
  const gameChannel = 'resistance';

  beforeEach(() => {
    gamebot = mockGamebot();
    module = resistance(gamebot, false);
    module.reset();
    module.chooseSeeds(3, 3);

    gamebot.simulateMessage('join the resistance', 'u1');
    gamebot.simulateMessage('join the resistance', 'u2');
    gamebot.simulateMessage('join the resistance', 'u3');
    gamebot.simulateMessage('join game', 'u4');
    gamebot.simulateMessage('join spies', 'u5');
    gamebot.simulateMessage('start game', 'u5');
  });

  describe('Assasinations', () => {
    it('should allow the assassin to assassinate the commander', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(response.split(NL)).to.deep.equal([
          `Rico has revealed themself as the Assassin, and has assassinated Claus.`,
          `Claus is revealed to be the Resistance Commander.`,
          `The Resistance Commander has been found, dead. The :bad_guy: Spies win the game.`
        ]);
        expect(target).to.equal('resistance');
        done();
      };
      gamebot.simulateMessage(`assassinate Claus`, 'u5');
    });

    it('should allow the assassin to assassinate non-commanders', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(response.split(NL)).to.deep.equal([
          `Rico has revealed themself as the Assassin, and has assassinated Triela.`,
          `Triela is revealed to be the Resistance Reverser.`,
          `The :good_guy: Resistance win the game.`
        ]);
        expect(target).to.equal('resistance');
        done();
      };
      gamebot.simulateMessage(`assassinate Triela`, 'u5');
    });

    it('should prevent the assassin from assassinating people outside the game', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(response.split(NL)).to.deep.equal([
          `Could not assassinate Angelica, they do not have a role in this game.`
        ]);
        expect(target).to.equal('u5');
        done();
      };
      gamebot.simulateMessage(`assassinate Angelica`, 'u5');
    });

    it('should prevent non-assassins from assassinating people', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(response.split(NL)).to.deep.equal([
          `You are not stealthy enough to be an assassin, go home and learn your craft.`
        ]);
        expect(target).to.equal('u1');
        done();
      };
      gamebot.simulateMessage(`assassinate Triela`, 'u1');
    });
  });
});
