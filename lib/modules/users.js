function updateUserIndex(api, data) {
  // get users
  api.bot.getUsers().then((users) => {
    api.users = users;

    // log data
    console.log('Users', JSON.stringify(api.users, null, 2));

    // create index
    var index = {};
    api.users.members.forEach((user) => {
      index[user.id] = user;
      console.log(user.id, user.name);
    });

    // register lookup method
    api.getUserById = (id) => {
      const user = index[id] || null;
      if (!user) {
        console.warn('No user found with ID', id);
      }
      return user;
    };
  });
}

module.exports = function(api) {
  api.matchers = api.matchers || [];
  api.updateUserIndex = updateUserIndex;
  api.matchers.push({
    'regex': /(update user index)/,
    'handler': updateUserIndex,
    'description': 'Matched update user index'
  });

  api.updateUserIndex(api);
};
