const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const startTime = Date.now()

// Create a file to stream archive data to.
const outputPath = path.join(__dirname, '../gamebot.zip')
const output = fs.createWriteStream(outputPath)
const archive = archiver('zip', {
  zlib: { level: 9 }
})

// Listen for all archive data to be written
// close event is fired only when a file descriptor is involved
output.on('close', function () {
  console.log('File size', archive.pointer(), 'total bytes archived')
  const endTime = Date.now()

  console.log('Total time:', ((endTime - startTime) / 1000).toFixed(2), 's')
})

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function () {
  console.log('Data has been drained')
})

// Catch warnings, e.g. stat failures and other non-blocking errors
archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
        // log warning
  } else {
        // throw error
    throw err
  }
})

// Catch and rethrow errors explicitly
archive.on('error', function (err) {
  throw err
})

console.log('Creating output zip:', outputPath)

// Pipe archive data to the file
archive.pipe(output)

// append files from a sub-directory, putting its contents at the root of archive
archive.directory('emojis/', 'emojis/')
archive.directory('src/', 'src/')
archive.directory('lib/', 'lib/')
archive.directory('node_modules/', 'node_modules/')
archive.directory('records/', 'records/')
archive.directory('users/', 'users/')
archive.directory('website/', 'website/')
archive.file('index.js', { name: 'index.js' })
archive.file('tokens.js', { name: 'tokens.js' })
archive.file('gamebot.env.example', { name: 'gamebot.env.example' })
archive.file('package.json', { name: 'package.json' })
archive.file('README.md', { name: 'README.md' })

// Finalize the archive when we are done appending files but streams have to finish yet
// 'close', 'end' or 'finish' may be fired right after calling this method so they should be registered beforehand
archive.finalize()
