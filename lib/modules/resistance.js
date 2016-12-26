const write = require('promise-path').write;
const read = require('promise-path').read;

const matchers = {
  join: {
    regex: /^(join resistance)$/i,
    handler: join,
    description: 'Join the current game of resistance'
  },
  leave: {
    regex: /^(leave resistance)$/i,
    handler: leave,
    description: 'Leave the current game of resistance'
  },
  remind: {
    regex: /^(resistance role|what's my role)/i,
    handler: remind,
    description: 'Remind you of your current role'
  },
  start: {
    regex: /^(start resistance)$/i,
    handler: start,
    description: 'Start a game of resistance using the registered players'
  },
  stop: {
    regex: /^(stop resistance)$/i,
    handler: stop,
    description: 'Stop the current game and kick all players'
  },
  reset: {
    regex: /^(reset resistance)$/i,
    handler: reset,
    description: 'Reset the current game but keep all players'
  },
  pick: {
    regex: /^resistance pick ([A-z\s,]+)/i,
    handler: pick,
    description: 'Pick players to go on a mission'
  },
  vote: {
    regex: /^resistance vote (accept|reject)$/i,
    handler: vote,
    description: 'Vote on the current pick'
  },
  help: {
    regex: /^(how do I play resistance|resistance help)/i,
    handler: help,
    description: 'Receive help on how to play resistance using gamebot'
  },
  play: {
    regex: /^play resistance (fail|success|reverse)/i,
    handler: play,
    description: 'Secretly play a card for a mission you have been picked on'
  },
  state: {
    regex: /^resistance game state/i,
    handler: reportGameState,
    description: 'Report the current state of the game'
  }
};

function join(api, data) {
  const response = 'JOIN';
  api.respond(data, response);
  recordHistory('player joined game', data);
}

function leave(api, data) {
  const response = 'LEAVE';
  api.respond(data, response);
  recordHistory('player left game', data);
}

function remind(api, data) {
  const response = 'REMIND';
  api.respond(data, response);
}

function start(api, data) {
  const response = 'START';
  api.respond(data, response);
  recordHistory('start game', data);
}

function stop(api, data) {
  const response = 'STOP';
  api.respond(data, response);
  recordHistory('stop game', data);
}

function reset(api, data) {
  const response = 'RESET';
  api.respond(data, response);
  recordHistory('reset game', data);
}

function pick(api, data) {
  const response = 'PICK';
  api.respond(data, response);
  recordHistory('picks received', data);
}

function vote(api, data) {
  const response = 'VOTE';
  api.respond(data, response);
  recordHistory('vote received', data);
}

function help(api, data) {
  const response = 'HELP';
  api.respond(data, response);
}

function play(api, data) {
  const response = 'PLAY';
  api.respond(data, response);
  recordHistory('play', data);
  saveState();
}

function recordHistory(message, data) {
  state.history = state.history || [];
  state.history.push(message);
}

function reportGameState(api, data) {
  const response = 'The current state of the game is: ```' + JSON.stringify(state, null, 2) + '```';
  api.respond(data, response);
}

const statePath = process.cwd() + '/state/resistance-state.json';
const state = {};

// Store data for external viewing
function saveState() {
  const contents = JSON.stringify(state, null, 2);
  write(statePath, contents, 'utf8');
}

// Read state from disk
read(statePath, 'utf8')
  .then(JSON.parse)
  .then((data) => {
    Object.keys(data).forEach((key) => {
      state[key] = data[key];
    });
  })
  .catch((ex) => {
    console.error('Unable to read resistance state', ex);
    console.error(ex.stack);
  });

module.exports = function (api) {
  api.matchers = api.matchers || [];
  Object.keys(matchers).forEach((key) => {
    const matcher = matchers[key];
    api.matchers.push(matcher);
  });
};
