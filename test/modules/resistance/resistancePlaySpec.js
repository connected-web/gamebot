const expect = require('chai').expect;
const resistance = require('../../../lib/modules/resistance');
const mockGamebot = require('../../lib/mockGamebot');
const NL = '\n';

const MISSION_FAIL = 'mission fail';
const MISSION_SUCCESS = 'mission success';

describe('Resistance module (Mission Plays)', function () {

  var module, gamebot;
  const gameChannel = 'resistance';

  beforeEach(() => {
    gamebot = mockGamebot();
    module = resistance(gamebot, false);
    module.reset();
    module.chooseSeeds(1, 1);
  });

  function expectFailure(players, fail, reverse, success, twoFailsRequired = false) {
    testVariation({
      players,
      fail,
      reverse,
      success,
      twoFailsRequired,
      expected: MISSION_FAIL
    });
  }

  function expectSuccess(players, fail, reverse, success, twoFailsRequired = false) {
    testVariation({
      players,
      fail,
      reverse,
      success,
      twoFailsRequired,
      expected: MISSION_SUCCESS
    });
  }

  function testVariation(variation) {
    const twoFailsRequired = variation.twoFailsRequired ? ' (two fails required)' : '';
    it(`should calculate ${variation.expected} for a ${variation.players} player mission with ${variation.success} success, ${variation.fail} fail, and ${variation.reverse} reverse${twoFailsRequired}.`, () => {
      const result = module.calculateMissionSuccess(variation, variation.twoFailsRequired) ? MISSION_SUCCESS : MISSION_FAIL;
      expect(result).to.equal(variation.expected);
      expect((variation.fail + variation.reverse + variation.success) + ' players').to.equal(variation.players + ' players');
    });
  }

  describe('Mission Success', () => {
    describe('Two player variations', () => {
      expectSuccess(2, 0, 0, 2);
      expectSuccess(2, 1, 1, 0);
      expectSuccess(2, 0, 2, 0);
      expectFailure(2, 1, 0, 1);
      expectFailure(2, 2, 0, 0);
      expectFailure(2, 0, 1, 1);
    });

    describe('Three player variations', () => {
      expectSuccess(3, 0, 0, 3);
      expectSuccess(3, 1, 1, 1);
      expectSuccess(3, 0, 2, 1);
      expectFailure(3, 1, 0, 2);
      expectFailure(3, 2, 0, 1);
      expectFailure(3, 0, 1, 2);
    });

    describe('Four player variations', () => {
      expectSuccess(4, 0, 0, 4);
      expectSuccess(4, 1, 1, 2);
      expectSuccess(4, 0, 2, 2);
      expectFailure(4, 1, 0, 3);
      expectFailure(4, 2, 0, 2);
      expectFailure(4, 0, 1, 3);
    });

    describe('Four player variations with two fails required', () => {
      expectSuccess(4, 0, 0, 4, true);
      expectSuccess(4, 0, 2, 2, true);
      expectSuccess(4, 1, 0, 3, true);
      expectFailure(4, 1, 1, 2, true);
      expectFailure(4, 2, 0, 2, true);
      expectFailure(4, 0, 1, 3, true);
    });

    describe('Five player variations', () => {
      expectSuccess(5, 0, 0, 5);
      expectSuccess(5, 1, 1, 3);
      expectSuccess(5, 0, 2, 3);
      expectFailure(5, 1, 0, 4);
      expectFailure(5, 2, 0, 3);
      expectFailure(5, 0, 1, 4);
    });

    describe('Five player variations with two fails required', () => {
      expectSuccess(5, 0, 0, 5, true);
      expectSuccess(5, 0, 2, 3, true);
      expectFailure(5, 1, 1, 3, true);
      expectSuccess(5, 1, 0, 4, true);
      expectFailure(5, 2, 0, 3, true);
      expectFailure(5, 0, 1, 4, true);
    });
  });
});
