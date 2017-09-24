/* global describe it beforeEach */
const expect = require('chai').expect
const codenames = require('../../../lib/modules/loveletter/loveletter')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const response = expectResponses.createResponse

describe('Loveletter module (Core)', function () {
  var module, gamebot
  const gameChannel = 'loveletter'

  beforeEach((done) => {
    gamebot = mockGamebot()
    codenames(gamebot, false)
      .then((m) => {
        module = m
        module.reset()
        done()
      })
  })

  describe('Joining and Leaving', () => {
    it('should allow a user join a game', (done) => {
      module.model.players.push('u3', 'u2')
      gamebot.respond = expectResponses([
        response(/^Hey [A-z]+, you've joined love letter\./, 'u1'),
        response(/^[A-z]+ has joined the game\. Current players: [A-z]+, [A-z]+, [A-z]+$/, gameChannel)
      ], done)
      gamebot.simulateMessage('join game', 'u1')
    })

    it('should allow a user to leave a game', (done) => {
      module.model.players.push('u3', 'u2', 'u1')
      gamebot.respond = expectResponses([
        response(/^Hey [A-z]+, you have left the current game of love letter\./, 'u1'),
        response(/^[A-z]+ has left the game\. Current players: [A-z]+, [A-z]+$/, gameChannel)
      ], done)
      gamebot.simulateMessage('leave game', 'u1')
    })

    it('should prevent an existing player from rejoining the game', (done) => {
      module.model.players.push('u3', 'u2', 'u1')
      gamebot.respond = expectResponses([
        response(/^You are already playing love letter\./, 'u1')
      ], done)
      gamebot.simulateMessage('join game', 'u1')
    })

    it('should prevent a non-players from leaving a game', (done) => {
      module.model.players.push('u3', 'u2')
      gamebot.respond = expectResponses([
        response(/^Hey [A-z]+, you weren't playing love letter\./, 'u1')
      ], done)
      gamebot.simulateMessage('leave game', 'u1')
    })
  })

  describe('Stop and reset', () => {
    let stopCommands = ['stop game', 'stop love letter']
    let resetCommands = ['reset game', 'reset love letter']

    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u3')
    })

    stopCommands.forEach((command) => {
      it(`${command} should clear the game state and eject all players`, (done) => {
        gamebot.respond = expectResponses([
          response(/^[A-z]+ has stopped the game\. All players have left the castle\.$/, gameChannel)
        ], done)
        expect(module.model.players).to.deep.equal(['u1', 'u3'])
        gamebot.simulateMessage(command, 'u2')
        expect(module.model.players).to.deep.equal([])
      })
    })

    resetCommands.forEach((command) => {
      it(`${command} should clear the game state but keep all players`, (done) => {
        gamebot.respond = expectResponses([
          response(/^Claus has reset the game\. Current players: John, Claus/, gameChannel)
        ], done)
        expect(module.model.players).to.deep.equal(['u1', 'u3'])
        gamebot.simulateMessage(command, 'u3')
        expect(module.model.players).to.deep.equal(['u1', 'u3'])
      })
    })
  })

  describe('Help', () => {
    ['loveletter help', 'How do I play loveletter?', 'how do I play'].forEach((command) => {
      it('should allow a user to request help on how to play love letter', (done) => {
        gamebot.respond = (target, response, params) => {
          expect(target).to.equal('u1')
          const botname = '@testbot'
          expect(response).to.include(`You can use these commands wherever ${botname} is present; for sensitive commands please send them directly to ${botname} in private chat.`)
          expect(response).to.include(`Provide a list of commands on how to play love letter`)
          expect(response).to.include(`Examples: *love letter help*`)
          done()
        }
        gamebot.simulateMessage(command, 'u1')
      })
    })
  })
})
