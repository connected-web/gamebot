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

Gamebot is currently hosted on a private openstack instance, login to the machine requires the correct private key creating at `ssh/cloud.key`, at which point you can use `ssh/login.sh` to gain access.

On the machine you will need to create `tokens.json` based on `tokens.template.json` and feed it with the a slackbot token in order to connect.

## Release

A cron tab has been setup on the machine to check for updated from the remote every minute. If a change is detected, then the update script will run `npm install` followed by `pm2 restart all`.

See [update.sh](./update.sh) and `crontab -e`. Use `crontab -l` to check the existing settings.

Recommended value for Ubuntu server: `* * * * * /home/ubuntu/tap-slack-bot/update.sh > /dev/pts/0`

## Website

Gamebot has its own website monitoring system as well.

To start the website for development, run:
- `npm run website`
