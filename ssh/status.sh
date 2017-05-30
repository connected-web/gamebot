ssh -i cloud.key ubuntu@10.10.39.12 <<'ENDSSH'

cd gamebot
ls
pm2 status

ENDSSH
