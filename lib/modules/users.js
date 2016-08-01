function listUsers(api, data) {
  api.users = api.bot.getUsers()
  console.log('Users', JSON.stringify(api.users, null, 2));
}

module.exports = function(api) {
  api.matchers = api.matchers || [];
  api.matchers.push({
    'regex': /(list users)/,
    'handler': listUsers,
    'description': 'Matched list users'
  });
};
