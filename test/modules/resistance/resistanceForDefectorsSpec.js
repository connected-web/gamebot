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
    gamebot.simulateMessage('set roles Assassin, Spy Defector, Resistance Defector, Body Guard, Commander');
  });

  describe('Role Assignment', () => {
    it('should assign a player order at the start of a game', (done) => {
      gamebot.respond = (target, response, params) => {};
      gamebot.simulateMessage('start resistance', 'u0');
      expect(module.state.playerOrder).to.deep.equal(['u5', 'u3', 'u4', 'u2', 'u1']);
      expect(module.state.turnCounter).to.equal(0);
      done();
    });

    it('should assign roles at the start of a game', (done) => {
      module.state.missionHistory.push({victoriousTeam: ':skip:'}, {victoriousTeam: ':skip:'});

      const expectedResponses = [
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            `Non Player has started the game; all players will shortly receive their roles.`,
            `Player order is: John, Rico, Triela, Henrietta, then Claus. *John* is the first leader. First mission requires 2 players. Pick a team using *pick Name1, Name 2, ...*`
          ]);
          expect(target).to.equal('resistance');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Claus (Citizen u3) you have been assigned the role of :bad_guy: Assassin fighting for the Spies. May only');
          expect(target).to.equal('u3');
        },
        (target, response, params) => {
          expect(response).to.include('The following players are known to you as spies:');
          expect(response).to.include('>:bad_guy: Claus');
          expect(response).to.include('>:bad_guy: Henrietta');
          expect(target).to.equal('u3');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Henrietta (Citizen u2) you have been assigned the role of :bad_guy: Spy Defector fighting for the Spies. May only');
          expect(target).to.equal('u2');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Triela (Citizen u4) you have been assigned the role of :good_guy: Resistance Defector fighting for the Resistance. May only');
          expect(target).to.equal('u4');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations Rico (Citizen u5) you have been assigned the role of :good_guy: Body Guard fighting for the Resistance. May only');
          expect(target).to.equal('u5');
        },
        (target, response, params) => {
          expect(response).to.include('The following players are known to you as commanders:\n>:bad_guy: ? :good_guy: John');
          expect(target).to.equal('u5');
        },
        (target, response, params) => {
          expect(response).to.include('Congratulations John (Citizen u1) you have been assigned the role of :good_guy: Resistance Commander fighting for the Resistance. May only');
          expect(target).to.equal('u1');
        },
        (target, response, params) => {
          expect(response.split(NL)).to.deep.equal([
            'The following players are known to you as spies:',
            '>:bad_guy: Claus',
            '>:bad_guy: Henrietta'
          ]);
          expect(target).to.equal('u1');
        },
        (target, response, params) => {
          expect(response).to.equal('John you are the leader. Mission 3 requires 2 players. Pick a team using *pick Name1, Name2, ...*');
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
  });

  describe('Allegiance changes', () => {

    it('should shuffle defector cards at the start if the game', (done) => {
      expect(module.state.defectorCards).to.deep.equal([]);
      gamebot.simulateMessage('start resistance', 'u0');

      expect(module.state.defectorCards).to.deep.equal(['no change', 'change allegiance', 'no change', 'no change', 'change allegiance']);
      done();
    });

    it('should notify players of no-allegiange changes', (done) => {
      module.state.missionHistory.push({victoriousTeam: ':skip:'});
      gamebot.simulateMessage('start resistance', 'u0');
      gamebot.simulateMessage('pick John, Triela, Rico', 'u1');
      gamebot.simulateMessage('vote accept', 'u1');
      gamebot.simulateMessage('vote accept', 'u2');
      gamebot.simulateMessage('vote accept', 'u3');
      gamebot.simulateMessage('vote accept', 'u4');
      gamebot.simulateMessage('vote accept', 'u5');
      gamebot.simulateMessage('play success', 'u1');
      gamebot.simulateMessage('play success', 'u4');
      const responses = [];
      gamebot.respond = (target, response, params) => {
        responses.push(response);
      };
      gamebot.simulateMessage('play success', 'u5');

      expect(responses.join(NL)).to.include('Defector allegiance: no change');
      expect(responses.join(NL)).to.include('There has been no change to your allegiance.');

      expect(module.state.defectorCards).to.deep.equal(['change allegiance', 'no change', 'change allegiance', 'no change']);
      done();
    });

    it('should notify players of allegiance changes', (done) => {
      module.state.missionHistory.push({victoriousTeam: ':skip:'}, {victoriousTeam: ':skip:'});
      gamebot.simulateMessage('start resistance', 'u0');
      gamebot.simulateMessage('pick Rico, Triela', 'u5');
      gamebot.simulateMessage('vote accept', 'u1');
      gamebot.simulateMessage('vote accept', 'u2');
      gamebot.simulateMessage('vote accept', 'u3');
      gamebot.simulateMessage('vote accept', 'u4');
      gamebot.simulateMessage('vote accept', 'u5');
      gamebot.simulateMessage('play success', 'u5');

      const responses = [];
      gamebot.respond = (target, response, params) => {
        responses.push(response);
      };
      gamebot.simulateMessage('play success', 'u4');

      expect(responses.join(NL)).to.include('Defector allegiance: change allegiance');
      expect(responses.join(NL)).to.include('Your allegiance has changed; you are now fighting for the other team.');

      expect(module.state.defectorCards).to.deep.equal(['change allegiance', 'no change', 'no change', 'no change']);
      done();
    });
  });
});
