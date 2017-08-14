const matchClue = /^([A-z]+)\s+(\d|unlimited)(\s*)$/i

function clue (api, data, model) {
  let matches = data.text.match(matchClue)
  let team = model.activeTeam()
  let spymaster = model.activeSpymaster()
  let clue = {
    word: matches[1],
    number: Number.parseInt(matches[2]) || 0,
    guesses: [],
    team: team.name
  }

  if (data.user !== spymaster) {
    return api.respond(data, `*Warning*: Clues can only be given by the spymaster on the active team (*${api.getUserName(spymaster)}*)`)
  }

  if (model.clues.length > model.turnCounter) {
    return api.respond(data, `*Warning*: Clues can only be set once per turn`)
  }

  model.clues.push(clue)
  model.save()

  api.respond(model.gameChannel, `Clue has been given to the ${team.name} Team: *${clue.word} ${clue.number}* - identify ${clue.number} word(s) by replying with *pick word*`)
}

module.exports = {
  name: 'Clue',
  regex: matchClue,
  description: 'On a turn as spymaster, give a clue to your team. See `clue help` for more information on valid clues.',
  examples: ['flying 3', 'animals 0', 'virus unlimited'],
  handler: (model) => {
    return (api, data) => clue(api, data, model)
  }
}