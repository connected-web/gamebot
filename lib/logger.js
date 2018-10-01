const path = require('path')
const { createLogger, format, transports } = require('winston')
const { combine, printf } = format
const date = (new Date()).toISOString().substr(0, 10)

function expandJSON (message) {
  message = typeof message.join === 'function' ? message : [message]
  message = message.map(safeStringify)
  return message.join(' ')
}

function safeStringify (value) {
  try {
    return JSON.stringify(value)
  } catch (ex) {
    return `[Object ${ex}]`
  }
}

const logFormatter = printf(info => {
  const now = new Date()
  info.message = expandJSON(info.message)
  info.timestamp = now.toISOString().substring(0, 19).replace('T', ' ')
  return `${info.timestamp} [${info.fileLabel}] ${info.level}: ${info.message}`
})

function create (logpath) {
  const logger = createLogger({
    transports: [
      new transports.Console(),
      new transports.File({
        filename: path.join(logpath, `gamebot-${date}.log`)
      })
    ],
    format: combine(
      logFormatter
    )
  })
  return logger
}

module.exports = create
