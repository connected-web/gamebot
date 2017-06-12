const gameChannel = 'resistance'

const matchers = {
  join: {
    regex: /^(join (the )?resistance|join spies|join game)/i,
    channels: ['private', gameChannel],
    description: 'Join the current game of resistance',
    examples: ['join game', 'join resistance', 'join the resistance']
  },
  leave: {
    regex: /^(leave (the )?resistance|leave game)/i,
    channels: ['private', gameChannel],
    description: 'Leave the current game of resistance',
    examples: ['leave game', 'leave resistance', 'leave the resistance']
  },
  remind: {
    regex: /^(what['’]s my role\??|what is my role\??|who\s?am\s?i\??)/i,
    channels: ['private', gameChannel],
    description: 'Remind you of your current role',
    examples: ['what\'s my role?', 'what is my role?', 'who am I?', 'whoami']
  },
  describeRole: {
    regex: /^(describe )?resistance role ([A-z\s]+)/i,
    channels: ['private', gameChannel],
    description: 'Describe a specific role',
    examples: ['describe resistance role Assassin', 'describe resistance role Hidden Spy Reverser']
  },
  listRoles: {
    regex: /^(resistance|list|describe) roles (for )?(\d|\d\d) players/i,
    channels: ['private', gameChannel],
    description: 'List the configuration for a number of players',
    examples: ['list roles for 5 players', 'describe roles for 6 players', 'resistance roles for 7 players']
  },
  changeRoles: {
    regex: /^set roles ([A-z,\s]+)/i,
    channels: ['private', gameChannel],
    description: 'Create a custom game using any set of roles',
    examples: ['set roles, Spy Reverser, Resistance Reverser, Blind Spy']
  },
  resetRoles: {
    regex: /^reset roles/i,
    channels: ['private', gameChannel],
    description: 'Reset the configuration to use default roles',
    examples: ['reset roles']
  },
  start: {
    regex: /^(start game|start resistance|resistance start)$/i,
    channels: ['private', gameChannel],
    description: 'Start a game of resistance with the registered players',
    examples: ['start game', 'start resistance', 'resistance start']
  },
  stop: {
    regex: /^(stop game|resistance stop|stop resistance)$/i,
    channels: ['private', gameChannel],
    description: 'Stop the current game and kick all players',
    examples: ['stop game', 'resistance stop', 'stop resistance']
  },
  reset: {
    regex: /^(reset game|reset resistance|resistance reset)$/i,
    channels: ['private', gameChannel],
    description: 'Reset the current game but keep all players',
    examples: ['reset game', 'resistance reset', 'reset resistance']
  },
  pick: {
    regex: /^(resistance )?pick ([A-z\s,]+)/i,
    channels: ['private', gameChannel],
    description: 'Pick players to go on a mission',
    examples: ['pick John, Carrie, Hannah', 'pick Emma, Sunil']
  },
  pickOrder: {
    regex: /^(what('| i)s the pick order|player order|leader order|what('| i)s the player order|who (get's|has) next pick)/i,
    channels: ['private', gameChannel],
    description: 'List the pick order based on the current leader',
    examples: [`What's the pick order?`, `player order`, `leader order`]
  },
  vote: {
    regex: /^vote (accept|reject)/i,
    channels: ['private'],
    description: 'Vote on the current pick',
    examples: ['vote accept', 'vote reject']
  },
  voteReject: {
    regex: /^lol[.,]? no/i,
    channels: ['private'],
    description: 'Reject the current pick',
    examples: ['lol no']
  },
  voteHistory: {
    regex: /^vote history/i,
    channels: ['private', gameChannel],
    description: 'Receive a full list of the vote history for the current game',
    examples: ['vote history']
  },
  help: {
    regex: /^(how do I play resistance|resistance -?help|man resistance)/i,
    channels: ['private', gameChannel],
    description: 'Receive help on how to play resistance using gamebot',
    examples: ['how do I play resistance?', 'resistance help']
  },
  play: {
    regex: /^play (fail|success|reverse|rogue success)/i,
    channels: ['private', gameChannel],
    description: 'Secretly play a card for a mission you have been picked on',
    examples: ['play success', 'play fail', 'play reverse', 'play rogue success']
  },
  assassinate: {
    regex: /^assassinate ([A-z\s]+)/i,
    channels: ['private', gameChannel],
    description: 'Assassinate a player at the end of a resistance win when trying to identify the commander',
    examples: ['assassinate Carrie']
  },
  listPlayers: {
    regex: /^(who(\s)?[i']s play|list (resistance )?play)/i,
    channels: ['private', gameChannel],
    description: 'Report players currently registered to play resistance',
    examples: [`who's playing?`, `who is playing?`, `list players`]
  },
  reportGameState: {
    regex: /^((resistance )?game state|what's the state of the game|what round are we on|what's the current round|whose turn is it|who are we waiting (on|for))/i,
    channels: ['private', gameChannel],
    description: 'Report the current state of the game',
    examples: ['game state', 'what round are we on?', `whose turn is it?`]
  }
}

module.exports = matchers
