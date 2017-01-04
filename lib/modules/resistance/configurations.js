const role = require('./role');

function copyObject(data) {
  return JSON.parse(JSON.stringify(data));
}

const configurations = {
  4: [role.HiddenReverser, role.Reverser, role.GenericResistance, role.GenericResistance],
  5: [role.Assassin, role.HiddenReverser, role.Commander, role.Reverser, role.GenericResistance],
  6: [role.FalseCommander, role.SpyReverser, role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance],
  7: [role.Assassin, role.SpyReverser, role.FalseCommander, role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance],
  8: [role.FalseCommander, role.SpyReverser, role.BlindSpy, role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance, role.GenericResistance],
  9: [role.FalseCommander, role.SpyReverser, role.DeepCover, role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance, role.GenericResistance, role.GenericResistance],
  10: [role.Assassin, role.SpyReverser, role.DeepCover, role.FalseCommander, role.Commander, role.BodyGuard, role.Reverser, role.GenericResistance, role.GenericResistance, role.GenericResistance]
};

// Clone all roles
Object.keys(configurations).forEach((playerCount) => {
  configurations[playerCount] = configurations[playerCount].map((item) => {
    return copyObject(item);
  });
});

// Assign some additional Assassins
configurations[6][1].assassin = true;
configurations[8][0].assassin = true;
configurations[9][2].assassin = true;

console.log(configurations);

module.exports = configurations;
