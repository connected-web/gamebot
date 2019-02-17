const packageData = require('../../../package.json')
function reset (model) {
  model.statusChannel = 'bot_status'
  model.version = packageData.version
}

function create (api) {
  let model = {
    startTime: Date.now()
  }
  model.reset = () => reset(model)
  reset(model)

  return Promise.resolve(model)
}

module.exports = create
