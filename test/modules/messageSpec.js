/* global describe it beforeEach */
const expect = require('chai').expect
const mockGamebot = require('../lib/mockGamebot')
const howl = require('../../lib/modules/howl/howl')

describe('Messaging', () => {
  var gamebot

  beforeEach(() => {
    gamebot = mockGamebot()
    howl(gamebot)
  })

  it('should respond to messages', (done) => {
    gamebot.respond = (target, response, params) => {
      expect(response).to.deep.equal('Rico~ Hoooowlll')
      expect(target.channel).to.equal('private')
      done()
    }
    gamebot.simulateMessage(`Hoooowlll`, 'u5')
  })

  it('should not respond to itself', (done) => {
    gamebot.respond = (target, response, params) => {
      expect(response).to.deep.equal('Rico~ Hoooowlll')
      expect(target.channel).to.equal('private')
      done()
    }
    gamebot.simulateMessage(`Hoooowlll`, 'ux')
    gamebot.simulateMessage(`Hoooowlll`, 'u5')
  })
})
