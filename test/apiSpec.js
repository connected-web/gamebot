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

  it('should track an array of matchers', function() {
    expect(api.matchers).to.deep.equal([]);
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
