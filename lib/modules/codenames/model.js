function reset(model) {
  model.gameChannel = 'codenames'
  model.players = []
}

function create() {
  let model = {}
  reset(model)
  model.reset = () => reset(model)
  return model
}

module.exports = create
