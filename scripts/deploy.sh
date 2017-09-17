DEST="pi@192.168.0.12"

scp gamebot.zip $DEST:~
ssh $DEST <<'ENDSSH'

echo "Unzipping gamebot to home directory"
unzip -qo ~/gamebot.zip -d ~/gamebot

cd ~/gamebot
echo "Stopping and starting gamebot"
npm stop
npm start
npm run status

echo "Gamebot should now be running!"

ENDSSH
