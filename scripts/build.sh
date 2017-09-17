#!/bin/bash
set -e

DESTINATION_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd "../" && pwd )"
DIR="."

npm install
rm -f $DESTINATION_DIR/gamebot.zip
zip -qr9 -X $DESTINATION_DIR/gamebot.zip \
  $DIR/emojis $DIR/lib \
  $DIR/node_modules \
  $DIR/records $DIR/ssh $DIR/state $DIR/test $DIR/users $DIR/website \
  $DIR/index.js $DIR/package.json $DIR/README.md $DIR/update.sh $DIR/tokens.json

ls -la $DESTINATION_DIR/gamebot.zip
