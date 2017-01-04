const expect = require('chai').expect;
const resistance = require('../../../lib/modules/resistance');
const mockGamebot = require('../../lib/mockGamebot');
const NL = '\n';

const MISSION_FAIL = 'mission fail';
const MISSION_SUCCESS = 'mission success';

describe('Resistance module (core)', function () {

  var module, gamebot;
  const gameChannel = 'resistance';

  beforeEach(() => {
    gamebot = mockGamebot();
    module = resistance(gamebot, false);
    module.reset();
    module.chooseSeeds(1, 1);
  });

  const variations = [];

  function expectFailure(players, fail, reverse, success) {
    variations.push({
      players,
      fail,
      reverse,
      success,
      expected: MISSION_FAIL
    });
  }

  function expectSuccess(players, fail, reverse, success) {
    variations.push({
      players,
      fail,
      reverse,
      success,
      expected: MISSION_SUCCESS
    });
  }

  // Two player variations
  expectSuccess(2, 0, 0, 2);
  expectSuccess(2, 1, 1, 0);
  expectSuccess(2, 0, 2, 0);
  expectFailure(2, 1, 0, 1);
  expectFailure(2, 2, 0, 0);
  expectFailure(2, 0, 1, 1);

  describe('Mission Success', () => {
    variations.forEach((variation) => {
      it(`should calculate ${variation.expected} for a ${variation.players} player mission with ${variation.success} success, ${variation.fail} fail, and ${variation.reverse} reverse.`, () => {
        const result = module.calculateMissionSuccess(variation) ? MISSION_SUCCESS : MISSION_FAIL;
        expect(result).to.equal(variation.expected);
        expect((variation.fail + variation.reverse + variation.success) + ' players').to.equal(variation.players + ' players');
      });
    });
  });
});
