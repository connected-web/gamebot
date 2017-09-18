REMOTE="ubuntu@10.10.39.12"

ssh -i cloud.key $REMOTE <<'ENDSSH'

cd gamebot
zip -r9 ~/gamebot-backup.zip state records tokens.json

ENDSSH

scp -i cloud.key ubuntu@10.10.39.12:~/gamebot-backup.zip .
