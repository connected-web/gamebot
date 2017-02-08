# Gamebot

A slackbot for board games and games channels. Responds to gameplay related chatter.

## Features
- Basic understanding of users and channels
- Private and non-private messaging
- Modular structure for adding new responses
- Accusation module for making baseless accusations
- Howl module for occasional howling
- Resistance module for playing group games of resistance

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

You will also need to:
- Import custom icons slack for `:good_guy:`, `:bad_guy:` etc.

## Hosting

Gamebot is currently hosted on a private openstack instance, if you've been given the private key you can redeploy.

Copy the private key to `ssh/cloud.key`, then run `./redeploy.sh` to prompt the server to update.

You will need to create `tokens.json` based on `tokens.template.json` and feed it with the a slackbot token in order to connect.

## Website

Gamebot has its own website monitoring system as well.

To start the website for develoment, run:
- `npm run website`
