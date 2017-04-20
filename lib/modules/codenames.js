var matcher = /^make me spy ?master/i;
const gameChannel = 'codenames';

// Process the accusation
function makeUserSpyMaster(api, data) {
  const posterName = api.getUserName(data.user);

  api.respond(data, `${posterName} you are now a spy master`);
  api.respond(gameChannel, `${posterName} has been assigned as a spy master for X team`);
}

module.exports = function (api) {
  api.matchers = api.matchers || [];
  api.matchers.push({
    'regex': matcher,
    'handler': makeUserSpyMaster,
    'description': 'Make the user a spy master'
  });
};
