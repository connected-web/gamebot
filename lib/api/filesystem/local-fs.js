const fs = require('fs')
const { promisify } = require('util')

const fsRead = promisify(fs.readFile).bind(fs)
const fsWrite = promisify(fs.writeFile).bind(fs)

async function read (key) {
  const value = await fsRead(key, 'utf8')
  return JSON.parse(value)
}

async function write (key, data) {
  const value = JSON.stringify(data)
  return fsWrite(key, value, 'utf8')
}

function disconnect () {
  console.log('[Local FS] Disconnected from Local FS')
}

module.exports = {
  read, write, disconnect
}
