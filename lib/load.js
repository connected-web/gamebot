const glob = require('glob');

module.exports = function(api) {

  // Return a promise; resolve once modules have loaded
  function load() {
    const modules = [];

    console.log('TODO: Load and register modules from ./lib/modules/ directory');

    return Promise.resolve(modules);
  }

  return load;
};
