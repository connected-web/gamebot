const write = require('promise-path').write
const statePath = process.cwd() + '/state/user-list.json'

function updateUserIndex (api, data) {
  // get users
  return api.bot.getUsers().then((users) => {
    api.users = users

      // create index
    var index = {}
    console.log('Users:')
    api.users.members.forEach((user) => {
      index[user.id] = user
      console.log(user.id, user.name)
    })

      // write to disk
    const contents = JSON.stringify(api.users, null, 2)
    write(statePath, contents, 'utf8')

      // register lookup method
    api.getUserById = (userId) => {
      const user = index[userId] || null
      if (!user) {
        console.warn('No user found with ID', userId)
      }
      return user
    }

      // register lookup method
    api.getUserName = (userId) => {
      const poster = api.getUserById(userId) || {}
      const posterName = poster.profile && (poster.profile.first_name || poster.name || userId)
      return posterName
    }

      // register lookup method
    api.findUserByName = (name) => {
      const input = (name + '').toLowerCase()
      const userId = Object.keys(index).filter((userId) => {
        const poster = index[userId]
        const exact = (poster.name + '').toLowerCase() === input
        const profile = poster.profile && (poster.profile.first_name + '').toLowerCase() === input
        const normalized = poster.profile && (poster.profile.real_name_normalized + '').toLowerCase() === input
        return exact || profile || normalized
      })[0] || name
      return index[userId]
    }
  })
}

module.exports = function (api) {
  api.matchers = api.matchers || []
  api.updateUserIndex = updateUserIndex
  api.matchers.push({
    'regex': /(update user index)/,
    'handler': updateUserIndex,
    'description': 'Matched update user index'
  })

  api.updateUserIndex(api).then(() => {
    console.log('Updated user index')
  })
}
