#!/bin/bash
SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
DESTINATION="pi@$TARGET_IP"

cd $SCRIPT_DIR
cd ..

echo "[DtoS] Source directory contents:"
ls -la

echo "[DtoS] Zip the files:"
npm install
npm run create-build

echo "[DtoS] SCP the service file to the remote machine"
scp -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET "$SCRIPT_DIR/gamebot.service" "$DESTINATION:~/"

echo "[DtoS] SCP the files to the remote machine: [$TARGET_IP]"
scp -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET "$SCRIPT_DIR/../gamebot.zip" "$DESTINATION:~/"

echo "[DtoS] Logging into remote machine: [$TARGET_IP]"
ssh -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET $DESTINATION <<'ENDSSH'

echo "[DtoS Remote] Check files that exist on remote:"
ls -la

echo "[DtoS Remote] Check node and npm versions on remote:"
node -v
npm -v

echo "[DtoS Remote] Install service file to systemd:"
sudo rm /etc/systemd/system/gamebot.service
sudo mv ~/gamebot.service /etc/systemd/system/

echo "[DtoS Remote] Installing gamebot files to home directory:"
unzip -qo ~/gamebot.zip -d ~/gamebot

echo "[DtoS Remote] Restart gamebot service with new files"

sudo systemctl daemon-reload
sudo systemctl enable gamebot.service
sudo systemctl restart gamebot.service

echo "[DtoS Remote] Gamebot restarted; checking status"
sudo systemctl status gamebot.service

ENDSSH
