#!/bin/bash
set -e
set -v

# Done in Dockerfile:
# npm install -g protractor
# webdriver-manager update --standalone

date
which firefox
dpkg -l firefox
which webdriver-manager
which node
which npm

node --version
npm --version
protractor --version

export DISPLAY=:99.0
Xvfb :99 -ac -screen 0 1280x1024x16 1>xvfb1.log 2>xvfb2.log &
sleep 5
nohup bash -c "webdriver-manager start 2>&1 &"
if [[ $1 == --vnc ]]; then
  shift
  x11vnc -many -nopw -bg -o x11vnc.log
fi
sleep 5
#npm run test_all
cat protractor_conf.js | sed s@http://localhost:8855@http://$MMS_WEBCYPHY_PORT_8855_TCP_ADDR:$MMS_WEBCYPHY_PORT_8855_TCP_PORT@ > protractor_conf_docker.js
set +e
protractor --browser firefox "$@" protractor_conf_docker.js
protractor_exit=$?
set -e
cat nohup.out
exit $protractor_exit
