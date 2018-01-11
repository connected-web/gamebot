const redis = require('redis')
// Example: 'rediss://redis-01.l9gh21.0001.usw2.cache.amazonaws.com:6379'
const client = redis.createClient(process.env.REDIS_FILESYSTEM_URL || 'rediss://127.0.0.1:6379')

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
