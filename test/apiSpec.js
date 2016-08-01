const expect = require('chai').expect;

const gamebot = require('../lib/api');
const sampleOptions = {
  slackbot: {
    token: 'some slack api token',
    name: 'Bot Name',
    id: '@thebotid',
  },
  message: {
    params: {
      icon_url: 'https://some/icon/url'
    }
  }
};

describe('Gamebot API', function() {

  beforeEach(() => {
    api = gamebot(sampleOptions);
  });

  it('should track an array of matchers', () => {
    expect(api.matchers).to.deep.equal([]);
  });

  it('should record options on the api', () => {
    expect(api.options).to.deep.equal(sampleOptions);
  });

  xit('should provide a load method for loading modules', () => {

  });

  xit('should provide a connect method for connecting to slack', () => {

  });

  xit('should provide a respond method for responding to messages', () => {

  });

  xit('should provide an error handler', function() {

  });

/*
  api.bot = null;
  api.matchers = [];
  api.options = options;
  api.load = load(api);
  api.connect = connect(api);
  api.respond = respond(api);
  api.handleError = handleError(api);
  */
});
