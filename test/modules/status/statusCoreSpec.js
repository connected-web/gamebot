/* global describe it beforeEach */
const expect = require('chai').expect
const status = require('../../../lib/modules/status/status')
const mockGamebot = require('../../lib/mockGamebot')

describe('Status Module (Core)', function () {
  const statusChannel = 'bot_status'
  let module, gamebot

  beforeEach((done) => {
    gamebot = mockGamebot()
    status(gamebot, false)
      .then((m) => {
        module = m
        module.reset()
        done()
      })
  })

  describe('What version are you?', () => {
    it('should report the version number from package.json back to the user', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.deep.equal(statusChannel)
        expect(response).to.match(/Gamebot is running version: \*\d+\.\d+\.\d+\*\./)
        done()
      }
      gamebot.simulateMessage('what version are you?', 'u1')
    })
  })

  describe('How long have you been running?', () => {
    it('should report the uptime in seconds from package.json back to the user', (done) => {
      gamebot.respond = (target, response, params) => {
        expect(target).to.deep.equal(statusChannel)
        expect(response).to.match(/Gamebot has been running for \d+ seconds./)
        done()
      }
      gamebot.simulateMessage('how long have you been running?', 'u1')
    })
  })
})
