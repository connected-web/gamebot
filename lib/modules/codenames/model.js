function reset (model) {
  model.gameChannel = 'codenames'
  model.players = []
  model.teams = [{
    name: 'Blue',
    players: [],
    solitaire: false
  }, {
    name: 'Red',
    players: [],
    solitaire: false
  }]
  model.started = false
}

function create () {
  let model = {}
  reset(model)
  model.reset = () => reset(model)
  return model
}

module.exports = create
