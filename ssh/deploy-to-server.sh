#!/bin/bash
SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
DESTINATION="pi@$TARGET_IP"

cd $SCRIPT_DIR
cd ..

echo "Source directory contents:"
ls -la

echo "Zip the files [TODO]"
sh ./scripts/build.sh

echo "SCP the service file to the remote machine"
scp -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET "$SCRIPT_DIR/gamebot.service" "$DESTINATION:~/"

echo "SCP the files to the remote machine: [$TARGET_IP]"
scp -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET "$SCRIPT_DIR/gamebot.zip" "$DESTINATION:~/"

echo "Logging into remote machine: [$TARGET_IP]"
ssh -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET $DESTINATION <<'ENDSSH'

ls -la
node -v
npm -v

echo "Install service file to systemd:"
sudo rm /etc/systemd/system/gamebot.service
sudo mv ~/gamebot.service /etc/systemd/system/

echo "Installing gamebot files to home directory:"
unzip -qo ~/gamebot.zip -d ~/gamebot

sudo systemctl daemon-reload 

sudo systemctl enable gamebot.service
sudo systemctl restart gamebot.service
sudo systemctl status gamebot.service

echo "Unzip files onto target machine: [TODO]"

echo "Restart gamebot service with new files: [TODO]"

ENDSSH

