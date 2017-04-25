/* global describe it beforeEach */
const expect = require('chai').expect
const gamebot = require('../lib/api/api')

describe('Gamebot API', function () {
  var api
  const sampleOptions = {
    slackbot: {
      token: 'some slack api token',
      name: 'Bot Name',
      id: '@thebotid'
    },
    message: {
      params: {
        icon_url: 'https://some/icon/url'
      }
    }
  }

  beforeEach(() => {
    api = gamebot(sampleOptions)
  })

  it('should track an array of matchers', () => {
    expect(api.matchers).to.deep.equal([])
  })

  it('should record options on the api', () => {
    expect(api.options).to.deep.equal(sampleOptions)
  })

  it('should provide a load method for loading modules', () => {
    expect(api.load.length).to.equal(0)
    expect(typeof api.load).to.equal('function')
  })

  it('should provide a connect method for connecting to slack', () => {
    expect(api.connect.length).to.equal(0)
    expect(typeof api.connect).to.equal('function')
  })

  it('should provide a respond method for responding to messages', () => {
    expect(api.respond.length).to.equal(3)
    expect(typeof api.respond).to.equal('function')
  })

  it('should provide an error handler', function () {
    expect(api.handleError.length).to.equal(1)
    expect(typeof api.handleError).to.equal('function')
  })

  /*
    api.bot = null;
    api.matchers = [];
    api.options = options;
    api.load = load(api);
    api.connect = connect(api);
    api.respond = respond(api);
    api.handleError = handleError(api);
    */
})
