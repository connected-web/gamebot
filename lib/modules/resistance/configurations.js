const role = require('./role');

function copyObject(data) {
  return JSON.parse(JSON.stringify(data));
}

const configurations = {
  4: {
    roles: [
      role.HiddenReverser,
      role.Reverser, role.GenericResistance, role.GenericResistance
    ],
    missions: [2, 3, 2, 3, 3]
  },
  5: {
    roles: [
      role.Assassin, role.HiddenReverser,
      role.Commander, role.Reverser, role.GenericResistance
    ],
    missions: [2, 3, 2, 3, 3]
  },
  6: {
    roles: [
      role.FalseCommander, role.SpyReverser,
      role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance
    ],
    missions: [2, 3, 4, 3, 4]
  },
  7: {
    roles: [
      role.Assassin, role.SpyReverser, role.FalseCommander,
      role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance
    ],
    missions: [2, 3, 3, 4, 4],
    twoFailsRequired: true
  },
  8: {
    roles: [
      role.FalseCommander, role.SpyReverser, role.BlindSpy,
      role.Commander, role.BodyGuard, role.Reverser,
      role.GenericResistance, role.GenericResistance
    ],
    missions: [3, 4, 4, 5, 5],
    twoFailsRequired: true
  },
  9: {
    roles: [
      role.FalseCommander, role.SpyReverser, role.DeepCover,
      role.Commander, role.BodyGuard, role.Reverser,
      role.GenericResistance, role.GenericResistance, role.GenericResistance
    ],
    missions: [3, 4, 4, 5, 5],
    twoFailsRequired: true
  },
  10: {
    roles: [
      role.Assassin, role.SpyReverser, role.DeepCover, role.FalseCommander,
      role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance,
      role.GenericResistance, role.GenericResistance
    ],
    missions: [3, 4, 4, 5, 5],
    twoFailsRequired: true
  }
};

// Clone all roles
Object.keys(configurations).forEach((playerCount) => {
  configurations[playerCount] = copyObject(configurations[playerCount]);
});

// Assign some additional Assassins
configurations[6].roles[1].assassin = true;
configurations[8].roles[0].assassin = true;
configurations[9].roles[2].assassin = true;

module.exports = configurations;
