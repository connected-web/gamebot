const packageData = require('../../../package.json')
function reset (model) {
  model.version = packageData.version
}

function create (api) {
  let model = {}
  model.reset = () => reset(model)
  reset(model)

  return Promise.resolve(model)
}

module.exports = create
