# Gamebot

A slackbot for board games and games channels. Responds to gameplay related chatter.

## Features
- Basic understanding of users and channels
- Private and non-private messaging
- Modular structure for adding new responses
- Accusation module for making baseless accusations
- Howl module for occasional howling

- Resistance module for playing group games of Resistance
- Codenames module for playing group games of Codenames
- Loveletter module for playing group games of Loveletter

## Development

- Checkout the code
- Install dependencies
  - `npm i`
- Test it
  - `npm test`
- Create a [slack bot to gain an access token](https://my.slack.com/services/new/bot)
- Each bot is configured in `tokens.json`, to keep your tokens private, set environment variables:
  ```
  export RESISTANCEBOT_TOKEN='abcd-1234-...'
  export SPYMASTERBOT_TOKEN='abcd-1234-...'
  export PRINCESSBOT_TOKEN='abcd-1234-...'
  export WOLFBOT_TOKEN='abcd-1234-...'
  ```
- Run it
  - `npm start`

For best results, you should also import custom emojis, please follow this guide: [emojis/README.md](./emojis/README.md)

## Hosting

Gamebot is currently hosted on a private Raspberry Pi.

## Releasing

A jenkins job has been created to build the gamebot files into a zip, transfer them to the remote server, and then install as a `systemctl` service. For a fresh install, in order to pick up the secret tokens, you will need to manually create `gamebot.env` using `gamebot.env.example` as a template.

Changes to master will automatically be deployed to the development machine.

When ready to release to live, provide either a tag name or branch identifier to release from, and target the production machine.
