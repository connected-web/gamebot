REMOTE="pi@192.168.0.12"

echo "Copying the backup to the home directory on the remote machine"
scp gamebot-backup.zip $REMOTE:~/

ssh $REMOTE <<'ENDSSH'

echo "Restoring gamebot backup to the app directory"
unzip -qo ~/gamebot-backup.zip -d ~/gamebot

echo "Removing the backup file from the machine"
rm -f ~/gamebot-backup.zip

ENDSSH
