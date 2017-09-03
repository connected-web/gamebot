const { find, write } = require('promise-path')
const path = require('path')

find(path.join(__dirname, '/*.png'))
  .then((files) => {
    return files.map(file => path.basename(file, '.png'))
  })
  .then((filenames) => {
    let emojiIndex = {}
    filenames.forEach((filename) => {
      emojiIndex[filename] = `${filename}.png`
    })
    return emojiIndex
  })
  .then((emojiIndex) => {
    write(path.join(__dirname, 'emojis.json'), JSON.stringify(emojiIndex, null, 2), 'utf8')
  })
  .catch((ex) => {
    console.log('Ex', ex, ex.stack)
  })
