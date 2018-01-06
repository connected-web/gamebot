const path = require('path')
const { read, write } = require('promise-path')
const words = require('./words')
const statePath = path.join(process.cwd(), 'state/codenames-state.json')

function reset (model) {
  model.gameChannel = 'codenames'
  model.players = []
  model.teams = [{
    name: 'Blue',
    players: [],
    spymaster: false,
    solitaire: false,
    teamId: 'team1'
  }, {
    name: 'Red',
    players: [],
    spymaster: false,
    solitaire: false,
    teamId: 'team2'
  }]
  model.words = []
  model.clues = []
  model.started = false
  model.roundOver = false
  model.turnCounter = 0
  model.gameOver = false
  model.winner = false
  model.wordlist = 'standard'
}

function activeSpymaster (model) {
  return model.activeTeam().spymaster
}

function activeTeam (model) {
  return (model.teams[model.turnCounter % model.teams.length])
}

function spyMasters (model) {
  return model.teams.map((team) => team.spymaster)
}

function pickWords (model) {
  let result = []
  let list = words(model.wordlist)
  while (result.length < 25) {
    let i = Math.floor(Math.random() * list.length)
    let word = list[i]
    list.splice(i, 1)
    result.push({
      word
    })
  }

  result = assignTeams(result)

  model.words = result
}

function findRemainingWords (model, teamName) {
  let team = model.findTeam(teamName)
  return model.words.filter((location) => location.team === team.teamId && !location.revealed)
}

function assignTeams (words) {
  let team1Words = []
  let team2Words = []
  let assassinWords = []
  let neutralWords = []

  while (team1Words.length < 9) {
    let i = Math.floor(Math.random() * words.length)
    let word = words[i]
    team1Words.push(word)
    word.team = 'team1'
    words.splice(i, 1)
  }

  while (team2Words.length < 8) {
    let i = Math.floor(Math.random() * words.length)
    let word = words[i]
    team2Words.push(word)
    word.team = 'team2'
    words.splice(i, 1)
  }

  while (assassinWords.length < 1) {
    let i = Math.floor(Math.random() * words.length)
    let word = words[i]
    assassinWords.push(word)
    word.team = 'assassin'
    words.splice(i, 1)
  }

  while (words.length > 0) {
    let word = words.pop()
    neutralWords.push(word)
    word.team = 'neutral'
  }

  return [].concat(team1Words, team2Words, assassinWords, neutralWords).sort((a, b) => {
    return a.word.localeCompare(b.word, 'en', {
      'sensitivity': 'base'
    })
  })
}

function saveModel (model) {
  const contents = JSON.stringify(model, null, 2)
  return write(statePath, contents, 'utf8')
}

function readModel (model) {
  return read(statePath, 'utf8')
    .then(JSON.parse)
    .then((data) => {
      Object.keys(data).forEach((key) => {
        model[key] = data[key]
      })
      return model
    })
    .catch((ex) => {
      console.error('Unable to read codenames state', ex)
    })
    .then(() => model)
}

function findTeam (model, search) {
  search = ('' + search).toLowerCase()
  return model.teams.filter((team) => team.teamId === search || team.name.toLowerCase() === search)[0]
}

function getTeamName (model, search) {
  let team = model.findTeam(search)
  let name = (team && team.name) || search
  return name
}

function getTeamIcon (model, teamId) {
  let icon = model.getTeamName(teamId).toLowerCase()
  return `:${icon}:`
}

function create () {
  let model = {}
  reset(model)

  return readModel(model)
    .then((model) => {
      model.pickWords = () => pickWords(model)
      model.reset = () => reset(model)
      model.activeSpymaster = () => activeSpymaster(model)
      model.activeTeam = () => activeTeam(model)
      model.findRemainingWords = (teamName) => findRemainingWords(model, teamName)
      model.spyMasters = () => spyMasters(model)
      model.findTeam = (teamId) => findTeam(model, teamId)
      model.getTeamIcon = (teamId) => getTeamIcon(model, teamId)
      model.getTeamName = (search) => getTeamName(model, search)
      model.save = () => saveModel(model)
      model.read = () => readModel(model)
      return model
    })
}

module.exports = create
