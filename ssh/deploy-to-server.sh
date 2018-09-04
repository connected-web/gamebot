#!/bin/bash
SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd $SCRIPT_DIR
cd ..

echo "Source directory contents:"
ls -la

echo "Zip the files [TODO]"

echo "SCP the service file to the remote machine"
scp -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET "$SCRIPT_DIR/gamebot.service" "pi@$TARGET_IP:~/" 

echo "SCP the files to the remote machine: [$TARGET_IP]"

echo "Logging into remote machine: [$TARGET_IP]"
ssh -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET pi@$TARGET_IP <<'ENDSSH'

ls -la
node -v
npm -v

echo "Install service file to systemd:"
rm /etc/systemd/system/gamebot.service
mv ~/gamebot.service /etc/systemd/system/

sudo systemctl daemon-reload 

systemctl enable gamebot.service
systemctl restart gamebot.service
systemctl status gamebot.service

echo "Unzip files onto target machine: [TODO]"

echo "Restart gamebot service with new files: [TODO]"

ENDSSH

