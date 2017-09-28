/* global describe it */
const chai = require('chai')
const spies = require('chai-spies')
const restarter = require('../lib/restarter')
chai.use(spies)
chai.should()
const expect = chai.expect

describe('Restarting', () => {
  it('should have a start function', () => {
    expect(typeof restarter.start).to.equal('function')
  })
  it('should call process.exit after an hour', () => {
    process.exit = chai.spy()
    restarter.start()
    expect(process.exit).to.have.been.called()
  })
})
