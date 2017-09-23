const expect = require('chai').expect
const NL = '\n'

function createResponse (message, channel) {
  return {
    message: [message],
    channel
  }
}

function expectResponses (expectedResponses, done) {
  const receivedMessages = []
  const timeout = setTimeout(() => {
    const error = ['[TIMEOUT] Unmatched respones:'].concat(expectedResponses.map((r) => r.message)).concat(receivedMessages).join(NL)
    console.log(error)
    done(error)
  }, 1000)
  return (target, response, params) => {
    const actual = {
      message: response,
      channel: target
    }
    receivedMessages.push(`${target}: ${response}`)
    const checkedResponses = []
    const startCount = expectedResponses.length
    if (startCount === 0) {
      clearTimeout(timeout)
      return done(response)
    }
    // search for a match
    while (expectedResponses.length > 0) {
      // check each response
      const expected = expectedResponses.shift()
      if (checkMessage(actual.message, expected.message) && checkChannel(actual.channel, expected.channel)) {
        // console.log('Matched', actual.message, 'to', expected.message)
        move(expectedResponses).to(checkedResponses)
      } else {
        // store unused responses
        checkedResponses.push(expected)
      }
    }
    // check for no match
    if (startCount === checkedResponses.length) {
      console.error('[MISSING] No message match found for:', JSON.stringify(actual.message))
      console.error('Unmatched responses:', checkedResponses.length, checkedResponses)
      expect('No message match found for').to.equal(actual.message)
    }
    // check for completion
    if (startCount === 1 && checkedResponses.length === 0) {
      clearTimeout(timeout)
      return done()
    }
    // reset items
    move(checkedResponses).to(expectedResponses)
  }
}

function move (a) {
  function to (b) {
    while (a.length > 0) {
      let item = a.shift()
      b.push(item)
    }
  }
  return {
    to
  }
}

function checkMessage (string, matchers) {
  var result = false
  matchers.forEach((matcher) => {
    result = result || matcher.test(string)
  })
  return result
}

function checkChannel (actual, expected) {
  if (!expected || !actual) {
    return true
  }
  return actual === expected || actual.channel === expected || actual.user === expected
}

expectResponses.createResponse = createResponse

module.exports = expectResponses
