const glob = require('glob')
const path = require('path')

function isModuleEnabled (file, enabledModules) {
  let result = false
  enabledModules.forEach((name) => {
    result = result || file.includes(`${name}.js`)
  })
  return result
}

function registerModules (api) {
  const modules = []

  const files = glob.sync(path.join(__dirname, '../modules/**/*.js'))
  files.forEach((file) => {
    if (isModuleEnabled(file, api.options.modules) === false) {
      // console.log('Skipping', file, 'not enabled for', api.options.slackbot.name)
      return
    }

    let error = null
    let stack = null
    let module = null

    console.log(`[${api.options.slackbot.name}]`, 'Reading module', file)

    try {
      module = require(file)
    } catch (ex) {
      error = ex
      stack = ex.stack
    }

    modules.push({
      file,
      module,
      error,
      stack
    })
  })

  console.log(`[${api.options.slackbot.name}]`, 'Found', modules.length, 'modules total to check.')

  return modules
}

module.exports = function (api) {
  // Return a promise; resolve once modules have loaded
  function load () {
    const modules = registerModules(api)

    api.modules = modules

    return Promise.resolve(modules)
  }

  return load
}
