const glob = require('glob');

function isModuleEnabled(file, enabledModules) {
  let result = false;
  enabledModules.forEach((name) => {
    result = result || file.includes(`${name}.js`);
  })
  return result;
}

function registerModules(api) {
  const modules = [];

  const files = glob.sync(__dirname + '/modules/**/*.js');
  files.forEach((file) => {

    if (isModuleEnabled(file, api.options.modules) === false) {
      console.log('Skipping', file, 'not enabled for', api.options.slackbot.name)
      return;
    }

    var error = null;
    var stack = null;
    var module = null;

    console.log('Reading module', file);

    try {
      module = require(file);
    } catch (ex) {
      error = ex;
      stack = ex.stack
    }

    modules.push({
      file,
      module,
      error,
      stack
    });
  });

  return modules;
}

module.exports = function (api) {

  // Return a promise; resolve once modules have loaded
  function load() {
    const modules = registerModules(api);

    api.modules = modules;

    return Promise.resolve(modules);
  }

  return load;
};
