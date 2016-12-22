ssh -i cloud.key ubuntu@10.10.39.34 <<'ENDSSH'

cd gamebot
ls
git pull &&
npm i &&
pm2 restart all

ENDSSH
