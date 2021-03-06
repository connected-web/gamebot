const grammarList = require('grammarlist')
const embolden = (name) => `*${name}*`

const nextTurn = require('../shared/nextTurn')

function pick (api, data, model) {
  const word = data.text.match(module.exports.regex)[1].trim().toLowerCase()

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
  return (model.words.filter((item) => item.word.toLowerCase() === word.toLowerCase()).length > 0)
}

function revealLocation (api, data, word, model) {
  // collection information
  let location = model.words.filter((item) => item.word.toLowerCase() === word.toLowerCase())[0]
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
    if (clue.number === -1) {
      remainingGuesses = remainingWords
    }

    let locTeamName = model.getTeamName(location.team)
    let locIcon = model.getTeamIcon(location.team)

    if (location.team === 'assassin') {
      api.respond(model.gameChannel, `*${word}* is the ${locIcon} ${locTeamName} team location, the :${teamName.toLowerCase()}: ${teamName} Team loses the game!`)
      model.gameOver = true
    } else if (location.team === 'neutral') {
      api.respond(model.gameChannel, `*${word}* is a ${locIcon} ${locTeamName} team location, the :${teamName.toLowerCase()}: ${teamName} Team have ended their turn!`)
      nextTurn(api, data, model)
    } else if (model.findTeam(location.team) === activeTeam) {
      if (remainingWords === 0) {
        api.respond(model.gameChannel, `*${word}* is a ${locIcon} ${locTeamName} team location. :${teamName.toLowerCase()}: ${teamName} Team have have won the game!`)
        model.gameOver = true
        model.winner = activeTeam
      } else if (remainingGuesses > 0) {
        if (remainingGuesses === 1) {
          api.respond(model.gameChannel, `*${word}* is a ${locIcon} ${locTeamName} team location. :${teamName.toLowerCase()}: ${teamName} Team have 1 more guess this turn, alternatively use *end turn* to pass play to the other team.`)
        } else {
          api.respond(model.gameChannel, `*${word}* is a ${locIcon} ${locTeamName} team location. :${teamName.toLowerCase()}: ${teamName} Team have ${remainingGuesses} more guesses this turn!`)
        }
      } else {
        api.respond(model.gameChannel, `*${word}* is a ${locIcon} ${locTeamName} team location. :${teamName.toLowerCase()}: ${teamName} Team have 0 remaining guesses, their turn has ended!`)
        nextTurn(api, data, model)
      }
    } else {
      api.respond(model.gameChannel, `*${word}* is a ${locIcon} ${locTeamName} team location, the :${teamName.toLowerCase()}: ${teamName} Team have ended their turn!`)
      nextTurn(api, data, model)
    }
    model.save()
  }
}

module.exports = {
  name: 'Pick word',
  regex: /^pick,?\s([A-z\s-]+)/i,
  description: 'Pick a word as a guess for your team',
  examples: ['pick elephant'],
  handler: (model) => {
    return (api, data) => pick(api, data, model)
  }
}
