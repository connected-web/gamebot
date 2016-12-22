ssh -i cloud.key ubuntu@10.10.39.34 <<'ENDSSH'

cd gamebot
ls
git pull &&
npm i &&
pm2 kill &&
pm2 start index.js --name "Gamebot" &&
pm2 start website.js --name "Gamebot Website"

ENDSSH
