const expect = require('chai').expect;
const api = require('../../lib/api');
const howl = require('../../lib/modules/howl');

describe('Howl module', function() {

  var module, gamebot;

  beforeEach(() => {
    gamebot = api({
      howl: {
        seed: 1
      }
    });

    gamebot.getUserById = (id) => {
      return {
        name: 'Howl Spec'
      };
    }
    module = howl(gamebot);
  });

  it('should register a matcher', () => {
    const matcher = gamebot.matchers[0];
    expect(matcher.description).to.equal('Matched a howler');
    expect(matcher.handler.length).to.equal(2);
    expect(typeof matcher.handler).to.equal('function');
  });

  it('should respond with a howl', (done) => {
    const matcher = gamebot.matchers[0];
    gamebot.respond = (channel, response, params) => {
      expect(response).to.equal('Aawwwwooooh!');
      done();
    };
    matcher.handler(gamebot, {});
  });

  it('should respond with the next howl in sequence', (done) => {
    const matcher = gamebot.matchers[0];
    gamebot.respond = (channel, response) => {
      gamebot.respond = (channel, response) => {
        expect(response).to.equal('Snarl.');
        done();
      }
    };
    matcher.handler(gamebot, {});
    matcher.handler(gamebot, {});
  });
});
