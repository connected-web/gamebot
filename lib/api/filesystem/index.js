let fs

if (process.env.USE_REDIS_FILESYSTEM) {
  console.log('[Filesystem Facade] Using Redis FS')
  fs = require('./redis-fs')
} else {
  console.log('[Filesystem Facade] Using Local FS')
  fs = require('./local-fs')
}

function create (api) {
  return fs
}

module.exports = create
