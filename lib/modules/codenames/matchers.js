const matchers = {
  join: {
    name: 'Join game',
    regex: /join (game|codenames|spies)/i,
    description: 'Join a game, teams will be assigned randomly after game start',
    examples: ['join game', 'join codenames', 'join spies']
  },
  makeUserSpyMaster: {
    name: 'Make user a spy master',
    regex: /^make me spy ?master/i,
    description: 'Make the user a spy master',
    examples: ['Make me a spy master!']
  },
  help: {
    name: 'Help',
    regex: /^(codenames help)|(how do I( play codenames)?)/i,
    description: 'Provide a list of commands on how to play codenames',
    examples: ['codenames help', 'how do I play code names', 'how do I play']
  }
}

module.exports = matchers
