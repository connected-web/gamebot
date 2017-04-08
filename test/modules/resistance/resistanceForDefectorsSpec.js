const expect = require('chai').expect;
const resistance = require('../../../lib/modules/resistance');
const mockGamebot = require('../../lib/mockGamebot');
const expectResponses = require('../../lib/expectResponses');
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
      expect(module.state.playerOrder).to.contain('u5');
      expect(module.state.playerOrder).to.contain('u4');
      expect(module.state.playerOrder).to.contain('u3');
      expect(module.state.playerOrder).to.contain('u2');
      expect(module.state.playerOrder).to.contain('u1');
      expect(module.state.playerOrder.length).to.equal(5);
      expect(module.state.turnCounter).to.equal(0);
      done();
    });

    it('should assign roles at the start of a game', (done) => {
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      }, {
        victoriousTeam: ':skip:'
      });
      const expectedResponses = [{
          message: [
            /Non Player has started the game; all players will shortly receive their roles./,
            /Player order is: [A-z]+, [A-z]+, [A-z]+, [A-z]+, then [A-z]+\. \*[A-z]+\* is the first leader\. First mission requires 2 players\. Pick a team using \*pick Name1, Name 2, \.\.\.\*/
          ],
          channel: 'resistance'
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen [u\d]\) you have been assigned the role of :good_guy: Resistance Commander fighting for the Resistance. May only/]
        },
        {
          message: [
            /The following players are known to you as spies:/,
            />:bad_guy: [A-z]+/
          ]
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :good_guy: Resistance Reverser fighting for the Resistance. May only/]
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :good_guy: Generic Resistance fighting for the Resistance. May only/]
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :bad_guy: Assassin fighting for the Spies. May only'/]
        },
        {
          message: [
            /The following players are known to you as spies:/,
            />:bad_guy: [A-z]+/,
            />:bad_guy: [A-z]+/
          ]
        },
        {
          message: [/Congratulations [A-z]+ \(Citizen u\d\) you have been assigned the role of :bad_guy: Hidden Spy Reverser fighting for the Spies. May only/]
        },
        {
          message: [
            /The following players are known to you as spies:/,
            />:bad_guy: [A-z]+/,
            />:bad_guy: [A-z]+/
          ]
        },
        {
          message: [/[A-z]+ you are the leader\. Mission 1 requires 2 players\. Pick a team using \*pick Name1, Name2, \.\.\.\*/]
        }
      ];

      gamebot.respond = expectResponses(expectedResponses, done)

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
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      });
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
      module.state.missionHistory.push({
        victoriousTeam: ':skip:'
      }, {
        victoriousTeam: ':skip:'
      });
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
