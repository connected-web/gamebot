#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOGFILE="cron.log"
DATE=`date +%Y-%m-%d:%H:%M:%S`

cd $DIR
CURRENT="$(git rev-parse HEAD)"
git pull -r
NEW="$(git rev-parse HEAD)"

if [ "$CURRENT" != "$NEW" ]
then
  MESSAGE="[$DATE] Repo was not at the latest version ( /compare/$CURRENT...$NEW ), updating now."
  echo $MESSAGE
  echo $MESSAGE >> $LOGFILE
  npm i >> $LOGFILE
  pm2 restart all >> $LOGFILE
  echo "Update complete"
else
  echo -n "." >> $LOGFILE
fi

