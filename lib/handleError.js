module.exports = function (api) {
  function handleError (e) {
    console.log('Gamebot Error', e)
    console.error(e.stack)
  }

  return handleError
}
