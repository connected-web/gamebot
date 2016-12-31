const write = require('promise-path').write;
const read = require('promise-path').read;
const NL = '\n';

const missionActions = require('./resistance/missionActions');
const team = require('./resistance/team');
const role = require('./resistance/role');
const roleConfigurations = require('./resistance/configurations');
var saveData = true;

function grammarList(list) {
  list.sort();
  if (list.length > 1) {
    var end = list[list.length - 1];
    return list.slice(0, -1).join(', ') + ', and ' + end;
  } else if (list.length === 1) {
    return list[0];
  }
  return '';
}

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
    examples: ['describe resistance role Assassin', 'describe resistance role Hidden Spy Reverser']
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
  if (state.players.includes(data.user)) {
    api.respond(data.user, `Friend ${playerName}, you are already part of the Resistance. Your assigned code is ${data.user}.`);
  } else {
    state.players.push(data.user);
    api.respond(data.user, [`Welcome to the Resistance ${playerName}.`, `Your assigned code is ${data.user}.`, 'Please await further instructions from command.'].join(NL));
    api.respond('resistance', `${playerName} has joined the resistance. There are now ${state.players.length} players.`);
    recordHistory(`${playerName} joined the game`, data);
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
  if (state.players && state.players.includes(data.user)) {
    api.respond(data.user, `${playerName}, your role is... ${playerRole}.`);
  } else {
    api.respond(data.user, `${playerName}, you are not part of the resistance. Contact command if you want to join.`);
  }
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
      var playerRole = state.roles[playerId];
      var name = api.getUserName(playerId);
      api.respond(playerId, `Congratulations ${name} (Citizen ${playerId}) you have been assigned the role of ${playerRole.team.logo} ${playerRole.name} fighting for the ${playerRole.team.name}. ${playerRole.description}`);
      if (playerRole === role.Commander) {
        sendCommanderInstructions(api, playerId, role);
      }
      if (playerRole.knowsSpies) {
        sendASpyAListOfKnownSpies(api, playerId, role);
      }
      if (playerRole === role.BodyGuard) {
        sendBodyGuardInstructions(api, playerId, role);
      }
    });

  } else {
    api.respond('resistance', `${playerName} tried to start the game, but there is no configuration for ${state.players.length} players.`);
  }
  recordHistory('start game', data);
  saveState();
}

function sendCommanderInstructions(api, playerId, role) {
  var instructions = ['The following players are known to you as spies:'];
  Object.keys(state.roles).forEach((playerId) => {
    var playerRole = state.roles[playerId];
    if (playerRole.knownToCommander) {
      var playerName = api.getUserName(playerId);
      instructions.push(`>:bad_guy: ${playerName}`);
    }
  });
  api.respond(playerId, instructions.join(NL));
}

function sendASpyAListOfKnownSpies(api, playerId, role) {
  var instructions = ['The following players are known to you as spies:'];
  Object.keys(state.roles).forEach((playerId) => {
    var playerRole = state.roles[playerId];
    if (playerRole.knownToSpies) {
      var playerName = api.getUserName(playerId);
      instructions.push(`>:bad_guy: ${playerName}`);
    }
  });
  api.respond(playerId, instructions.join(NL));
}

function sendBodyGuardInstructions(api, playerId, role) {
  var instructions = ['The following players are known to you as commanders:'];
  Object.keys(state.roles).forEach((playerId) => {
    var playerRole = state.roles[playerId];
    if (playerRole.knownToBodyGuard) {
      var playerName = api.getUserName(playerId);
      instructions.push(`>:bad_guy: ? :good_guy: ${playerName}`);
    }
  });
  api.respond(playerId, instructions.join(NL));
}

function assignRoles(players) {
  var playerRoles;
  const configuration = roleConfigurations[players.length];
  if (configuration) {
    chooseSeeds(state.roleSeed, state.playerSeed);
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
  clearState();
  recordHistory(`${playerName} stopped the game`, data);
  saveState();
}

function reset(api, data) {
  const playerName = api.getUserName(data.user);
  const currentPlayers = state.players.length ? 'Current players are ' + grammarList(state.players.map(api.getUserName)) : ['No players have registered to play'];
  const response = `${playerName} has reset the game. ${currentPlayers}.`;
  api.respond('resistance', response);
  const playersToKeep = [].concat(state.players);
  clearState();
  state.players = playersToKeep;
  recordHistory(`${playerName} reset the game`, data);
  saveState();
}

function pick(api, data) {
  const playerName = api.getUserName(data.user);
  const names = data.text.match(matchers.pick.regex)[1].split(',').map((name) => {
    return (name + '').trim();
  });

  const unmatched = [];
  state.approved = false;
  state.plays = {};
  state.picks = names.map((name) => {
    return api.findUserByName(name) || {
      name
    };
  }).filter((user) => {
    if (user.id && state.players.includes(user.id)) {
      return true;
    }
    unmatched.push(user.name);
    return false;
  }).map((user) => {
    return user.id;
  });

  const pickedNames = state.picks.map((userId) => {
    return api.getUserName(userId);
  });

  if (unmatched.length > 0) {
    state.picks = [];
    api.respond('resistance', `Some of the picks were not recognised as players; ${grammarList(unmatched)}.`);
    recordHistory('picks rejected : ' + unmatched, data);
  } else {
    api.respond('resistance', `${playerName} has picked ${grammarList(pickedNames)} to go on the next mission.`);
    recordHistory('picks set to ' + pickedNames, data);
    state.players.forEach((playerId) => {
      api.respond(playerId, [`${playerName} has picked ${grammarList(pickedNames)} to go on the next mission.`, `Please vote by responding with *resistance vote accept* or *resistance vote reject*`].join(NL));
    });
    recordHistory('players notified ' + state.players, data);
  }
}

function vote(api, data) {
  const vote = data.text.match(matchers.vote.regex)[1];
  if (state.picks.length === 0) {
    api.respond(data.user, `Unable to accept your vote, no valid pick has been made yet.`);
    return;
  }

  state.votes[data.user] = (vote + '').toLowerCase();

  const playerName = api.getUserName(data.user);
  const missingVotes = state.players.length - Object.keys(state.votes).length;
  if (missingVotes > 0) {
    api.respond('resistance', `${playerName} has voted, ${missingVotes} players remaining.`);
  } else {
    api.respond('resistance', `${playerName} has voted, no players remaining.`);
    const votesFor = [];
    const votesAgainst = [];
    Object.keys(state.votes).forEach((playerId) => {
      const name = api.getUserName(playerId);
      return (state.votes[playerId] === 'accept') ? votesFor.push(name) : votesAgainst.push(name);
    });

    if (votesFor.length > votesAgainst.length) {
      api.respond('resistance', `Mission Approved! ${votesFor.length} votes (${votesFor.join(', ')}), ${votesAgainst.length} rejects (${votesAgainst.join(', ')}).`);
      state.approved = true;
    } else {
      api.respond('resistance', `Mission Rejected! ${votesFor.length} votes (${votesFor.join(', ')}), ${votesAgainst.length} rejects (${votesAgainst.join(', ')}).`);
      state.approved = false;
    }
    state.votes = {};
  }
  recordHistory(`vote received from ${data.user}`, data);
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
  if (state.players.includes(data.user) === false) {
    api.respond(data.user, `Unable to accept your mission action; you are not part of the current game.`);
  } else if (state.approved === false) {
    api.respond(data.user, `Unable to accept your mission action; no mission has been approved yet.`);
  } else if (state.picks.includes(data.user) === false) {
    api.respond(data.user, `Unable to accept your mission action; you are not part of the approved mission.`);
  } else if (state.plays[data.user]) {
    api.respond(data.user, `Unable to accept your mission action; your mission action has already completed.`);
  } else {
    const playerName = api.getUserName(data.user);
    const playAction = (data.text.match(matchers.play.regex)[1] + '').toLowerCase();
    state.plays[data.user] = playAction;
    api.respond(data.user, `Thank you ${playerName}, your mission action has been completed.`);
    api.respond('resistance', `${playerName} has completed their mission action.`);
    recordHistory(`${data.user} played ${playAction}`, data);
    checkForCompleteMission(api, data);
    saveState();
  }
}

function checkForCompleteMission(api, data) {
  if (Object.keys(state.plays).length !== Object.keys(state.picks).length) {
    return;
  }
  const responses = [`All mission actions have been completed; the results are as follows:`];
  const playResults = {};
  Object.keys(state.plays).forEach((userId) => {
    const playAction = state.plays[userId];
    playResults[playAction] = (playResults[playAction] || 0) + 1;
  });

  Object.keys(missionActions).forEach((playAction) => {
    const playCount = playResults[playAction] || 0;
    const action = missionActions.getAction(playAction);
    const cards = [];
    for (var i = 0; i < playCount; i++) {
      cards.push(action.icon);
    }
    if (playCount > 0) {
      responses.push(`>${action.name} (${playCount}) ${cards.join(' ')}`);
    }
  });

  const success = calculateMissionSuccess(playResults);
  const victoriousTeam = (success) ? team.Resistance : team.Spies;

  responses.push(`Overall mission status: ${victoriousTeam.name} ${victoriousTeam.logo} victory`)

  api.respond('resistance', responses.join(NL));
}

function calculateMissionSuccess(playResults) {
  var success = true;
  if (playResults.fail) {
    success = false;
  }
  if (playResults.reverse) {
    for (var j = 0; j < playResults.reverse; j++) {
      success = !success;
    }
  }
  return success;
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
    api.respond(data, 'No one is currently registered to play resistance.');
  }
}

function reportGameState(api, data) {
  const response = 'The current state of the game is: ```' + JSON.stringify(state, null, 2) + '```';
  api.respond(data, response);
}

function clearState() {
  state.roles = {};
  state.votes = {};
  state.history = [];
  state.picks = [];
  state.approved = false;
  state.plays = {};
  state.roleSeed = 0;
  state.playerSeed = 0;
  state.players = [];
}

const statePath = process.cwd() + '/state/resistance-state.json';
const state = {};
clearState();

// Store data for external viewing
function saveState() {
  if (saveData) {
    const contents = JSON.stringify(state, null, 2);
    write(statePath, contents, 'utf8');
  }
}

function chooseSeeds(roleSeed = 0, playerSeed = 0) {
  state.roleSeed = roleSeed || Math.round(Math.random() * 1000) + Date.now();
  state.playerSeed = playerSeed || Math.round(Math.random() * 5000);
}

module.exports = function (api, saveToDisk = true) {

  // Allow this feature to be disabled
  saveData = saveToDisk;

  // Module API
  const resistance = {
    saveState,
    chooseSeeds,
    state,
    reset: clearState
  };

  api.matchers = api.matchers || [];
  Object.keys(matchers).forEach((key) => {
    const matcher = matchers[key];
    api.matchers.push(matcher);
  });

  // Read state from disk
  if (saveData) {
    var ready = read(statePath, 'utf8')
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

    resistance.ready = ready.then(() => resistance);
  } else {
    resistance.ready = Promise.resolve(resistance);
  }

  return resistance;
};
