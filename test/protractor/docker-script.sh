#!/bin/bash
set -e
set -v

# Done in Dockerfile:
# npm install -g protractor@1.6.1
# webdriver-manager update --standalone

which firefox
which webdriver-manager
which node
which npm

node --version
npm --version

export DISPLAY=:99.0
Xvfb :99 -ac -screen 0 1280x1024x16 1>xvfb1.log 2>xvfb2.log &
sleep 5
nohup bash -c "webdriver-manager start 2>&1 &"
sleep 5
#npm run test_all
git show HEAD:protractor_conf.js | sed s@http://localhost:8855@http://$MMS_WEBCYPHY_PORT_8855_TCP_ADDR:$MMS_WEBCYPHY_PORT_8855_TCP_PORT@ > protractor_conf.js
protractor --browser firefox protractor_conf.js

