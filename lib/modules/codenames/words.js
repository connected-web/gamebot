const fs = require('fs')
const path = require('path')

let words = fs.readFileSync(path.join(__dirname, 'words.txt'), 'utf8')
  .split('\n')
  .map((w) => w.trim())
  .filter((w) => w.length > 0)

module.exports = () => [].concat(words)
