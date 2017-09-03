const { find, write } = require('promise-path')
const path = require('path')
const handlebars = require('handlebars')

const readmeTemplate = handlebars.compile(`# Gamebot Custom Emojis

Gamebot comes with a set of custom emojis which make the games easier to play and look at.

At present, the best way to create these is using a Chrome Plugin named [Bulk Emoji Uploader](https://chrome.google.com/webstore/detail/slack-emoji-tools/anchoacphlfbdomdlomnbbfhcmcdmjej), using this plugin you can drag all the emoji icons in this folder into the uploader.

## Emojis

Here is a list of all the emojis in use by the gamebot games:

{{#each emojis}}
### <img src=./{{this}}" alt="{{@key}}" width="48"> :{{@key}}:
{{/each}}
`)


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
    write(path.join(__dirname, 'README.md'), readmeTemplate({emojis: emojiIndex}), 'utf8')
  })
  .catch((ex) => {
    console.log('Ex', ex, ex.stack)
  })
