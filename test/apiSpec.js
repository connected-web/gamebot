/* global describe it beforeEach */
const expect = require('chai').expect
const gamebot = require('../lib/api/api')

function getType (fn) {
  const obj = {}
  return obj.toString.call(fn)
}

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
    expect(getType(api.load)).to.equal('[object Function]')
    expect(api.load.length).to.equal(0)
    expect(typeof api.load).to.equal('function')
  })

  it('should provide a connect method for connecting to slack', () => {
    expect(getType(api.connect)).to.equal('[object Function]')
    expect(api.load.length).to.equal(0)
    expect(typeof api.connect).to.equal('function')
  })

  it('should provide a respond method for responding to messages', () => {
    expect(getType(api.respond)).to.equal('[object Function]')
    expect(api.respond.length).to.equal(3)
    expect(typeof api.respond).to.equal('function')
  })

  it('should provide an error handler', function () {
    expect(getType(api.handleError)).to.equal('[object Function]')
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
