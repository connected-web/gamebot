const redis = require('redis')
const client = redis.createClient()

const { promisify } = require('util')

const clientGet = promisify(client.get).bind(client)
const clientSet = promisify(client.set).bind(client)

client.on('error', function (err) {
  console.log('[Redis FS] Error ', err)
})

async function read (key) {
  const value = await clientGet(key)
  return JSON.parse(value)
}

async function write (key, data) {
  const value = JSON.stringify(data)
  return clientSet(key, value)
}

function disconnect () {
  console.log('[Redis FS] Disconnected from Redis FS')
  client.quit()
}

module.exports = {
  read, write, disconnect
}
