const write = require('promise-path').write;
const statePath = process.cwd() + '/state/channel-list.json';

function isPrivateMessage(data) {
  return data.channel && data.channel.charAt(0) === 'D';
}

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
      const channel = index[id] || false;
      if (!channel) {
        console.warn('No channel found with ID', id);
      }
      return channel;
    };

    // register lookup method
    api.getChannelName = (id) => {
      if (isPrivateMessage(id)) {
        return 'private';
      } else {
        var channel = api.getChannelById(id);
        return channel && channel.name || id;
      };
    };
  });
}

module.exports = function (api) {
  api.matchers = api.matchers || [];
  api.updateChannelIndex = updateChannelIndex;
  api.matchers.push({
    regex: /(update channel index)/,
    handler: updateChannelIndex,
    description: 'Matched update channel index'
  });

  api.updateChannelIndex(api).then(() => {
    console.log('Updated channel index');
  });
};
