const grammarList = require('grammarlist')
const embolden = (name) => `*${name}*`

const nextTurn = require('../shared/nextTurn')

function pick (api, data, model) {
  const word = data.text.match(module.exports.regex)[1].toLowerCase()

  const activeTeam = model.activeTeam()
  const activeSpymaster = model.activeSpymaster()
  const teamPlayers = activeTeam.players.filter((player) => player !== activeSpymaster)
  const playerNames = teamPlayers.map(api.getUserName)

  if (data.user === activeSpymaster) {
    api.respond(model.gameChannel, `*Warning*: Picks can not be made by spy masters`)
  } else if (teamPlayers.includes(data.user)) {
    if (isValidLocation(model, word)) {
      revealLocation(api, data, word, model)
    } else {
      api.respond(model.gameChannel, `*Warning*: ${word} is not a valid pick. Use *list words* to relist the available options`)
    }
  } else {
    api.respond(model.gameChannel, `*Warning*: Picks can only be made by players on the active team (${grammarList(playerNames.map(embolden))})`)
  }
}

function isValidLocation (model, word) {
  return (model.words.filter((item) => item.word === word).length > 0)
}

function revealLocation (api, data, word, model) {
  // collection information
  let location = model.words.filter((item) => item.word === word)[0]
  let activeTeam = model.activeTeam()
  let teamName = activeTeam.name
  let clue = model.clues[model.clues.length - 1]

  if (!clue || clue.team !== teamName) {
    api.respond(model.gameChannel, `*Warning*: Cannot make pick; no clue has been given by the spy master for this turn`)
  } else if (location.revealed) {
    api.respond(model.gameChannel, `*Warning*: ${word} has already been revealed. Pick a different word!`)
  } else {
    // log guess
    clue.guesses.push(word)
    // reveal location
    location.revealed = true
    // remaining guesses
    let remainingWords = model.findRemainingWords(teamName).length
    let remainingGuesses = Math.min(1 + clue.number - clue.guesses.length, remainingWords)
    if (location.team === 'assassin') {
      api.respond(model.gameChannel, `*${word}* is the :${location.team}: ${location.team} team location, the :${teamName.toLowerCase()}: ${teamName} Team loses the game!`)
      model.gameOver = true
    } else if (location.team === 'neutral') {
      api.respond(model.gameChannel, `*${word}* is a :${location.team}: ${location.team} team location, the :${teamName.toLowerCase()}: ${teamName} Team have ended their turn!`)
      nextTurn(api, data, model)
    } else if (location.team === activeTeam.name.toLowerCase()) {
      if (remainingWords === 0) {
        api.respond(model.gameChannel, `*${word}* is a :${location.team}: ${location.team} team location. :${teamName.toLowerCase()}: ${teamName} Team have have won the game!`)
        model.gameOver = true
        model.winner = activeTeam
      } else if (remainingGuesses > 0) {
        if (remainingGuesses === 1) {

        } else {
          api.respond(model.gameChannel, `*${word}* is a :${location.team}: ${location.team} team location. :${teamName.toLowerCase()}: ${teamName} Team have ${remainingGuesses} more guesses this turn!`)
        }
      } else {
        api.respond(model.gameChannel, `*${word}* is a :${location.team}: ${location.team} team location. :${teamName.toLowerCase()}: ${teamName} Team have ${remainingGuesses} remaining guesses, their turn has ended!`)
        nextTurn(api, data, model)
      }
    } else {
      api.respond(model.gameChannel, `*${word}* is a :${location.team}: ${location.team} team location, the :${teamName.toLowerCase()}: ${teamName} Team have ended their turn!`)
      nextTurn(api, data, model)
    }
    model.save()
  }
}

module.exports = {
  name: 'Pick word',
  regex: /^pick ([A-z]+)/i,
  description: 'Pick a word as a guess for your team',
  examples: ['pick elephant'],
  handler: (model) => {
    return (api, data) => pick(api, data, model)
  }
}
