const glob = require('glob');

function registerModules(api) {
  const modules = [];

  const files = glob.sync(__dirname + '/modules/**/*.js');
  files.forEach((file) => {
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
