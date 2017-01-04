const write = require('promise-path').write;
const read = require('promise-path').read;
const NL = '\n';

const missionActions = require('./resistance/missionActions');
const team = require('./resistance/team');
const role = require('./resistance/role');
const roleConfigurations = require('./resistance/configurations');
var saveData = true;

function grammarList(list, clause = 'and', sort = true) {
  if (sort) {
    list.sort();
  }
  if (list.length > 1) {
    var end = list[list.length - 1];
    return list.slice(0, -1).join(', ') + `, ${clause} ` + end;
  } else if (list.length === 1) {
    return list[0];
  }
  return '';
}

const gameChannel = 'resistance';
const matchers = {
  join: {
    regex: /^(join (the )?resistance|join spies|join game)/i,
    channels: ['private', gameChannel],
    handler: join,
    description: 'Join the current game of resistance',
    examples: ['join game', 'join resistance', 'join the resistance']
  },
  leave: {
    regex: /^(leave (the )?resistance|leave game)$/i,
    channels: ['private', gameChannel],
    handler: leave,
    description: 'Leave the current game of resistance',
    examples: ['leave game', 'leave resistance', 'leave the resistance']
  },
  remind: {
    regex: /^(what's my role\??|what is my role\??|resistance (current )?role)$/i,
    channels: ['private', gameChannel],
    handler: remind,
    description: 'Remind you of your current role',
    examples: ['what\'s my role?', 'what is my role?', 'resistance role']
  },
  describeRole: {
    regex: /^(describe )?resistance role ([A-z\s]+)/i,
    channels: ['private', gameChannel],
    handler: describeRole,
    description: 'Describe a specific role',
    examples: ['describe resistance role Assassin', 'describe resistance role Hidden Spy Reverser']
  },
  listRoles: {
    regex: /^resistance roles for (\d|\d\d) players/i,
    channels: ['private', gameChannel],
    handler: listRoles,
    description: 'List the configuration for a number of players',
    examples: ['resistance roles for 6 players']
  },
  start: {
    regex: /^(start game|start resistance|resistance start)$/i,
    channels: ['private', gameChannel],
    handler: start,
    description: 'Start a game of resistance with the registered players',
    examples: ['start game', 'start resistance', 'resistance start']
  },
  stop: {
    regex: /^(stop game|resistance stop|stop resistance)$/i,
    channels: ['private', gameChannel],
    handler: stop,
    description: 'Stop the current game and kick all players',
    examples: ['stop game', 'resistance stop', 'stop resistance']
  },
  reset: {
    regex: /^(reset game|reset resistance|resistance reset)$/i,
    channels: ['private', gameChannel],
    handler: reset,
    description: 'Reset the current game but keep all players',
    examples: ['reset game', 'resistance reset', 'reset resistance']
  },
  pick: {
    regex: /^(resistance )?pick ([A-z\s,]+)/i,
    channels: ['private', gameChannel],
    handler: pick,
    description: 'Pick players to go on a mission',
    examples: ['pick John, Carrie, Hannah', 'pick Emma, Sunil']
  },
  vote: {
    regex: /^vote (accept|reject)$/i,
    channels: ['private', gameChannel],
    handler: vote,
    description: 'Vote on the current pick',
    examples: ['vote accept', 'vote reject']
  },
  help: {
    regex: /^(how do I play resistance|resistance help|man resistance)/i,
    channels: ['private', gameChannel],
    handler: help,
    description: 'Receive help on how to play resistance using gamebot',
    examples: ['how do I play resistance?', 'resistance help']
  },
  play: {
    regex: /^play (fail|success|reverse|rogue success)/i,
    channels: ['private', gameChannel],
    handler: play,
    description: 'Secretly play a card for a mission you have been picked on',
    examples: ['play success', 'play fail', 'play reverse', 'play rogue success']
  },
  listPlayers: {
    regex: /^(who's playing|list (resistance )?players)/i,
    channels: ['private', gameChannel],
    handler: listPlayers,
    description: 'Report players currently registered to play resistance',
    examples: [`who's playing?`, 'list players']
  },
  state: {
    regex: /^((resistance )?game state|what's the state of the game|what round are we on|what's the current round|whose turn is it)/i,
    channels: ['private', gameChannel],
    handler: reportGameState,
    description: 'Report the current state of the game',
    examples: ['game state', 'what round are we on?', `whose turn is it?`]
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
  const type = data.text.match(matchers.describeRole.regex)[2];
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
  const configuration = roleConfigurations[count];
  if (configuration) {
    const roles = configuration.roles.map((role) => {
      return `${role.team.logo} ${role.name}`;
    });
    api.respond(data, [`The resistance roles for ${count} players are:`, `>${NL}${roles.join(', ')}`].join(NL));
  } else {
    api.respond(data, `No resistance roles are configured for ${count} players.`);
  }
}

function start(api, data) {
  chooseSeeds(state.roleSeed, state.playerSeed);
  const playerName = api.getUserName(data.user);
  state.roles = assignRoles(state.players, state.playerSeed, state.roleSeed);
  state.playerOrder = assignPlayerOrder(state.players, state.playerSeed);
  state.turnCounter = 0;
  const playerOrderNames = state.playerOrder.map(api.getUserName);
  if (state.roles) {
    const leaderName = api.getUserName(getLeader());
    api.respond('resistance', [
      `${playerName} has started the game; all players will shortly receive their roles.`,
      `Player order is: ${grammarList(playerOrderNames, 'then', false)}. ${leaderName} is the first leader. First mission requires ${getCurrentMission().requiredPlayers} players. Pick a team using *pick Name1, Name 2, ...*`
    ].join(NL));

    Object.keys(state.roles).forEach((playerId) => {
      var playerRole = state.roles[playerId];
      var name = api.getUserName(playerId);
      api.respond(playerId, `Congratulations ${name} (Citizen ${playerId}) you have been assigned the role of ${playerRole.team.logo} ${playerRole.name} fighting for the ${playerRole.team.name}. ${playerRole.description}`);
      if (playerRole.isCommander) {
        sendCommanderInstructions(api, playerId, role);
      }
      if (playerRole.knowsSpies) {
        sendASpyAListOfKnownSpies(api, playerId, role);
      }
      if (playerRole.isBodyGuard) {
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

function getLeader() {
  return state.playerOrder[state.turnCounter % state.playerOrder.length];
}

function getMissionProgress() {
  const missionProgress = state.missionHistory.map((team) => {
    return team.logo;
  });
  while (missionProgress.length < 5) {
    missionProgress.push(':white_circle:');
  }
  return missionProgress;
}

function getCurrentMission() {
  const players = state.players;
  const missionConfiguration = roleConfigurations[players.length];
  const missionIndex = state.missionHistory.length;

  const mission = {
    index: missionIndex,
    counter: missionIndex + 1,
    requiredPlayers: missionConfiguration.missions[missionIndex],
    roles: missionConfiguration.roles
  };

  return mission;
}

function getVoteProgress() {
  const missionCount = state.missionHistory.length;
  const voteProgress = state.voteHistory[missionCount].map((votes) => {
    return ':x:';
  });
  return voteProgress;
}

function assignRoles(players, playerSeed, roleSeed) {
  var playerRoles;
  const configuration = roleConfigurations[players.length];
  if (configuration) {
    var remainingPlayers = [].concat(players);
    playerRoles = {};
    for (var i = 0; i < players.length; i++) {
      var role = configuration.roles[(roleSeed + i) % players.length];
      var player = remainingPlayers[(playerSeed + i) % remainingPlayers.length];
      remainingPlayers.splice((playerSeed + i) % remainingPlayers.length, 1);
      playerRoles[player] = role;
    }
  } else {
    playerRoles = null;
  }

  return playerRoles;
}

function assignPlayerOrder(players, playerSeed) {
  var playerOrder = [];
  var remainingPlayers = [].concat(players);
  for (var i = 0; i < players.length; i++) {
    var player = remainingPlayers[(playerSeed + i) % remainingPlayers.length];
    remainingPlayers.splice((playerSeed + i) % remainingPlayers.length, 1);
    playerOrder.unshift(player);
  }

  return playerOrder;
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
  const leader = getLeader();
  if (leader && data.user !== leader) {
    api.respond(data, `Only the leader (${api.getUserName(leader)}) can make picks.`);
    return;
  }

  const playerName = api.getUserName(data.user);
  const names = data.text.match(matchers.pick.regex)[2].split(',').map((name) => {
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
  } else if (state.picks && state.picks.length < 2) {
    state.picks = [];
    api.respond('resistance', 'Need to pick at least 2 valid players onto a mission.');
    recordHistory('picks rejected : ' + names, data);
  } else {
    api.respond('resistance', `${playerName} has picked ${grammarList(pickedNames)} to go on the next mission.`);
    recordHistory('picks set to ' + pickedNames, data);
    state.players.forEach((playerId) => {
      api.respond(playerId, [`${playerName} has picked ${grammarList(pickedNames)} to go on the next mission.`, `Please vote by responding with *vote accept* or *vote reject*`].join(NL));
    });
    recordHistory('players notified ' + state.players, data);
  }
}

function vote(api, data) {
  const responses = [];
  const vote = data.text.match(matchers.vote.regex)[1];
  if (state.approved) {
    api.respond(data.user, `Unable to accept your vote, the current mission has already been approved.`);
    return;
  }
  if (state.picks.length === 0) {
    api.respond(data.user, `Unable to accept your vote, no valid pick has been made yet.`);
    return;
  }
  if (state.players.includes(data.user) === false) {
    api.respond(data.user, `Unable to accept your vote; you are not part of the current game.`);
    return;
  }

  // Normalise voting pattern
  state.votes[data.user] = (vote + '').toLowerCase();

  const playerName = api.getUserName(data.user);
  const missionCount = state.missionHistory.length;
  const missingVotes = state.players.length - Object.keys(state.votes).length;
  if (missingVotes > 0) {
    responses.push(`${playerName} has voted, ${missingVotes} players remaining.`);
    state.approved = false;
  } else {
    responses.push(`${playerName} has voted.`);
    const votesFor = [];
    const votesAgainst = [];
    Object.keys(state.votes).forEach((playerId) => {
      const name = api.getUserName(playerId);
      return (state.votes[playerId] === 'accept') ? votesFor.push(name) : votesAgainst.push(name);
    });

    state.voteHistory[missionCount] = state.voteHistory[missionCount] || [];
    state.voteHistory[missionCount].push(state.votes);
    state.votes = {};

    if (votesFor.length > votesAgainst.length) {
      responses.push(`Mission Approved! ${votesFor.length} votes (${votesFor.join(', ')}), ${votesAgainst.length} rejects (${votesAgainst.join(', ')}).`);
      state.approved = true;
      const playerNameList = state.picks.map(api.getUserName);
      responses.push(`Players ${grammarList(playerNameList)} have been assigned to the current mission; awaiting their responses.`);
    } else {
      responses.push(`Mission Rejected! ${getVoteProgress().join(' ')} ${votesFor.length} votes (${votesFor.join(', ')}), ${votesAgainst.length} rejects (${votesAgainst.join(', ')}).`);
      state.approved = false;
      state.turnCounter = state.turnCounter + 1;
      // Fail the mission if this was the 5th failed vote
      if (state.approved === false && state.voteHistory[missionCount] && state.voteHistory[missionCount].length >= 5) {
        responses.push(`Failed to reach consensus : overall mission status ${team.Spies.name} ${team.Spies.logo} victory`);
        state.missionHistory.push(team.Spies);
        responses.push(`Mission Progress: ${getMissionProgress().join(' ')}`);
      }
      const mission = getCurrentMission();
      responses.push(`The leader token moves to ${api.getUserName(getLeader())}. Mission ${mission.counter} requires ${mission.requiredPlayers} players. Pick a team using *pick Name1, Name2, ...*`);
    }
  }

  api.respond('resistance', responses.join(NL));

  // Prompt users to play an action for an approved mission
  if (state.approved) {
    state.picks.forEach((userId) => {
      api.respond(userId, `You are on an approved mission; please play *success*, *fail*, or *reverse* according to your role. e.g. *play success*`);
    });
  }
  recordHistory(`vote received from ${data.user}`, data);
}

function help(api, data) {
  const gamebot = api.options.slackbot.id;
  var response = [`You can use these commands wherever ${gamebot} is present; for sensitive commands please send them directly to ${gamebot} in private chat.`];
  Object.keys(matchers).forEach((key) => {
    const matcher = matchers[key];
    response.push(`${matcher.description}`);
    const examples = matcher.examples.map((example) => {
      return `*${example}*`;
    });
    response.push(`>Examples: ${examples.join('   ')}`)
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

  responses.push(`Overall mission status: ${victoriousTeam.name} ${victoriousTeam.logo} victory`);
  state.turnCounter = state.turnCounter + 1;
  state.missionHistory.push(victoriousTeam);
  responses.push(`Mission Progress: ${getMissionProgress().join(' ')}`);
  const leader = getLeader();
  const mission = getCurrentMission();
  responses.push(`The leader token moves to ${api.getUserName(leader)}. Mission ${mission.counter} requires ${mission.requiredPlayers} players. Pick a team using *pick Name1, Name2, ...*`);

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
  const responses = [];
  // Create mission progress bar
  responses.push(`>Mission Progress: ${getMissionProgress().join(' ')}`);

  // Report on current leader
  const leader = getLeader();
  if (leader) {
    const leaderName = api.getUserName(leader);
    responses.push(`>${leaderName} is the current leader.`);
  } else {
    responses.push(`>No leader assigned (Game not started?).`);
  }

  // Report on current picks
  if (state.picks.length > 0) {
    const playerNames = state.picks.map(api.getUserName);
    const approved = state.approved ? '(Approved)' : '';
    responses.push(`>Current mission picks: ${grammarList(playerNames)} ${approved}`);
  }

  api.respond(data, responses.join(NL));
}

function clearState() {
  state.roles = {};
  state.votes = {};
  state.history = [];
  state.picks = [];
  state.approved = false;
  state.plays = {};
  state.players = [];
  state.playerOrder = [];
  state.turnCounter = 0;
  state.missionHistory = [];
  state.voteHistory = [];
  state.roleSeed = 0;
  state.playerSeed = 0;
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

  // register module directly on API
  api.resistance = resistance;

  return resistance;
};
