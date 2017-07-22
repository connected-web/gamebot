const team = require('./team')

const roles = {
  SpyReverser: {
    name: 'Spy Reverser',
    team: team.Spies,
    description: 'May only play :success: or :reverse:; known to the Commander. Attempt to fail three missions for your team.',
    knownToCommander: true,
    knownToSpies: true,
    isReverser: true,
    knowsSpies: true,
    validMissionActions: ['success', 'reverse']
  },
  FalseCommander: {
    name: 'False Commander',
    team: team.Spies,
    description: 'May only play :success: or :fail:; appears as the Commander to the Body Guard. Attempt to fail three missions for your team.',
    knownToCommander: true,
    knownToBodyGuard: true,
    knownToSpies: true,
    knowsSpies: true,
    validMissionActions: ['success', 'fail']
  },
  Assassin: {
    name: 'Assassin',
    team: team.Spies,
    description: 'May only play :success: or :fail:; has one chance to identify and assasinate the Commander if the Resistance succeeds three missions. Attempt to fail three missions for your team.',
    knownToCommander: true,
    knownToSpies: true,
    assassin: true,
    knowsSpies: true,
    validMissionActions: ['success', 'fail']
  },
  HiddenReverser: {
    name: 'Hidden Spy Reverser',
    team: team.Spies,
    description: 'May only play :success: or :reverse:; hidden to the Commander. Attempt to fail three missions for your team.',
    knownToCommander: false,
    isReverser: true,
    knowsSpies: true,
    knownToSpies: true,
    validMissionActions: ['success', 'reverse']
  },
  DeepCover: {
    name: 'Deep Cover',
    team: team.Spies,
    description: 'May only play :success: or :fail:; hidden to the Commander. Attempt to fail three missions for your team.',
    knownToCommander: false,
    knownToSpies: true,
    knowsSpies: true,
    validMissionActions: ['success', 'fail']
  },
  BlindSpy: {
    name: 'Blind Spy',
    team: team.Spies,
    description: 'May only play :success: or :fail:; hidden to their fellow Spies; visible to the Commander. Attempt to fail three missions for your team.',
    knownToCommander: true,
    knownToSpies: true,
    knowsSpies: false,
    validMissionActions: ['success', 'fail']
  },
  RogueSpy: {
    name: 'Rogue Spy',
    team: team.Spies,
    description: 'May only play :success: or :fail:; hidden to everyone. You win if you play :fail: on a third failing mission, and have played at least one :fail: on a prior mission.',
    knownToCommander: false,
    rogue: true,
    validMissionActions: ['success', 'fail']
  },
  GenericSpy: {
    name: 'Generic Spy',
    team: team.Spies,
    description: 'May only play :success: or :fail:; known to the Commander. Attempt to fail three missions for your team.',
    knownToCommander: true,
    knownToSpies: true,
    knowsSpies: true,
    validMissionActions: ['success', 'fail']
  },
  Rogue: {
    name: 'Rogue',
    team: team.Resistance,
    description: 'May only play :success: or :rogue_success:; hidden to everyone. You win if you play :rogue_success: on a third suceeding mission, and have played at least one :rogue_success: on a prior mission. You cannot play :rogue_success: if you are marked with the :watch: token.',
    knownToCommander: false,
    rogue: true,
    validMissionActions: ['success', 'rogue success']
  },
  GenericResistance: {
    name: 'Generic Resistance',
    team: team.Resistance,
    description: 'May only play :success:. Knows nothing. Attempt to succeed three missions for your team.',
    validMissionActions: ['success']
  },
  Commander: {
    name: 'Resistance Commander',
    team: team.Resistance,
    description: 'May only play :success:. Knows most types of spy. Attempt to succeed three missions for your team without revealing your role to the Assassin.',
    knownToBodyGuard: true,
    isCommander: true,
    validMissionActions: ['success']
  },
  BodyGuard: {
    name: 'Body Guard',
    team: team.Resistance,
    description: 'May only play :success:. Knows the Resistance Commander and the False Commander. Attempt to succeed three missions for your team and protect the Resistance Commander from the Assassin.',
    isBodyGuard: true,
    validMissionActions: ['success']
  },
  Reverser: {
    name: 'Resistance Reverser',
    team: team.Resistance,
    description: 'May only play :success: or :reverse:. Knows nothing. Attempt to succeed three missions for your team.',
    isReverser: true,
    validMissionActions: ['success', 'reverse']
  },
  Defector: {
    name: 'Resistance Defector',
    team: team.Resistance,
    description: 'May only play :success: or :fail:. Knows nothing, hidden from the Commander. Your allegiance might switch once, twice, or not at all during the game. Attempt to win the game based on current allegiance.',
    isDefector: true,
    validMissionActions: ['success', 'fail']
  },
  SpyDefector: {
    name: 'Spy Defector',
    team: team.Spies,
    description: 'May only play :success: or :fail:. Known to the spies. Your allegiance might switch once, twice, or not at all during the game. Attempt to win the game based on your current allegiance.',
    knownToCommander: true,
    knownToSpies: true,
    knowsSpies: false,
    isDefector: true,
    validMissionActions: ['success', 'fail']
  }
}

function createSearchIndex (roles) {
  const roleIndex = {}
  Object.keys(roles).forEach((key) => {
    const role = roles[key]
    const searchTerm = role.name.toLowerCase()
    roleIndex[searchTerm] = role
    roleIndex[key.toLowerCase()] = role
  })
  return roleIndex
}

const searchIndex = createSearchIndex(roles)
roles.findRoleByName = (name) => {
  return searchIndex[name.toLowerCase()]
}

module.exports = roles
