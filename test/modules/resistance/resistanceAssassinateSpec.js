const expect = require('chai').expect;
const resistance = require('../../../lib/modules/resistance');
const mockGamebot = require('../../lib/mockGamebot');
const NL = '\n';

const teamResistance = {
  name: 'Resistance',
  logo: ':good_guy:'
};

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
        expect(module.state.assassinationDisabled).to.equal(true);
        expect(module.state.assassinationSuccessful).to.equal(true);
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
        expect(module.state.assassinationDisabled).to.equal(true);
        expect(module.state.assassinationSuccessful).to.equal(false);
        done();
      };
      gamebot.simulateMessage(`assassinate Triela`, 'u5');
    });

    it('should prevent the assassin from assassinating people outside the game', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(response.split(NL)).to.deep.equal([
          `You cannot assassinate Angelica; they do not have a role in this game.`
        ]);
        expect(target).to.equal('u5');
        expect(module.state.assassinationDisabled).to.equal(false);
        expect(module.state.assassinationSuccessful).to.equal(false);
        done();
      };
      gamebot.simulateMessage(`assassinate Angelica`, 'u5');
    });

    it('should prevent non-assassins from assassinating people', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(response.split(NL)).to.deep.equal([
          `You are not stealthy enough to be an assassin; go home and learn your craft.`
        ]);
        expect(target).to.equal('u1');
        expect(module.state.assassinationDisabled).to.equal(false);
        expect(module.state.assassinationSuccessful).to.equal(false);
        done();
      };
      gamebot.simulateMessage(`assassinate Triela`, 'u1');
    });

    it('should notify assassins that should assassinate after a resistance win', (done) => {
      const resistanceWin = {
        victoriousTeam: teamResistance
      };
      module.state.missionHistory = [resistanceWin, resistanceWin];
      module.state.picks = ['u1', 'u2', 'u3'];
      module.state.votes = {
        'u1': 'accept',
        'u2': 'accept',
        'u3': 'accept',
        'u4': 'accept',
        'u5': 'accept'
      };
      module.state.approved = true;
      gamebot.simulateMessage(`play success`, 'u1');
      gamebot.simulateMessage(`play success`, 'u2');
      var expectedResponses = [
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal(['Thank you Claus, your mission action has been completed.']);
          expect(target).to.equal('u3');
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal(['Claus has completed their mission action.']);
          expect(target).to.equal('resistance');
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal(['Though the resistance has prevailed you are presented the opportunity to assassinate their commander. Use *assassinate Name* to reclaim victory.']);
          expect(target).to.equal('u5');
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal(['All mission actions have been completed; the results are as follows:',
            '>Success (3) :success: :success: :success:',
            'Overall mission status: Resistance :good_guy: victory',
            'Mission Progress: :good_guy: :good_guy: :good_guy: :3: :3:'
          ]);
          expect(target).to.equal('resistance');
          done();
        }
      ];
      gamebot.respond = (target, response, params) => {
        var expectation = expectedResponses.shift();
        (expectation) ? expectation(target, response, params): done(response);
      };
      gamebot.simulateMessage(`play success`, 'u3');
    });
  });
});
