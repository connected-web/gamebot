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
- Create a [slack bot to gain an access token](https://my.slack.com/services/new/bot)
- Create an access token file using `tokens.template.json`
- Test it
  - `npm test`
- Run it
  - `npm start`

You will also need to import custom emojis, please follow this guide: [emojis/README.md](./emojis/README.md)

## Hosting

Gamebot is currently hosted on a private Raspberry Pi.

On the machine you will need to create `tokens.json` based on `tokens.template.json` and feed it with the correct slackbot tokens in order to connect.

## Release

Releases should be performed using the `npm run deploy` script, connected on the same network as the Raspberry Pi. You will need to provide your SSH key, to be added to the list of authorized SSH keys on the device.

## Website

Gamebot has its own website monitoring system as well, although this is only accessible from the local network.

To start the website for development, run:
- `npm run website`
