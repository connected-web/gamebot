const glob = require('glob');

// Return a promise; resolve once modules have loaded
module.exports = function(options) {
  const modules = [];

  console.log('TODO: Load and register modules from ./lib/modules/ directory');

  return Promise.resolve(modules);
}
