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
        'u0': 'Test Bot',
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

    gamebot.respond = () => {};
    gamebot.simulateMessage('stop resistance', 'u0');
  });

  it('should repsond to players wanting to stop the current game', (done) => {
    gamebot.respond = (channel, response, params) => {
      expect(channel).to.equal('resistance');
      expect(response).to.equal('Test Bot has stopped the game; all players have been executed.');
      done();
    };
    gamebot.simulateMessage('stop resistance', 'u0');
  });

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
});
