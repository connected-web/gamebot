const write = require('promise-path').write;
const read = require('promise-path').read;
const NL = '\n';

const matchers = {
  join: {
    regex: /^(join (the )?resistance)/i,
    handler: join,
    description: 'Join the current game of resistance',
    examples: ['join resistance', 'join the resistance']
  },
  leave: {
    regex: /^(leave (the )?resistance)$/i,
    handler: leave,
    description: 'Leave the current game of resistance',
    examples: ['leave resistance', 'leave the resistance']
  },
  remind: {
    regex: /^(resistance role|what's my role)/i,
    handler: remind,
    description: 'Remind you of your current role',
    examples: ['resistance role', 'what\'s my role?']
  },
  start: {
    regex: /^(start resistance)$/i,
    handler: start,
    description: 'Start a game of resistance using the registered players',
    examples: ['start resistance']
  },
  stop: {
    regex: /^(stop resistance)$/i,
    handler: stop,
    description: 'Stop the current game and kick all players',
    examples: ['stop resistance']
  },
  reset: {
    regex: /^(reset resistance)$/i,
    handler: reset,
    description: 'Reset the current game but keep all players',
    examples: ['reset resistance']
  },
  pick: {
    regex: /^resistance pick ([A-z\s,]+)/i,
    handler: pick,
    description: 'Pick players to go on a mission',
    examples: ['resistance pick John, Carrie, Hannah']
  },
  vote: {
    regex: /^resistance vote (accept|reject)$/i,
    handler: vote,
    description: 'Vote on the current pick',
    examples: ['resistance vote accept', 'resistance vote reject']
  },
  help: {
    regex: /^(how do I play resistance|resistance help)/i,
    handler: help,
    description: 'Receive help on how to play resistance using gamebot',
    examples: ['how do I play resistance?', 'resistance help']
  },
  play: {
    regex: /^play resistance (fail|success|reverse)/i,
    handler: play,
    description: 'Secretly play a card for a mission you have been picked on',
    examples: ['play resistance success', 'play resistance fail', 'play resistance reverse']
  },
  state: {
    regex: /^resistance game state/i,
    handler: reportGameState,
    description: 'Report the current state of the game',
    examples: ['resistance game state']
  }
};

function join(api, data) {
  const playerName = api.getUserName(data.user);
  state.players = state.players || [];
  var response = [];
  if(state.players.indexOf(data.user) === -1) {
    state.players.push(data.user);
    response.push(`Welcome to the Resistance ${playerName}.`, `Your assigned code is ${data.user}.`, 'Please await further instructions from command.');
  }
  else {
    response.push(`Friend ${playerName}, you are already part of the Resistance. Your assigned code is ${data.user}.`);
  }
  api.respond(data, response.join(NL));
  recordHistory(`${playerName} joined the game`, data);
}

function leave(api, data) {
  const playerName = api.getUserName(data.user);
  state.players = state.players || [];
  const playerCount = state.players.length;
  state.players = (state.players || []).filter((player) => {
    return player !== data.user;
  });
  const response = (playerCount === state.players.length + 1) ? `Goodbye comrade ${playerName}, until next time.` : `You are not part of the resistance.`;
  api.respond(data, response);
  recordHistory(`${playerName} left the game`, data);
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
  const gamebot = api.options.slackbot.id;
  var response = [`You can use these commands wherever ${gamebot} is present; for sensitive commands please send them directly to ${gamebot} in private chat.`, 'For example:'];
  Object.keys(matchers).forEach((key) => {
    const matcher = matchers[key];
    response.push(`${matcher.description}`);
    matcher.examples.forEach((example) => {
      response.push(`>${example}`);
    });
  });
  api.respond(data, response.join(NL));
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
