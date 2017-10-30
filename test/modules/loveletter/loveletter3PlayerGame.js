/* global describe it beforeEach */
const codenames = require('../../../lib/modules/loveletter/loveletter')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const response = expectResponses.createResponse

describe('Loveletter module (2 Player Game)', function () {
  var module,
    gamebot
  const gameChannel = 'loveletter'

  beforeEach((done) => {
    gamebot = mockGamebot()
    codenames(gamebot, false).then((m) => {
      module = m
      module.reset()
      done()
    })
  })

  describe('Winning the game', () => {
    it('should allow the player with the highest card at the end of a game to win', (done) => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u2')
      gamebot.simulateMessage('join game', 'u3')
      gamebot.simulateMessage('start game', 'u2')

      module.model.deck = []
      module.model.cardOutOfTheGame = 'priest'
      module.model.playerHands = [
        {
          player: 'u1',
          cards: ['king'],
          discardedCards: ['guard', 'guard', 'guard', 'guard', 'guard']
        },
        {
          player: 'u2',
          cards: ['princess'],
          discardedCards: ['priest', 'baron', 'handmaid']
        },
        {
          player: 'u3',
          cards: ['countess', 'handmaid'],
          discardedCards: ['prince', 'prince', 'baron']
        }
      ]
      module.model.currentPlayer = 'u3'

      gamebot.respond = expectResponses([
        response(/^Claus has played a \*_Handmaid \(4\)_\*\.$/, gameChannel),
        response(/^Claus is now protected until the start of their next turn\.$/, gameChannel),
        response(/^You have played a \*_Handmaid \(4\)_\* and are now protected until the start of your next turn\.$/, 'u3'),
        response(/^There are no more courtiers accessible, the player with access to the courtier closest to the Princess will have their love letter delivered to the Princess\.$/, gameChannel),
        response(/^Henrietta has won the round! They have successfully delivered a love letter to the Princess and received a token of her affection\.$/),
        response(/^The final cards for each player are: Claus had a \*_Countess \(7\)_\*, Henrietta had a \*_Princess \(8\)_\*, and John had a \*_King \(6\)_\*/, gameChannel),
        response(/^The card out of the game was \*_Priest \(2\)_\*\.$/, gameChannel),
        response(/^When you're ready, respond with \*start next round\* to continue play, or \*stop game\* to end\.$/, gameChannel)
      ], done)
      gamebot.simulateMessage('play handmaid', 'u3')
    })
  })
})
