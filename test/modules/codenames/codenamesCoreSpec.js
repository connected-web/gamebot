const expect = require('chai').expect;
const codenames = require('../../../lib/modules/codenames/codenames');
const mockGamebot = require('../../lib/mockGamebot');
const NL = '\n';

describe('Codenames module (Core)', function () {

  var module, gamebot;
  const gameChannel = 'codenames';

  beforeEach(() => {
    gamebot = mockGamebot();
    module = codenames(gamebot, false);
    module.reset();
  });

  describe('Help', () => {
    ['codenames help', 'How do I play codenames?', 'how do I play'].forEach((command) => {
      it('should allow a user to request help on how to play codenames', (done) => {
        gamebot.respond = (target, response, params) => {
          expect(target).to.equal('u1');
          const botname = '@testbot';
          expect(response).to.include(`You can use these commands wherever ${botname} is present; for sensitive commands please send them directly to ${botname} in private chat.`);
          expect(response).to.include(`Provide a list of commands on how to play codenames`);
          expect(response).to.include(`Examples: *codenames help*`);
          done();
        };
        gamebot.simulateMessage(command, 'u1');
      });
    })
  });
});
