#!/bin/bash

set -e

npm install -g bower@1.4.1
npm install -g gulp@3.9.0

# echo '{"componentServerUrl": "http://components.metamorphsoftware.com"}' > client_apps/componentBrowser/config.client.json

[ -d node_modules ] && rm -rf node_modules
npm install --production
npm shrinkwrap

npm install
bower --allow-root install
gulp compile-all

git add --all -f public dist
git add -f client_apps/componentBrowser/config.client.json
git add -f npm-shrinkwrap.json
git add -f client_apps/componentBrowser/appConfig.js

echo now git commit and git push
