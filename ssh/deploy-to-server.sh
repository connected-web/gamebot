SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd $SCRIPT_DIR
cd ..

ls -la

ssh -o "StrictHostKeyChecking no" -i $SSH_KEY_FOR_TARGET pi@$TARGET_IP <<'ENDSSH'

ls -la
node -v
npm -v
sudo systemctl daemon-reload 

ENDSSH

