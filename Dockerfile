FROM ubuntu:14.04
MAINTAINER Kevin Smyth <kevin.m.smyth@gmail.com>

RUN printf 'deb http://ppa.launchpad.net/chris-lea/node.js/ubuntu trusty main\ndeb-src http://ppa.launchpad.net/chris-lea/node.js/ubuntu trusty main\n' > /etc/apt/sources.list.d/chris-lea-node_js-trusty.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys B9316A7BC7917B12 #44A334DA # 87374F5D

RUN apt-get -qq update && sudo apt-get install -y --no-install-recommends curl wget unzip build-essential git-core nodejs mongodb-server
RUN apt-get install -y --no-install-recommends python moreutils

RUN npm install -g npm@2.5.0

RUN npm install -g gulp

RUN echo smallfiles = true >> /etc/mongodb.conf

VOLUME ["/mms-webcyphy"]
WORKDIR /mms-webcyphy

RUN echo '#!/bin/bash -ex' >> /root/run.sh &&\
  echo '/etc/init.d/mongodb start' >> /root/run.sh &&\
  echo 'git show HEAD:src/app/mmsApp/config.client.default.json | sed s@http://localhost:3000@http://$COMPONENT_SERVER_PORT_3000_TCP_ADDR:$COMPONENT_SERVER_PORT_3000_TCP_PORT@ | sponge src/app/mmsApp/config.client.json' >> /root/run.sh &&\
  echo 'npm install && node node_modules/gulp/bin/gulp.js compile-all' >> /root/run.sh &&\
  echo 'node app.js > app1.log 2> app2.log' >> /root/run.sh


EXPOSE 8855

CMD ["bash", "-xe", "/root/run.sh"]

# docker build -t mms-webcyphy mms-webcyphy
# docker kill mms-webcyphy ; docker rm mms-webcyphy
# docker run --rm --name mms-webcyphy -v `pwd`/mms-webcyphy:/mms-webcyphy -p 8855:8855 --link component-server:component-server -t mms-webcyphy
# docker exec mms-webcyphy mongorestore


