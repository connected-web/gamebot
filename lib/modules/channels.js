const write = require('promise-path').write;
const statePath = process.cwd() + '/state/channel-list.json';

function updateChannelIndex(api, data) {
  // get users
  return api.bot.getChannels().then((response) => {
    api.channels = response.channels;

    // create index
    var index = {};
    console.log('Channels:');
    api.channels.forEach((channel) => {
      index[channel.id] = channel;
      console.log(channel.id, channel.name);
    });

    // write to disk
    const contents = JSON.stringify(api.channels, null, 2);
    write(statePath, contents, 'utf8');

    // register lookup method
    api.getChannelById = (id) => {
      const user = index[id] || null;
      if (!user) {
        console.warn('No channel found with ID', id);
      }
      return user;
    };
  });
}

module.exports = function(api) {
  api.matchers = api.matchers || [];
  api.updateChannelIndex = updateChannelIndex;
  api.matchers.push({
    'regex': /(update channel index)/,
    'handler': updateChannelIndex,
    'description': 'Matched update channel index'
  });

  api.updateChannelIndex(api).then(() => {
    console.log('Updated channel index');
  });
};
