ssh -i cloud.key ubuntu@10.10.39.34 <<'ENDSSH'

cd gamebot
ls
pm2 status

ENDSSH
