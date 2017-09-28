/* eslint-env mocha */

const sinon = require('sinon')
const chai = require('chai')
const spies = require('chai-spies')
const restarter = require('../lib/restarter')
chai.use(spies)
chai.should()
const expect = chai.expect

describe('Restarting', () => {
  let clock

  beforeEach(() => {
    clock = sinon.useFakeTimers()
    process.exit = chai.spy()
  })

  afterEach(() => {
    clock.restore()
  })

  it('should call process.exit after an hour', () => {
    restarter.start()
    clock.tick(1000 * 60 * 60)
    expect(process.exit).to.have.been.called()
  })
})
