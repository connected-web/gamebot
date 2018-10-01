module.exports = function (api) {
  function handleError (ex) {
    console.error('[Handle Error]', 'Notifying console about a gamebot error', ex.message, ex.stack)
    api.log({
      level: 'error',
      fileLabel: 'Handle Error',
      message: ['Handling a gamebot error', ex.message]
    })
    api.log({
      level: 'debug',
      fileLabel: 'Handle Error',
      message: ['Debugging a gamebot error', ex.message].concat(ex.stack)
    })
  }

  return handleError
}
