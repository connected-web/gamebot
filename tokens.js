module.exports = [{
  'id': 'resistancebot',
  'token': process.env.RESISTANCEBOT_TOKEN,
  'name': 'Resistance Bot',
  'avatar': 'https://avatars.slack-edge.com/2017-01-01/122247673123_a4dc4e9941a6cc23a234_192.png',
  'modules': [
    'accusation',
    'resistance',
    'channels',
    'messages',
    'users',
    'status'
  ]
}, {
  'id': 'codenamesbot',
  'token': process.env.SPYMASTERBOT_TOKEN,
  'name': 'Codenames Bot',
  'avatar': 'https://ca.slack-edge.com/T3KJBUDUH-U524MQWAX-e4bd17b061a6-192',
  'modules': [
    'codenames',
    'channels',
    'messages',
    'users'
  ]
}, {
  'id': 'princessbot',
  'token': process.env.PRINCESSBOT_TOKEN,
  'name': 'Princess Bot',
  'avatar': 'https://ca.slack-edge.com/T3KJBUDUH-U6X8VUEG0-622d93cd3235-1024',
  'modules': [
    'loveletter',
    'channels',
    'messages',
    'users'
  ]
}, {
  'id': 'wolfbot',
  'token': process.env.WOLFBOT_TOKEN,
  'name': 'Wolf Bot',
  'avatar': 'https://s3-us-west-2.amazonaws.com/slack-files2/avatar-temp/2017-05-30/189595889379_fcf19175428ae24e0b17.jpg',
  'modules': [
    'howl',
    'channels',
    'messages',
    'users'
  ]
}]
