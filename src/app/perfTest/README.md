This app simulates what a user might do, so that we can run many copies of this app and load test the server.

Setup:
npm install phantomjs

Run:
launch_database.cmd
node app.js
bash:
 echo {1..50} |  tr ' ' '\n' | xargs -P 10 -n 1 node_modules/phantomjs/lib/phantom/phantomjs.exe src/app/perfTest/phantomRunner.js
