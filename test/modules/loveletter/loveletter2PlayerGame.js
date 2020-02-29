/* global describe it beforeEach */
const codenames = require('../../../lib/modules/loveletter/loveletter')
const mockGamebot = require('../../lib/mockGamebot')
const expectResponses = require('../../lib/expectResponses')
const response = expectResponses.createResponse

describe('Loveletter module (2 Player Game)', function () {
  var module,
    gamebot
  const gameChannel = 'loveletter'

  function validTargetName () {
    const model = module.model
    const validTargets = model.getValidTargets().map(target => gamebot.getUserName(target.player))
    return validTargets[0]
  }

  beforeEach((done) => {
    gamebot = mockGamebot()
    codenames(gamebot, false).then((m) => {
      module = m
      module.reset()
      done()
    })
  })

  describe('Starting a game', () => {
    it('should allow players to start a game', (done) => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u2')
      gamebot.respond = expectResponses([
        response(/^Love Letter has begun, the player order is:\n(>[A-z]+\n){2}<@u\d> has the first turn.$/, gameChannel),
        response(/^Hey \*(John|Henrietta)\*! Your starting cards are \*_[A-Z][A-z]+ \(\d\)_\*, and \*_[A-Z][A-z]+ \(\d\)_\*\. Please take your turn by responding with \*play [A-Z][A-z]+\* or \*play [A-Z][A-z]+\*.$/),
        response(/^Hey \*(John|Henrietta)\*! Your starting card is \*_[A-Z][A-z]+ \(\d\)_\*\. \*(John|Henrietta)\* is the first player.$/)
      ], done)
      gamebot.simulateMessage('start game', 'u2')
    })
  })

  describe('Playing a card', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u2')
      gamebot.simulateMessage('start game', 'u2')
    })

    it('should allow players to play a card on their turn', (done) => {
      const currentPlayer = module.model.currentPlayer
      const playerHand = module.model.playerHands.filter((pc) => pc.player === currentPlayer)[0]
      playerHand.cards = ['prince', 'priest']
      gamebot.respond = expectResponses([
        response(/^(John|Henrietta) has played a \*_[A-z]+ \(\d\)_\*\./, gameChannel),
        response(/^Please choose a player to target by responding with \*target Henrietta\*, or \*target John\*/, currentPlayer)
      ], done)
      gamebot.simulateMessage(`play ${playerHand.cards[0]}`, currentPlayer)
    })

    it('should prevent players from playing a card who are not in the game', (done) => {
      gamebot.respond = expectResponses([response(/^Unable to play card, you are not part of this game\.$/, 'u3')], done)
      gamebot.simulateMessage('play King', 'u3')
    })

    it('should prevent players from playing a card when it is not their turn', (done) => {
      const currentPlayer = module.model.currentPlayer
      const notCurrentPlayer = module.model.players.filter((player) => player !== currentPlayer)[0]
      gamebot.respond = expectResponses([response(/^Unable to play card, you are not the current player. Waiting for [A-z]+ to take their turn\.$/, notCurrentPlayer)], done)
      gamebot.simulateMessage('play King', notCurrentPlayer)
    })

    it('should prevent players from playing an invalid card name', (done) => {
      const currentPlayer = module.model.currentPlayer
      gamebot.respond = expectResponses([response(/^Unable to play card, _[A-z]+_ is not a valid card\.$/, currentPlayer)], done)
      gamebot.simulateMessage('play Kingy', currentPlayer)
    })

    it(`should prevent players from playing a valid card they don't have`, (done) => {
      const currentPlayer = module.model.currentPlayer
      const playerHand = module.model.getPlayerHandFor(currentPlayer)
      const notPlayerHand = ['guard', 'priest', 'baron', 'handmaid', 'prince', 'king', 'countess', 'princess'].filter((card) => !playerHand.cards.includes(card))[0]

      gamebot.respond = expectResponses([response(/^Unable to play card, you do not have a _[A-z]+_ card in your hand\.$/, currentPlayer)], done)
      gamebot.simulateMessage(`play ${notPlayerHand}`, currentPlayer)
    })

    it('should prevent players playing a second card on their turn', (done) => {
      const currentPlayer = module.model.currentPlayer
      const playerHand = module.model.getPlayerHandFor(currentPlayer)
      playerHand.cards = ['guard', 'priest']

      gamebot.simulateMessage(`play ${playerHand.cards[0]}`, currentPlayer)
      gamebot.respond = expectResponses([response(/^Unable to play card, you have already played _[A-z]+_ this turn. Please a target a player using \*target playerName\*\.$/, currentPlayer)], done)
      gamebot.simulateMessage(`play ${playerHand.cards[0]}`, currentPlayer)
    })
  })

  describe('Targetting a player', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u2')
      gamebot.simulateMessage('start game', 'u2')
    })

    it('should be possible to target a player, when playing a guard', (done) => {
      const currentPlayer = module.model.currentPlayer
      const otherPlayer = module.model.players.filter(p => p !== currentPlayer)[0]
      const playerHand = module.model.getPlayerHandFor(currentPlayer)
      const opponentHand = module.model.getPlayerHandFor(otherPlayer)

      playerHand.cards = ['guard', 'priest']
      opponentHand.cards = ['prince']

      gamebot.simulateMessage(`play guard`, currentPlayer)

      gamebot.respond = expectResponses([
        response(/^You were targetted by [A-z]+, but they incorrectly guessed that you have a \*_Princess \(8\)_\*\./),
        response(/You targetted [A-z]+, but you incorrectly guessed that they had a \*_Princess \(8\)_\*./, currentPlayer),
        response(/<@u\d> has been targetted by [A-z]+, but they do not have a \*_Princess \(8\)_\*\./, gameChannel),
        response(/It is now [A-z]+'s turn./, gameChannel),
        response(/You have drawn a \*_[A-z]+ \(\d\)_\* to go with your \*_[A-z]+ \(\d\)_\*. Please take your turn by responding with \*play [A-z]+\* or \*play [A-z]+\*./)
      ], done)
      gamebot.simulateMessage(`target ${validTargetName()}, princess`, currentPlayer)
    })

    it('should be possible to target a player, when playing a priest', (done) => {
      const currentPlayer = module.model.currentPlayer
      const playerHand = module.model.getPlayerHandFor(currentPlayer)
      playerHand.cards = ['handmaid', 'priest']

      gamebot.simulateMessage(`play priest`, currentPlayer)

      gamebot.respond = expectResponses([
        response(/^Your card \*_[A-z]+ \(\d\)_\* has been revealed to [A-z]+\./),
        response(/You have used your \*_[A-z]+ \(\d\)_\* to see that [A-z]+ has a \*_[A-z]+ \(\d\)_\*\./, currentPlayer),
        response(/[A-z]+ has been targetted by [A-z]+; [A-z]+'s role has been revealed to [A-z]+./, gameChannel),
        response(/It is now [A-z]+'s turn./, gameChannel),
        response(/You have drawn a \*_[A-z]+ \(\d\)_\* to go with your \*_[A-z]+ \(\d\)_\*. Please take your turn by responding with \*play [A-z]+\* or \*play [A-z]+\*./)
      ], done)
      gamebot.simulateMessage(`target ${validTargetName()}`, currentPlayer)
    })
  })

  describe('Cards remaining in a deck', () => {
    beforeEach(() => {
      gamebot.simulateMessage('join game', 'u1')
      gamebot.simulateMessage('join game', 'u2')
      gamebot.simulateMessage('start game', 'u2')
    })

    it('should notify the player how many cards are left in the deck each turn', (done) => {
      const currentPlayer = module.model.currentPlayer
      const otherPlayer = module.model.players.filter(p => p !== currentPlayer)[0]
      const playerHand = module.model.getPlayerHandFor(currentPlayer)
      const opponentHand = module.model.getPlayerHandFor(otherPlayer)

      playerHand.cards = ['handmaid', 'priest']
      opponentHand.cards = ['prince']

      gamebot.respond = expectResponses([
        response(/^(John|Henrietta) has played a \*_[A-z]+ \(\d\)_\*\./, gameChannel),
        response(/protected/),
        response(/It is now [A-z]+'s turn./, gameChannel),
        response(/^(You) have played a \*_[A-z]+ \(\d\)_\*/),
        response(/There are [\d]+ cards remaining in the deck\./)
      ], done)
      gamebot.simulateMessage(`play handmaid`, currentPlayer)
    })

    it('should notify the player of a single card left in the deck', (done) => {
      const currentPlayer = module.model.currentPlayer
      const otherPlayer = module.model.players.filter(p => p !== currentPlayer)[0]
      const playerHand = module.model.getPlayerHandFor(currentPlayer)
      const opponentHand = module.model.getPlayerHandFor(otherPlayer)
      const deck = module.model.deck

      playerHand.cards = ['handmaid', 'priest']
      opponentHand.cards = ['prince']
      while (deck.length > 2) {
        deck.pop()
      }

      gamebot.respond = expectResponses([
        response(/^(John|Henrietta) has played a \*_[A-z]+ \(\d\)_\*\./, gameChannel),
        response(/protected/),
        response(/It is now [A-z]+'s turn./, gameChannel),
        response(/^(You) have played a \*_[A-z]+ \(\d\)_\*/),
        response(/There is 1 card remaining in the deck\./)
      ], done)
      gamebot.simulateMessage(`play handmaid`, currentPlayer)
    })
  })
})
