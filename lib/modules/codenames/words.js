const fs = require('fs')
const path = require('path')

function readWords (wordlist) {
  return fs.readFileSync(path.join(__dirname, `words/${wordlist}.txt`), 'utf8')
    .split('\n')
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
}

module.exports = readWords
