# Gamebot

A slackbot for board games and games channels. Responds to gameplay related chatter.

## Development

- Checkout the code
- Install dependencies
  - `npm i`
- Set the access token
  - `export GAMEBOT_TOKEN={insert-token-here}`
- Test it
  - `npm test`
- Run it
  - `npm start`

## Hosting

Gamebot is currently hosted on a private openstack instance, if you've been given the private key you can redeploy.

Copy the private key to `ssh/cloud.key`, then run `./redeploy.sh` to prompt the server to update.


## Website

Gamebot has its own website monitoring system as well.

To start the website for develoment, run:
- `npm run website`
