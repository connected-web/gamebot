function reset(model) {

}

function create() {
  let model = {}
  model.reset = (model) => reset(model)
  return model
}

module.exports = create
