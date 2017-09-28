/* eslint-env mocha */

const mockGamebot = require('./lib/mockGamebot')
const sinon = require('sinon')
const chai = require('chai')
const spies = require('chai-spies')
const restarter = require('../lib/restarter')
chai.use(spies)
chai.should()
const expect = chai.expect

describe('Restarting', () => {
  const statusChannel = 'bot_status'
  let clock, api

  beforeEach(() => {
    api = mockGamebot()
    clock = sinon.useFakeTimers()
    process.exit = chai.spy()
  })

  afterEach(() => {
    clock.restore()
  })

  it('should notify the status channel of the timer after 5 seconds', (done) => {
    restarter.start(api)
    api.respond = (channel, message) => {
      expect(channel).to.equal(statusChannel)
      expect(message).to.equal('Started a restart timer for 60 minutes')
      done()
    }
    clock.tick(5 * 1000)
    expect(process.exit).not.to.have.been.called()
  })

  it('should notify the status channel of a pending restart after an hour', (done) => {
    restarter.start(api)
    api.respond = (channel, message) => {
      api.respond = (channel, message) => {
        expect(channel).to.equal(statusChannel)
        expect(message).to.equal('Restarting the service in 10 seconds!')
        done()
      }
    }
    clock.tick(3600 * 1000)
    expect(process.exit).not.to.have.been.called()
  })

  it('should call process.exit after 1 hour and 10 seconds', () => {
    restarter.start(api)
    clock.tick((3600 + 10) * 1000)
    expect(process.exit).to.have.been.called()
  })
})
