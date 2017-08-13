/* global describe it beforeEach */
const expect = require('chai').expect
const codenames = require('../../../lib/modules/codenames/codenames')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const response = expectResponses.createResponse

describe('Codenames module (2 Player Game)', function () {
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

  describe('Starting a two-player game', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u7')
    })

    it('should allow an active player to start a two player game', (done) => {
      gamebot.respond = expectResponses([
        response(/^Codenames has begun, teams are:\n>Team Blue: Hannah, and John\n>Team Red: Solitaire Mode\nChoose a spy master for your team by saying "make me spy master"$/, gameChannel)
      ], done)
      gamebot.simulateMessage('start game', 'u7')
    })
  })

  describe('Word selection', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u7')
      gamebot.simulateMessage('start game', 'u7')
    })

    it('should send words to players after spy master has been identified', (done) => {
      gamebot.respond = expectResponses([
        response(/^Hannah you are now a spy master$/, 'private'),
        response(/^Hannah has been assigned as a spy master for Team Blue$/, gameChannel),
        response(/^Starting locations have been identified:(\n>:unclaimed:\s[A-z\s]+){25}$/, gameChannel),
        response(/^Locations have been identified:(\n>:assassin: [A-z\s]+)(\n>:blue: [A-z\s]+){9}(\n>:red: [A-z\s]+){8}(\n>:neutral: [A-z\s]+){7}$/, 'u7'),
        response(/^Hannah your operatives are now active\. Give a one word clue, followed by a number; for example: \*flying 3\* to match 3 words relating to flying\. Say \*help clues\* for more information\./)
      ], done)

      gamebot.simulateMessage('make me spy master', 'u7')
      expect(module.model.activeSpymaster()).to.equal('u7')
    })
  })

  describe('First clue', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u7')
      gamebot.simulateMessage('start game', 'u7')
      gamebot.simulateMessage('make me spy master', 'u7')
    })

    it('should notify users of a valid clue, and prompt them to take action', (done) => {
      gamebot.respond = expectResponses([
        response(/^Clue has been given to the Blue Team: \*sabotage 3\* - identify 3 word\(s\) by replying with \*pick word\*$/, gameChannel)
      ], done)

      gamebot.simulateMessage('sabotage 3', 'u7')
    })

    it('should only accept clues from the spymaster on the active team', (done) => {
      gamebot.respond = expectResponses([
        response(/^\*Warning\*: Clues can only be given by the spymaster on the active team \(\*Hannah\*\)$/, 'private')
      ], done)

      gamebot.simulateMessage('gruel 2', 'u4')
    })

    it('should prevent a spymaster from setting a second clue', (done) => {
      gamebot.simulateMessage('conquered 1', 'u7')
      gamebot.respond = expectResponses([
        response(/^\*Warning\*: Clues can only be set once per turn$/, 'private')
      ], done)
      gamebot.simulateMessage('laughing 4', 'u7')
    })
  })

  describe('Game State', () => {
    it('allow users to list words once a game has started', (done) => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u6')
      gamebot.simulateMessage('join game', 'u7')
      gamebot.simulateMessage('start game', 'u6')
      gamebot.simulateMessage('make me spy master', 'u7')

      gamebot.respond = expectResponses([
        response(/^Current list of locations:(\n>:(unclaimed|red|blue|neutral|assassin):\s[A-z\s]+){25}$/, gameChannel)
      ], done)

      gamebot.simulateMessage('list words', 'u7')
    })
  })

  describe('First pick', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u6')
      gamebot.simulateMessage('join game', 'u7')
      gamebot.simulateMessage('start game', 'u6')
      gamebot.simulateMessage('make me spy master', 'u7')
      gamebot.simulateMessage('sabotage 3', 'u7')
    })

    it('should prevent non-team members making picks', (done) => {
      gamebot.respond = expectResponses([
        response(/^\*Warning\*: Picks can only be made by players on the active team \(\*Angelica\*, and \*John\*\)$/, gameChannel)
      ], done)

      let validWord = module.model.words[0].word
      gamebot.simulateMessage(`pick ${validWord}`, 'u4')
    })

    it('should prevent the active spymaster from making picks', (done) => {
      gamebot.respond = expectResponses([
        response(/^\*Warning\*: Picks can not be made by spy masters$/, gameChannel)
      ], done)

      let validWord = module.model.words[0].word
      gamebot.simulateMessage(`pick ${validWord}`, 'u7')
    })

    it('should prevent team members making invalid picks', (done) => {
      gamebot.respond = expectResponses([
        response(/^\*Warning\*: [A-z]+ is not a valid pick\. Use \*list words\* to relist the available options$/, gameChannel)
      ], done)

      let invalidWord = 'greaseball'
      gamebot.simulateMessage(`pick ${invalidWord}`, 'u1')
    })

    it('should allow team members to make valid picks', (done) => {
      gamebot.respond = expectResponses([
        response(/^[A-z]+ is a :blue: blue team location/, gameChannel)
      ], done)

      let validWord = module.model.words.filter((location) => location.team === 'blue')[0].word
      gamebot.simulateMessage(`pick ${validWord}`, 'u1')
    })
  })
})
