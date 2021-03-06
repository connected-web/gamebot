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
    const error = ['[TIMEOUT] Expected response not received:']
      .concat(receivedMessages)
      .concat('Unmatched responses: ' + expectedResponses.length)
      .concat(expectedResponses.map((r) => r.message))
      .join(NL)
    console.log(error)
    done(error)
  }, 1000)
  return (channel, message, params) => {
    const actual = {
      channel: channel,
      message: message
    }
    receivedMessages.push(JSON.stringify({ channel, message }))
    const checkedResponses = []
    const startCount = expectedResponses.length
    if (startCount === 0) {
      clearTimeout(timeout)
      return done(`Unexpected response: ${message}, ${channel}`)
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
      clearTimeout(timeout)
      const error = ['[MISSING] No message match found for:']
        .concat(JSON.stringify(actual))
        .concat('Unmatched responses: ' + checkedResponses.length)
        .concat(checkedResponses.map((r) => r.message))
        .join(NL)
      console.error(error)
      done(error)
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
