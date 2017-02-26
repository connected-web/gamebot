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
    list.sort((a, b) => {
      return a.localeCompare(b, 'en', {
        'sensitivity': 'base'
      });
    });
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
    regex: /^(leave (the )?resistance|leave game)/i,
    channels: ['private', gameChannel],
    handler: leave,
    description: 'Leave the current game of resistance',
    examples: ['leave game', 'leave resistance', 'leave the resistance']
  },
  remind: {
    regex: /^(what['’]s my role\??|what is my role\??|who\s?am\s?i\??)/i,
    channels: ['private', gameChannel],
    handler: remind,
    description: 'Remind you of your current role',
    examples: ['what\'s my role?', 'what is my role?', 'who am I?', 'whoami']
  },
  describeRole: {
    regex: /^(describe )?resistance role ([A-z\s]+)/i,
    channels: ['private', gameChannel],
    handler: describeRole,
    description: 'Describe a specific role',
    examples: ['describe resistance role Assassin', 'describe resistance role Hidden Spy Reverser']
  },
  listRoles: {
    regex: /^(resistance|list|describe) roles (for )?(\d|\d\d) players/i,
    channels: ['private', gameChannel],
    handler: listRoles,
    description: 'List the configuration for a number of players',
    examples: ['list roles for 5 players', 'describe roles for 6 players', 'resistance roles for 7 players']
  },
  changeRoles: {
    regex: /^set roles ([A-z,\s]+)/i,
    channels: ['private', gameChannel],
    handler: changeRoles,
    description: 'Create a custom game using any set of roles',
    examples: ['set roles, Spy Reverser, Resistance Reverser, Blind Spy']
  },
  resetRoles: {
    regex: /^reset roles/i,
    channels: ['private', gameChannel],
    handler: resetRoles,
    description: 'Reset the configuration to use default roles',
    examples: ['reset roles']
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
  pickOrder: {
    regex: /^(what('| i)s the pick order|player order|leader order|what('| i)s the player order|who (get's|has) next pick)/i,
    channels: ['private', gameChannel],
    handler: pickOrder,
    description: 'List the pick order based on the current leader',
    examples: [`What's the pick order?`, `player order`, `leader order`]
  },
  vote: {
    regex: /^vote (accept|reject)/i,
    channels: ['private', gameChannel],
    handler: vote,
    description: 'Vote on the current pick',
    examples: ['vote accept', 'vote reject']
  },
  voteHistory: {
    regex: /^vote history/i,
    channels: ['private', gameChannel],
    handler: voteHistory,
    description: 'Receive a full list of the vote history for the current game',
    examples: ['vote history']
  },
  help: {
    regex: /^(how do I play resistance|resistance -?help|man resistance)/i,
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
  assassinate: {
    regex: /^assassinate ([A-z\s]+)/i,
    channels: ['private', gameChannel],
    handler: assassinate,
    description: 'Assassinate a player at the end of a resistance win when trying to identify the commander',
    examples: ['assassinate Carrie']
  },
  listPlayers: {
    regex: /^(who(\s)?[i']s play|list (resistance )?play)/i,
    channels: ['private', gameChannel],
    handler: listPlayers,
    description: 'Report players currently registered to play resistance',
    examples: [`who's playing?`, `who is playing?`, `list players`]
  },
  state: {
    regex: /^((resistance )?game state|what's the state of the game|what round are we on|what's the current round|whose turn is it|who are we waiting (on|for))/i,
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
    api.respond(gameChannel, `${playerName} has joined the resistance. There are now ${state.players.length} players.`);
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
    api.respond(gameChannel, `${playerName} has left the resistance. There are now ${state.players.length} players.`);
    recordHistory(`${playerName} left the game`, data);
    saveState();
  } else {
    api.respond(data, `You are not part of the resistance.`);
  }
}

function remind(api, data) {
  const playerName = api.getUserName(data.user);
  if (state.players && state.players.includes(data.user)) {
    const playerRole = state.roles[data.user];
    api.respond(data.user, [`${playerName}, your role is...`, `>${playerRole.name} : Team ${playerRole.team.logo}.`, `>${playerRole.description}`].join(NL));
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
  const count = parseInt(data.text.match(matchers.listRoles.regex)[3]);
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
    api.respond(gameChannel, [
      `${playerName} has started the game; all players will shortly receive their roles.`,
      `Player order is: ${grammarList(playerOrderNames, 'then', false)}. *${leaderName}* is the first leader. First mission requires ${getCurrentMission().requiredPlayers} players. Pick a team using *pick Name1, Name 2, ...*`
    ].join(NL));

    var defectorPresent = false;
    Object.keys(state.roles).forEach((playerId) => {
      var playerRole = state.roles[playerId];
      if (!playerRole) {
        return;
      }
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
      if (playerRole.isDefector) {
        defectorPresent = true;
      }
    });

    if (defectorPresent) {
      state.defectorCards = shuffleDefectorCards(state.playerSeed + state.roleSeed);
    }

    notifyNewLeader(api);

  } else if (state.customGame && state.customGame.roles) {
    api.respond('resistance', `${playerName} tried to start the game with ${state.players.length} players, but a custom game mode is configured for ${state.customGame.roles.length} players. Use *set roles ...* or *reset roles* to continue.`);
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
    if (playerRole && playerRole.knownToCommander) {
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
    if (playerRole && playerRole.knownToSpies) {
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
    if (playerRole && playerRole.knownToBodyGuard) {
      var playerName = api.getUserName(playerId);
      instructions.push(`>:bad_guy: ? :good_guy: ${playerName}`);
    }
  });
  api.respond(playerId, instructions.join(NL));
}

function getLeader(offset = 0) {
  const playerCount = state.playerOrder.length;
  offset = offset % playerCount;
  return state.playerOrder[(state.turnCounter + offset + playerCount) % playerCount];
}

function notifyNewLeader(api) {
  const mission = getCurrentMission();
  const twoFailsRequired = mission.twoFailsRequired ? ' (Two Fails Required)' : '';
  const leader = getLeader();
  api.respond(leader, `${api.getUserName(leader)} you are the leader. Mission ${mission.counter} requires ${mission.requiredPlayers} players${twoFailsRequired}. Pick a team using *pick Name1, Name2, ...*`);
}

function notifyDefectors(api, defectorChange) {
  Object.keys(state.roles).forEach((playerId) => {
    var playerRole = state.roles[playerId];
    if (playerRole && playerRole.isDefector) {
      var playerName = api.getUserName(playerId);
      if (defectorChange === 'change allegiance') {
        api.respond(playerId, `Your allegiance has changed; you are now fighting for the other team.`);
      } else {
        api.respond(playerId, `There has been no change to your allegiance.`);
      }
    }
  });
}

function getMissionProgress() {
  const missionConfiguration = getGameConfiguration();
  const missionProgress = state.missionHistory.map((mission) => {
    return mission.victoriousTeam && mission.victoriousTeam.logo || mission.victoriousTeam;
  });
  while (missionProgress.length < 5) {
    var playersRequired = missionConfiguration.missions[missionProgress.length];
    var tfr = (missionConfiguration.twoFailsRequired && missionProgress.length === 3) ? '-2fr' : '';
    missionProgress.push(`:${playersRequired}${tfr}:`);
  }
  return missionProgress;
}

function getCurrentMission() {
  const missionConfiguration = getGameConfiguration();
  const missionIndex = state.missionHistory.length;

  const mission = {
    index: missionIndex,
    counter: missionIndex + 1,
    requiredPlayers: missionConfiguration.missions[missionIndex] || 0,
    roles: missionConfiguration.roles || {}
  };

  return mission;
}

function getGameConfiguration() {
  const players = state.players;
  return state.customGame || roleConfigurations[players.length] || {
    missions: []
  };
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
  const configuration = state.customGame || roleConfigurations[players.length];
  if (configuration && configuration.roles.length === players.length) {
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
  api.respond(gameChannel, response);
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
    api.respond(data, `Only the leader (*${api.getUserName(leader)}*) can make picks.`);
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
    const name = api.getUserName(userId);
    return `*${name}*`;
  });

  const mission = getCurrentMission();

  if (unmatched.length > 0) {
    state.picks = [];
    api.respond(gameChannel, `Some of the picks were not recognised as players; ${grammarList(unmatched)}.`);
    recordHistory('picks rejected : ' + unmatched, data);
  } else if (state.picks && state.picks.length !== mission.requiredPlayers) {
    state.picks = [];
    api.respond(gameChannel, `Need to pick ${mission.requiredPlayers} valid players onto this mission.`);
    recordHistory('picks rejected : ' + names, data);
  } else {
    const leaderOrder = reportPlayerPickOrder(api);
    api.respond(gameChannel, [
      `${playerName} has picked ${grammarList(pickedNames)} to go on the next mission.`,
      `>${leaderOrder}`
    ].join(NL));
    recordHistory('picks set to ' + pickedNames, data);
    state.players.forEach((playerId) => {
      api.respond(playerId, [`${playerName} has picked ${grammarList(pickedNames)} to go on the next mission.`, leaderOrder, `Please vote by responding with *vote accept* or *vote reject*`].join(NL));
    });
    recordHistory('players notified ' + state.players, data);
  }
}

function pickOrder(api, data) {
  const leaderOrder = reportPlayerPickOrder(api);
  api.respond(data, leaderOrder);
}

function reportPlayerPickOrder(api) {
  const leaderNames = [];

  if (state.playerOrder.length === 0) {
    return `No leaders; game not started`;
  }

  const maxVoteAttempts = 5;
  const missionCount = state.missionHistory.length;
  const voteCount = (state.voteHistory[missionCount] || []).length;
  const leader = getLeader();

  for (var i = 0; i < maxVoteAttempts; i++) {
    var player = getLeader(i - voteCount);
    var name = api.getUserName(player);
    var formattedName = (player === leader) ? `*${name}*` : name;
    leaderNames.push(formattedName);
  }

  // Disable sorting
  return `Leader order: ${grammarList(leaderNames, 'and finally', false)}`;
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
      const onMission = state.picks.includes(playerId);
      const name = api.getUserName(playerId);
      const formattedName = (onMission) ? `*${name}*` : name;
      return (state.votes[playerId] === 'accept') ? votesFor.push(formattedName) : votesAgainst.push(formattedName);
    });

    // Record vote history
    state.voteHistory[missionCount] = state.voteHistory[missionCount] || [];
    state.voteHistory[missionCount].push({
      leader: getLeader(),
      picks: state.picks,
      votes: state.votes
    });
    state.votes = {};

    if (votesFor.length > votesAgainst.length) {
      // Accept the pick
      responses.push(`Mission Approved! ${votesFor.length} votes (${votesFor.join(', ')}), ${votesAgainst.length} rejects (${votesAgainst.join(', ')}).`);
      state.approved = true;
      const playerNameList = state.picks.map(api.getUserName);
      responses.push(`Players ${grammarList(playerNameList)} have been assigned to the current mission; awaiting their responses.`);
    } else {
      // Reject the pick
      responses.push(`Mission Rejected! ${getVoteProgress().join(' ')} ${votesFor.length} votes (${votesFor.join(', ')}), ${votesAgainst.length} rejects (${votesAgainst.join(', ')}).`);
      state.approved = false;
      state.turnCounter = state.turnCounter + 1;
      state.picks = {};

      // Fail the mission if this was the 5th failed vote
      if (state.approved === false && state.voteHistory[missionCount] && state.voteHistory[missionCount].length >= 5) {
        responses.push(`Failed to reach consensus : overall mission status ${team.Spies.name} ${team.Spies.logo} victory`);
        state.missionHistory.push({
          victoriousTeam: team.Spies,
          success: false,
          playResults: {},
          failedToReachConsensus: true
        });
        responses.push(`Mission Progress: ${getMissionProgress().join(' ')}`);
      }

      // Check if that failed mission ended the game
      if (checkForEndGame(api) === false) {
        // Move leader token onwards
        const mission = getCurrentMission();
        const twoFailsRequired = mission.twoFailsRequired ? ' (Two Fails Required)' : '';
        const leader = getLeader();
        responses.push(`The leader token moves to *${api.getUserName(leader)}*. Mission ${mission.counter} requires ${mission.requiredPlayers} players${twoFailsRequired}. Pick a team using *pick Name1, Name2, ...*`);
        notifyNewLeader(api);

        if (state.defectorCards.length > 0 && state.missionHistory.length > 1 && state.missionHistory.length < 5) {
          const defectorChange = state.defectorCards.unshift();
          responses.push(`Defector allegiance: ${defectorChange}`);
          notifyDefectors(api, defectorChange);
        }
      }
    }
  }

  // Send information gathered so far
  api.respond('resistance', responses.join(NL));

  // Prompt users to play an action for an approved mission
  if (state.approved && !state.gameover) {
    state.picks.forEach((userId) => {
      const otherPlayerNames = state.picks.filter((pickId) => {
        return userId !== pickId;
      }).map(api.getUserName);
      api.respond(userId, [
        `You are on an approved mission with ${grammarList(otherPlayerNames)}.`,
        `Please play by responding with *play success* or *play fail* or *play reverse*, according to your role.`
      ].join(NL));
    });
  }
  recordHistory(`vote received from ${data.user}`, data);
  saveState();
}

function summariseMission(mission) {
  return ''; // TODO: Summarise mission success/failiure and cards played
}

function voteHistory(api, data) {
  var missionCount = 0;
  var response = state.voteHistory.map((mission) => {
    missionCount++;
    var pickCount = 0;
    const missionSummary = summariseMission(mission);
    return [`Mission ${missionCount} vote history:${missionSummary}`].concat(mission.map((turn) => {
      pickCount++;
      const pickedNames = turn.picks.map((userId) => {
        const name = api.getUserName(userId);
        return `*${name}*`;
      });

      const votesFor = [];
      const votesAgainst = [];
      Object.keys(turn.votes).forEach((playerId) => {
        const onMission = turn.picks.includes(playerId);
        const name = api.getUserName(playerId);
        const formattedName = (onMission) ? `*${name}*` : name;
        return (turn.votes[playerId] === 'accept') ? votesFor.push(formattedName) : votesAgainst.push(formattedName);
      });

      return [
        `>:${pickCount}: Leader: _${api.getUserName(turn.leader)}_`,
        `Pick: ${pickedNames.join(', ')}`,
        `${votesFor.length} approve (${votesFor.join(', ')}), ${votesAgainst.length} rejects (${votesAgainst.join(', ')})`
      ].join(', ');
    })).join(NL);
  });

  api.respond(data.user, response.join(NL));
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
  // Skip all this if we're missing plays
  if (Object.keys(state.plays).length !== Object.keys(state.picks).length) {
    return;
  }

  // Form response
  const responses = [`All mission actions have been completed; the results are as follows:`];
  const playResults = {};
  Object.keys(state.plays).forEach((userId) => {
    const playAction = state.plays[userId];
    playResults[playAction] = (playResults[playAction] || 0) + 1;
  });

  // Display anonymised results
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

  // Decide who won the mission
  const mission = getCurrentMission();
  const success = calculateMissionSuccess(playResults, mission.twoFailsRequired);
  const victoriousTeam = (success) ? team.Resistance : team.Spies;

  // Log mission result
  responses.push(`Overall mission status: ${victoriousTeam.name} ${victoriousTeam.logo} victory`);
  state.turnCounter = state.turnCounter + 1;
  state.picks = {};
  state.missionHistory.push({
    victoriousTeam,
    playResults,
    success
  });
  responses.push(`Mission Progress: ${getMissionProgress().join(' ')}`);

  // Check if that mission ended the game
  if (checkForEndGame(api) === false) {
    const nextMission = getCurrentMission();
    const twoFailsRequired = nextMission.twoFailsRequired ? ' (Two Fails Required)' : '';
    const leader = getLeader();
    responses.push(`The leader token moves to *${api.getUserName(leader)}*. Mission ${nextMission.counter} requires ${nextMission.requiredPlayers} players${twoFailsRequired}. Pick a team using *pick Name1, Name2, ...*`);
    notifyNewLeader(api);

    if (state.defectorCards.length > 0 && state.missionHistory.length > 1 && state.missionHistory.length < 5) {
      const defectorChange = state.defectorCards.shift();
      responses.push(`Defector allegiance: ${defectorChange}`);
      notifyDefectors(api, defectorChange);
    }
  }
  api.respond('resistance', responses.join(NL));
}

function checkForEndGame(api) {
  const results = {
    spies: 0,
    resistance: 0,
    other: 0,
    total: 0
  };

  // Index results
  state.missionHistory.forEach((result) => {
    if (result.victoriousTeam && result.victoriousTeam.name === team.Resistance.name) {
      results.resistance = results.resistance + 1;
    } else if (result.victoriousTeam && result.victoriousTeam.name === team.Spies.name) {
      results.spies = results.spies + 1;
    } else {
      results.other = results.other + 1;
    }
    results.total = results.total + 1;
  });

  // Set winner flags
  if (results.spies >= 3) {
    state.gameover = true;
    state.winner = team.Spies;
    state.assassinationDisabled = true;
  } else if (results.resistance >= 3) {
    state.gameover = true;
    state.winner = team.Resistance;
    notifyAssassin(api);
  } else if (results.other >= 3) {
    state.gameover = true;
    state.assassinationDisabled = true;
    state.winner = {
      name: 'Other',
      logo: ':3:'
    };
  }

  return state.gameover;
}

function calculateMissionSuccess(playResults, twoFailsRequired = false) {
  var success = true;
  // Check fail requirements
  if (twoFailsRequired && playResults.fail > 1) {
    success = false
  } else if (!twoFailsRequired && playResults.fail) {
    success = false;
  }
  // Apply reverses
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

function assassinate(api, data) {
  const playerRole = state.roles[data.user];
  if (playerRole && playerRole.assassin) {
    const targetName = data.text.match(matchers.assassinate.regex)[1];
    const target = api.findUserByName(targetName);
    const targetRole = state.roles[target.id];

    if (state.assassinationDisabled === true) {
      api.respond(data.user, `You cannot assassinate ${targetName}; assassination has been disabled.`);
      return;
    }

    if (targetRole) {
      const responses = [
        `${api.getUserName(data.user)} has revealed themself as the ${playerRole.name}, and has assassinated ${targetName}.`,
        `${targetName} is revealed to be the ${targetRole.name}.`
      ];
      if (targetRole.isCommander) {
        responses.push(`The ${targetRole.name} has been found, dead. The ${team.Spies.logo} ${team.Spies.name} win the game.`);
        // Change the result for the last mission
        state.winner = team.Spies;
        state.assassinationSuccessful = true;
      } else {
        responses.push(`The ${team.Resistance.logo} ${team.Resistance.name} win the game.`);
        state.winner = team.Resistance;
        state.assassinationSuccessful = false;
      }
      state.assassinationTarget = {
        name: targetName,
        role: targetRole
      };
      state.gameover = true;
      state.assassinationDisabled = true;
      api.respond('resistance', responses.join(NL));
      saveState();
    } else {
      api.respond(data.user, `You cannot assassinate ${targetName}; they do not have a role in this game.`);
    }
  } else {
    api.respond(data.user, `You are not stealthy enough to be an assassin; go home and learn your craft.`);
  }
}

function notifyAssassin(api) {
  const assassin = Object.keys(state.roles).filter((playerId) => {
    const role = state.roles[playerId];
    return role.assassin;
  })[0];

  if (assassin) {
    api.respond(assassin, `Though the resistance has prevailed you are presented the opportunity to assassinate their commander. Use *assassinate Name* to reclaim victory.`);
  } else {
    api.respond('resistance', 'The game is over, there is no assassin assigned to the spy team.');
  }
}

function listPlayers(api, data) {
  const players = state.players || [];
  if (players.length > 0) {
    const playerNameList = players.map((playerId) => {
      return api.getUserName(playerId);
    });
    api.respond(data, `The current list of players is: ${grammarList(playerNameList)}`);
  } else {
    api.respond(data, 'No one is currently registered to play resistance.');
  }
}

function reportGameState(api, data) {
  const responses = [];

  // Banner for custom game
  if (state.customGame) {
    const customRoles = state.customGame.roles.map((role) => {
      return `${role.team.logo} ${role.name}`;
    });
    responses.push(`>Custom roles in play: ${grammarList(customRoles)}`);
  }

  // Create mission progress bar
  if (getGameConfiguration().missions.length > 0) {
    responses.push(`>Mission Progress: ${getMissionProgress().join(' ')}`);
  }

  // Report on leader order
  responses.push(`>${reportPlayerPickOrder(api)}`);

  // Report on current picks
  if (state.picks.length > 0) {
    const playerNames = state.picks.map(api.getUserName);
    const approved = state.approved ? '(Approved)' : '';
    responses.push(`>Current mission picks: ${grammarList(playerNames)} ${approved}`);
    if (!approved) {
      const waitingOn = state.players.filter((user) => {
        return !Object.keys(state.votes).includes(user);
      }).map(api.getUserById).map((user) => {
        return `@${user.name}`;
      });
      if (waitingOn.length > 0) {
        responses.push(`>Waiting on votes from: ${grammarList(waitingOn)}`);
      }
    }
  }

  api.respond(data, responses.join(NL), {
    parse: 'full'
  });
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
  state.defectorCards = [];
  state.roleSeed = 0;
  state.playerSeed = 0;
  state.gameover = false;
  state.assassinationDisabled = false;
  state.assassinationSuccessful = false;
  state.assassinationTarget = false;
  state.winner = false;
  state.customGame = false;
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

function changeRoles(api, data) {
  const unknownRoles = [];
  const roles = [];
  const roleNames = data.text.match(matchers.changeRoles.regex)[1].split(',').map((name) => {
    return name.trim();
  });
  roleNames.forEach((name) => {
    const customRole = role.findRoleByName(name);
    (customRole) ? roles.push(customRole): unknownRoles.push(name);
  });
  if (unknownRoles.length > 0) {
    api.respond(gameChannel, `Cannot set custom roles; the following roles were not recognised: ${grammarList(unknownRoles)}`);
  } else {
    const defaultForPlayerCount = roleConfigurations[roles.length] || roleConfigurations[4];
    state.customGame = {
      roles: roles,
      missions: defaultForPlayerCount.missions,
      twoFailsRequired: defaultForPlayerCount.twoFailsRequired || false
    };
    const bundledRoles = roles.map((role) => {
      return `${role.team.logo} ${role.name}`;
    });
    api.respond(gameChannel, `Roles have been set to: ${grammarList(bundledRoles)}`);
    saveState();
  }
}

function resetRoles(api, data) {
  if (state.customGame) {
    state.customGame = false;
    api.respond(gameChannel, `Game roles have been reset to defaults.`);
    saveState();
  } else {
    api.respond(gameChannel, `No custom game roles are set.`);
  }
}

function shuffleDefectorCards(seed) {
  const C = 'change allegiance';
  const N = 'no change';
  return ([
    [C, C, N, N, N],
    [N, C, C, N, N],
    [N, N, C, C, N],
    [N, N, N, C, C],
    [C, N, C, N, N],
    [C, N, N, C, N],
    [C, N, N, N, C],
    [N, C, N, C, N],
    [N, C, N, N, C],
    [N, N, C, N, C]
  ])[seed % 10];
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
    reset: clearState,
    calculateMissionSuccess
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
