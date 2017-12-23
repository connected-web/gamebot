const fs = require('fs')
const path = require('path')

const wordlists = ['xmas', 'standard']

function readWords (wordlist) {
  wordlist = wordlists.includes(wordlist) ? wordlist : 'standard'
  return fs.readFileSync(path.join(__dirname, `words/${wordlist}.txt`), 'utf8')
    .split('\n')
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
}

module.exports = readWords
