const glob = require('glob')
const path = require('path')

function matchers () {
  let result = {}
  const files = glob.sync(path.join(__dirname, 'matchers/*.js'))
  files.forEach((file) => {
    let matcher = require(file)
    if (matcher.regex && matcher.handler) {
      let id = path.basename(file, '.js')
      result[id] = matcher
    } else {
      console.log('Skipping', file, matcher)
    }
  })
  return result
}

module.exports = matchers
