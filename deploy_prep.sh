#!/bin/bash -x

set -e

[ -e node_modules ] && which cmd >/dev/null 2>&1 && cmd '/c rd /s/q node_modules'
rm -rf node_modules
[ -f npm-shrinkwrap.json ] && rm npm-shrinkwrap.json
<src/app/mmsApp/config.client.default.json sed s@http://localhost:3000@${CONTENT_SERVER:-http://components.metamorphsoftware.com}@ > src/app/mmsApp/config.client.json

npm install --production
npm shrinkwrap
# node munge_shrinkwrap.js || exit /b !ERRORLEVEL!
# cat npm-shrinkwrap_munge.json > npm-shrinkwrap.json
npm install
gulp compile-all
git add --all -f public src/app/mmsApp/config.client.json
echo git commit and push
