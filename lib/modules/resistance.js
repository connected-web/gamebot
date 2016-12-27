const write = require('promise-path').write;
const read = require('promise-path').read;
const NL = '\n';

const team = {
  Resistance: {
    name: 'Resistance',
    logo: ':good_guy:'
  },
  Spies: {
    name: 'Spies',
    logo: ':bad_guy:'
  }
};

const role = {
  SpyReverser: {
    name: 'Spy Reverser',
    team: team.Spies,
    description: 'May only play :success: or :reverse:; known to the Commander. Attempt to fail three missions for your team.',
    knownToCommander: true,
    knownToSpies: true,
    reverser: true,
    knowsSpies: true
  },
  FalseCommander: {
    name: 'False Commander',
    team: team.Spies,
    description: 'May only play :success: or :fail:; appears as the Commander to the Body Guard. Attempt to fail three missions for your team.',
    knownToCommander: true,
    knownToBodyGuard: true,
    knownToSpies: true,
    knowsSpies: true
  },
  Assassin: {
    name: 'Assassin',
    team: team.Spies,
    description: 'May only play :success: or :fail:; has one chance to identify and assasinate the Commander if the Resistance succeeds three missions. Attempt to fail three missions for your team.',
    knownToCommander: true,
    knownToSpies: true,
    assassin: true,
    knowsSpies: true
  },
  HiddenReverser: {
    name: 'Hidden Spy Reverser',
    team: team.Spies,
    description: 'May only play :success: or :reverse:; hidden to the Commander. Attempt to fail three missions for your team.',
    knownToCommander: false,
    reverser: true,
    knowsSpies: true
  },
  DeepCover: {
    name: 'Deep Cover',
    team: team.Spies,
    description: 'May only play :success: or :fail:; hidden to the Commander. Attempt to fail three missions for your team.',
    knownToCommander: false,
    knownToSpies: true,
    knowsSpies: true
  },
  BlindSpy: {
    name: 'Blind Spy',
    team: team.Spies,
    description: 'May only play :success: or :fail:; hidden to their fellow Spies; visible to the Commander. Attempt to fail three missions for your team.',
    knownToCommander: true,
    knownToSpies: true
  },
  RogueSpy: {
    name: 'Rogue Spy',
    team: team.Spies,
    description: 'May only play :success: or :fail:; hidden to everyone. You win if you play :fail: on a third failing mission, and have played at least one :fail: on a prior mission.',
    knownToCommander: false,
    rogue: true
  },
  GenericSpy: {
    name: 'Generic Spy',
    team: team.Spies,
    description: 'May only play :success: or :fail:; known to the Commander. Attempt to fail three missions for your team.',
    knownToCommander: true,
    knownToSpies: true,
    knowsSpies: true
  },
  Rogue: {
    name: 'Rouge',
    team: team.Resistance,
    description: 'May only play :success: or :rogue_success:; hidden to everyone. You win if you play :rogue_success: on a third suceeding mission, and have played at least one :rogue_success: on a prior mission. You cannot play :rogue_success: if you are marked with the :watch: token.',
    knownToCommander: false,
    rogue: true
  },
  GenericResistance: {
    name: 'Generic Resistance',
    team: team.Resistance,
    descrpition: 'May only play :success:. Knows nothing. Attempt to succeed three missions for your team.',
  },
  Commander: {
    name: 'Resistance Commander',
    team: team.Resistance,
    description: 'May only play :success:. Knows most types of spy. Attempt to succeed three missions for your team without revealing your role to the Assassin.',
    knownToBodyGuard: true
  },
  BodyGuard: {
    name: 'Body Guard',
    team: team.Resistance,
    description: 'May only play :success:. Knows the Resistance Commander and the False Commander. Attempt to succeed three missions for your team and protect the Resistance Commander from the Assassin.',
    bodyguard: true
  },
  Reverser: {
    name: 'Resistance Reverser',
    team: team.Resistance,
    description: 'May only play :success: or :reverse:. Knows nothing. Attempt to succeed three missions for your team.',
    reverser: true
  }
};

const roleConfigurations = {
  5: [role.FalseCommander, role.HiddenReverser, role.Commander, role.Reverser, role.GenericResistance],
  6: [role.FalseCommander, role.SpyReverser, role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance],
  7: [role.Assassin, role.SpyReverser, role.FalseCommander, role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance],
  8: [role.FalseCommander, role.SpyReverser, role.BlindSpy, role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance, role.GenericResistance],
  9: [role.FalseCommander, role.SpyReverser, role.DeepCover, role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance, role.GenericResistance, role.GenericResistance],
  10: [role.Assassin, role.SpyReverser, role.DeepCover, role.FalseCommander, role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance, role.GenericResistance, role.GenericResistance]
};

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
    regex: /^(what's my role)/i,
    handler: remind,
    description: 'Remind you of your current role',
    examples: ['what\'s my role?']
  },
  describeRole: {
    regex: /^describe resistance role ([A-z\s]+)/i,
    handler: describeRole,
    description: 'Describe a specific role',
    examples: ['resistance roles for 6 players']
  },
  listRoles: {
    regex: /^resistance roles for (\d|\d\d) players/i,
    handler: listRoles,
    description: 'List the configuration for a number of players',
    examples: ['resistance roles for 6 players']
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
    regex: /^play resistance (fail|success|reverse|rogue success)/i,
    handler: play,
    description: 'Secretly play a card for a mission you have been picked on',
    examples: ['play resistance success', 'play resistance fail', 'play resistance reverse', 'play resistance rogue success']
  },
  listPlayers: {
    regex: /^(who's playing resistance|list resistance players)/i,
    handler: listPlayers,
    description: 'Report players currently registered to play resistance',
    examples: [`who's playing resistance?`, 'list resistance players']
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
  if (state.players.indexOf(data.user) === -1) {
    state.players.push(data.user);
    api.respond(data.user, [`Welcome to the Resistance ${playerName}.`, `Your assigned code is ${data.user}.`, 'Please await further instructions from command.'].join(NL));
    api.respond('resistance', `${playerName} has joined the resistance. There are now ${state.players.length} players.`);
    recordHistory(`${playerName} joined the game`, data);
  } else {
    api.respond(data.user, `Friend ${playerName}, you are already part of the Resistance. Your assigned code is ${data.user}.`);
  }

  saveState();
}

function leave(api, data) {
  const playerName = api.getUserName(data.user);
  state.players = state.players || [];
  const playerCount = state.players.length;
  state.players = (state.players || []).filter((player) => {
    return player !== data.user;
  });
  if (playerCount === state.players.length + 1) {
    api.respond(data, `Goodbye comrade ${playerName}, until next time.`);
    api.respond('resistance', `${playerName} has left the resistance. There are now ${state.players.length} players.`);
    recordHistory(`${playerName} left the game`, data);
    saveState();
  } else {
    api.respond(data, `You are not part of the resistance.`);
  }
}

function remind(api, data) {
  const playerName = api.getUserName(data.user);
  const playerRole = 'unassigned :good_guy: :bad_guy:';
  const response = `${playerName}, your role is... ${playerRole}.`;
  api.respond(data.user, response);
}

function describeRole(api, data) {
  const type = data.text.match(matchers.describeRole.regex)[1];
  const targetRole = lookupRole(type);
  if (targetRole) {
    api.respond(data, [`>${targetRole.name} : Team ${targetRole.team.logo}.`, `>${targetRole.description}`].join(NL));
  } else {
    const types = Object.keys(role).map((key) => {
      return role[key].name;
    });
    api.respond(data, `Did not match role '${type}'. Available types: ${types.join(', ')}`);
  }
}

function lookupRole(type) {
  return role[type] || Object.keys(role).filter((key) => {
    return (role[key].name).toLowerCase() === type.toLowerCase();
  }).map((key) => {
    return role[key];
  })[0];
}

function listRoles(api, data) {
  const count = parseInt(data.text.match(matchers.listRoles.regex)[1]);
  const config = roleConfigurations[count];
  if (config) {
    const roles = config.map((role) => {
      return `${role.team.logo} ${role.name}`;
    });
    api.respond(data, [`The resistance roles for ${count} players are:`, `>${NL}${roles.join(', ')}`].join(NL));
  } else {
    api.respond(data, `No resistance roles are configured for ${count} players.`);
  }
}

function start(api, data) {
  const playerName = api.getUserName(data.user);
  state.roles = assignRoles(state.players);
  if (state.roles) {
    api.respond('resistance', `${playerName} has started the game; all players will shortly receive their roles.`);

    Object.keys(state.roles).forEach((playerId) => {
      var role = state.roles[playerId];
      var name = api.getUserName(playerId);
      api.respond(playerId, `Congratulations ${name} (Citizen ${playerId}) you have been assigned the role of ${role.team.logo} ${role.name} fighting for the ${role.team.name}. ${role.description}`);
      if (role === role.Commander) {
        sendCommanderInstructions(playerId, role);
      }
      if (role.knowsSpies) {
        sendASpyAListOfKnownSpies(playerId, role);
      }
      if (role === role.BodyGuard) {
        sendBodyGuardInstructions(playerId, role);
      }
    });

  } else {
    api.respond('resistance', `${playerName} tried to start the game, but there is no configuration for ${state.players.length} players.`);
  }
  recordHistory('start game', data);
  saveState();
}

function sendCommanderInstructions(playerId, role) {
  api.respond(playerId, `TODO: Send list of spies known to commander (sorry)`);
}

function sendASpyAListOfKnownSpies(playerId, role) {
  api.respond(playerId, `TODO: Send list of known spies to spy (sorry)`);
}

function sendBodyGuardInstructions(playerId, role) {
  api.respond(playerId, `TODO: Send body guard the identies of any commanders (sorry)`);
}

function assignRoles(players) {
  var playerRoles;
  const configuration = roleConfigurations[players.length];
  if (configuration) {
    state.roleSeed = Math.round(Math.random() * 1000) + Date.now();
    state.playerSeed = Math.round(Math.random() * 5000);
    var players = [].concat(state.players);
    playerRoles = {};
    for (var i = 0; i < configuration.length; i++) {
      var role = configuration[(state.roleSeed + i) % configuration.length];
      var player = players[(state.playerSeed + i) % players.length];
      players.splice((state.playerSeed + i) % players.length, 1);
      playerRoles[player] = role;
    }
  } else {
    playerRoles = null;
  }

  return playerRoles;
}

function stop(api, data) {
  const playerName = api.getUserName(data.user);
  const response = `${playerName} has stopped the game; all players have been executed.`;
  api.respond('resistance', response);
  state.players = [];
  state.roles = {};
  state.history = [];
  recordHistory(`${playerName} stopped the game`, data);
  saveState();
}

function reset(api, data) {
  const playerName = api.getUserName(data.user);
  const response = `${playerName} has reset the game.`;
  api.respond('resistance', response);
  state.roles = {};
  state.history = {};
  recordHistory(`${playerName} reset the game`, data);
  saveState();
}

function pick(api, data) {
  const response = 'PICK (stubbed)';
  api.respond(data, response);
  recordHistory('picks received', data);
}

function vote(api, data) {
  const response = 'VOTE (stubbed)';
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
  api.respond(data.user, response.join(NL));
}

function play(api, data) {
  const response = 'PLAY (stubbed)';
  api.respond(data, response);
  recordHistory('play', data);
  saveState();
}

function recordHistory(message, data) {
  state.history = state.history || [];
  state.history.push(message);
}

function listPlayers(api, data) {
  const players = state.players || [];
  if (players.length > 0) {
    const playerNameList = players.map((playerId) => {
      return api.getUserName(playerId);
    });
    api.respond(data, `The current list of players is: ${playerNameList.join(', ')}`);
  } else {
    api.respond(data, 'No one is registered to play resistance at the moment.');
  }
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
