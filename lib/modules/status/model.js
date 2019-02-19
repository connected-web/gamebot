const packageData = require('../../../package.json')
function reset (model) {
  model.statusChannel = 'bot_status'
  model.version = packageData.version
}

function create (api) {
  const now = new Date()
  let model = {
    startTime: now
  }
  model.reset = () => reset(model)
  reset(model)

  return Promise.resolve(model)
}

module.exports = create
