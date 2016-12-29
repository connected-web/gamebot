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

  it('should respond to players who want to leave', (done) => {
    // Add users
    gamebot.simulateMessage('join the resistance', 'u1');
    gamebot.simulateMessage('join the resistance', 'u2');
    gamebot.simulateMessage('join the resistance', 'u3');
    // Then start listening
    gamebot.respond = (target, response, params) => {
      expect(target.channel).to.equal('sameChannel');
      expect(response).to.equal(`Goodbye comrade Henrietta, until next time.`);
      gamebot.respond = (channel, response, params) => {
        expect(channel).to.equal('resistance');
        expect(response).to.equal('Henrietta has left the resistance. There are now 2 players.');
        done();
      };
    };
    // Remove user
    gamebot.simulateMessage('leave the resistance', 'u2', 'sameChannel');
  });

  it('should be able to remind players that they have no role assigned', (done) => {
    // Add users
    gamebot.simulateMessage('join the resistance', 'u1');
    // Then start listening
    gamebot.respond = (target, response, params) => {
      expect(target).to.equal('u1');
      expect(response).to.equal(`John, your role is... unassigned :good_guy: :bad_guy:.`);
      done();
    };
    // Remove user
    gamebot.simulateMessage(`What's my role?`, 'u1');
  });

  it('should be able to remind players that are not even playing', (done) => {
    // Then start listening
    gamebot.respond = (target, response, params) => {
      expect(target).to.equal('u1');
      expect(response).to.equal(`John, you are not part of the resistance. Contact command if you want to join.`);
      done();
    };
    // Remove user
    gamebot.simulateMessage(`What's my role?`, 'u1');
  });

  it('should be able to describe a given role', (done) => {
    // Then start listening
    gamebot.respond = (target, response, params) => {
      expect(target.channel).to.equal('sameChannel');
      expect(response).to.equal(['>Hidden Spy Reverser : Team :bad_guy:.', '>May only play :success: or :reverse:; hidden to the Commander. Attempt to fail three missions for your team.'].join(NL));
      done();
    };
    // Remove user
    gamebot.simulateMessage(`describe resistance role hidden spy reverser`, 'u1', 'sameChannel');
  });

  it('should list available roles if a given role is not found', (done) => {
    // Then start listening
    gamebot.respond = (target, response, params) => {
      expect(target.channel).to.equal('sameChannel');
      expect(response).to.equal(`Did not match role 'Hidden Backstabber Captain'. Available types: Spy Reverser, False Commander, Assassin, Hidden Spy Reverser, Deep Cover, Blind Spy, Rogue Spy, Generic Spy, Rouge, Generic Resistance, Resistance Commander, Body Guard, Resistance Reverser`);
      done();
    };
    // Remove user
    gamebot.simulateMessage(`describe resistance role Hidden Backstabber Captain`, 'u1', 'sameChannel');
  });
});
