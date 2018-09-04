#!/bin/bash
SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd $SCRIPT_DIR
cd ..

echo "Source directory contents:"
ls -la

echo "Zip the files [TODO]"

echo "SCP the files to the remote machine: [$TARGET_IP]"

echo "Logging into remote machine: [$TARGET_IP]"
ssh -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET pi@$TARGET_IP <<'ENDSSH'

ls -la
node -v
npm -v
sudo systemctl daemon-reload 

echo "Unzip files onto target machine: [TODO]"

echo "Restart gamebot service with new files: [TODO]"

ENDSSH

