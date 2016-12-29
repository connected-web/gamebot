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
  });

  it('should respond to players wanting to join', (done) => {
    gamebot.respond = (channel, response, params) => {
      expect(response).to.equal([`Welcome to the Resistance John.`, `Your assigned code is u1.`, 'Please await further instructions from command.'].join(NL));
      gamebot.respond = (channel, response, params) => {
        expect(response).to.equal(`John has joined the resistance. There are now 1 players.`);
        done();
      }
    };
    gamebot.simulateMessage('join the resistance', 'u1');
  });
});
