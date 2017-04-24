/* global describe it beforeEach */
const expect = require('chai').expect
const api = require('../../lib/api')
const accusation = require('../../lib/modules/accusation/accusation')

describe('Accusation module', function () {
  var gamebot

  beforeEach(() => {
    gamebot = api({
      howl: {
        seed: 1
      }
    })

    gamebot.getUserName = (id) => {
      return 'Accusery Mod'
    }
    accusation(gamebot)
  })

  it('should register a matcher', () => {
    const matcher = gamebot.matchers[0]
    expect(matcher.description).to.equal('Matched an accusation')
    expect(matcher.handler.length).to.equal(2)
    expect(typeof matcher.handler).to.equal('function')
  })

  it('should respond with a random accusation', (done) => {
    const matcher = gamebot.matchers[0]
    gamebot.respond = (channel, response, params) => {
      expect(response).to.include('John is')
      done()
    }
    matcher.handler(gamebot, {
      text: 'accuse John'
    })
  })

  it('should respond with a random accusation in sequence', (done) => {
    const matcher = gamebot.matchers[0]
    gamebot.respond = (channel, response) => {
      gamebot.respond = (channel, response) => {
        expect(response).to.include('Carrie is')
        done()
      }
    }
    matcher.handler(gamebot, {
      text: 'accuse John'
    })
    matcher.handler(gamebot, {
      text: 'accuse Carrie'
    })
  })

  it('should be self aware', (done) => {
    const matcher = gamebot.matchers[0]
    gamebot.respond = (channel, response, params) => {
      expect(response).to.include('I am')
      done()
    }
    matcher.handler(gamebot, {
      text: 'accuse Mr Wolf'
    })
  })
})
