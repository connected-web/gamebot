/* global describe it beforeEach */
const expect = require('chai').expect
const codenames = require('../../../lib/modules/codenames/codenames')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const response = expectResponses.createResponse

describe('Codenames module (Core)', function () {
  var module, gamebot
  const gameChannel = 'codenames'

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
        response(/^Hey [A-z]+, you've joined codenames\. Your team will be assigned randomly after the game is started\./, 'u1'),
        response(/^[A-z]+ has joined the game\. Current players: [A-z]+, [A-z]+, [A-z]+$/, gameChannel)
      ], done)
      gamebot.simulateMessage('join game', 'u1')
    })

    it('should allow a user to leave a game', (done) => {
      module.model.players.push('u3', 'u2', 'u1')
      gamebot.respond = expectResponses([
        response(/^Hey [A-z]+, you have left the current game of codenames\./, 'u1'),
        response(/^[A-z]+ has left the game\. Current players: [A-z]+, [A-z]+$/, gameChannel)
      ], done)
      gamebot.simulateMessage('leave game', 'u1')
    })

    it('should prevent an existing player from rejoining the game', (done) => {
      module.model.players.push('u3', 'u2', 'u1')
      gamebot.respond = expectResponses([
        response(/^You are already playing codenames\./, 'u1')
      ], done)
      gamebot.simulateMessage('join game', 'u1')
    })

    it('should prevent a non-players from leaving a game', (done) => {
      module.model.players.push('u3', 'u2')
      gamebot.respond = expectResponses([
        response(/^Hey [A-z]+, you weren't playing codenames\./, 'u1')
      ], done)
      gamebot.simulateMessage('leave game', 'u1')
    })
  })

  describe('Stop and reset', () => {
    let stopCommands = ['stop game', 'stop codenames']
    let resetCommands = ['reset game', 'reset codenames']

    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u3')
    })

    stopCommands.forEach((command) => {
      it(`${command} should clear the game state and eject all players`, (done) => {
        gamebot.respond = expectResponses([
          response(/^[A-z]+ has stopped the game\. All players have gone underground\.$/, gameChannel)
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

  describe('Starting a game', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u3')
    })

    it('should prevent non-players from starting a game', (done) => {
      gamebot.respond = expectResponses([
        response(/^[A-z]+ - please join the game in order to begin playing\. Say 'start game' when ready\./, 'u2')
      ], done)
      gamebot.simulateMessage('start game', 'u2')
    })

    it('should prevent a game starting if there are less than two players', (done) => {
      gamebot.simulateMessage('leave game', 'u3')
      gamebot.respond = expectResponses([
        response(/^Unable to start the game, there needs to be at least two players\./, 'u1')
      ], done)
      gamebot.simulateMessage('start game', 'u1')
    })

    it('should allow an active player to start a game', (done) => {
      gamebot.respond = expectResponses([
        response(/^Codenames has begun, teams are:/, gameChannel)
      ], done)
      gamebot.simulateMessage('start game', 'u1')
    })
  })

  describe('Who is playing?', () => {
    ['who is playing', 'list players'].forEach((command) => {
      it('should allow a user to request a list of players', (done) => {
        gamebot.simulateMessage('join game', 'u1')
        gamebot.simulateMessage('join game', 'u7')
        gamebot.respond = (target, response, params) => {
          expect(response).to.equal(`Teams not assigned, current players: Hannah, and John`)
          done()
        }
        gamebot.simulateMessage(command, 'u1')
      })

      it('should allow a user to request a list of teams', (done) => {
        gamebot.simulateMessage('join game', 'u1')
        gamebot.simulateMessage('join game', 'u2')
        gamebot.simulateMessage('join game', 'u3')
        gamebot.simulateMessage('join game', 'u7')
        gamebot.simulateMessage('start game', 'u1')
        gamebot.simulateMessage('make me spymaster', 'u7')
        gamebot.simulateMessage('make me spymaster', 'u3')
        gamebot.respond = (target, response, params) => {
          expect(response).to.match(/Teams assigned: :blue: [A-z]+, :blue: [A-z]+, :red: [A-z]+, and :red: [A-z]+/)
          done()
        }
        gamebot.simulateMessage(command, 'u1')
      })
    })
  })

  describe('Starting a new round', () => {
    ['start next round', 'start new game'].forEach((command) => {
      beforeEach(() => {
        gamebot.simulateMessage('join game', 'u1')
        gamebot.simulateMessage('join game', 'u7')
        gamebot.simulateMessage('start game', 'u7')
        gamebot.simulateMessage('make me spy master', 'u7')

        let validWord = module.model.words.filter((location) => location.team === 'assassin')[0].word
        gamebot.simulateMessage(`pick ${validWord}`, 'u1')
      })

      it('should allow a user to start a new round at the end of a game', (done) => {
        gamebot.respond = expectResponses([
          response(/^John has started a new game!/, gameChannel)
        ], done)
        gamebot.simulateMessage(command, 'u1')
      })
    })
  })

  describe('Help', () => {
    ['codenames help', 'How do I play codenames?', 'how do I play'].forEach((command) => {
      it('should allow a user to request help on how to play codenames', (done) => {
        gamebot.respond = (target, response, params) => {
          expect(target).to.equal('u1')
          const botname = '@testbot'
          expect(response).to.include(`You can use these commands wherever ${botname} is present; for sensitive commands please send them directly to ${botname} in private chat.`)
          expect(response).to.include(`Provide a list of commands on how to play codenames`)
          expect(response).to.include(`Examples: *codenames help*`)
          done()
        }
        gamebot.simulateMessage(command, 'u1')
      })
    })
  })
})
