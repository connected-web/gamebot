ssh -i cloud.key ubuntu@10.10.39.34 <<'ENDSSH'

cd gamebot 
ls
git pull &&
pm2 restart 0

ENDSSH
