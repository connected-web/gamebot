var SlackBot = require('slackbots');

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function registerModules(modules, api) {
  modules.forEach((item) => {

    if (!isFunction(item.module)) {
      console.log('Unable to register module:', item.file, ': module not recognised as function.')
      return;
    }

    if (item.error === null) {
      try {
        item.module(api);
      } catch (ex) {
        item.error = ex;
        item.stack = ex.stack;
      }
    }

    if (item.error) {
      console.log('Unable to register module:', item.file);
      console.error('Error', item.error);
      console.error(item.stack);
    } else {
      console.log('Registered module:', item.file);
    }
  });
}

module.exports = function (api) {

  const options = api.options;

  // Return a promise; resolve once connected to slack
  function connect() {

    // Create the bot
    // Needs to be set up at https://my.slack.com/services/new/bot - and set your token locally
    api.bot = new SlackBot(options.slackbot);

    console.log('Connecting using ', api.options.slackbot);

    // Resolve the promise on connect
    const promise = new Promise((resolve, reject) => {

      // Start the bot up
      api.bot.on('start', function () {

        console.log('Slackbot connected');

        const modules = api.modules || [];

        registerModules(modules, api);

        resolve(api.bot);
      });
    });

    return promise;
  }

  return connect;
};
