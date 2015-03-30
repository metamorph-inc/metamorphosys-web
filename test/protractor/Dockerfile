FROM ubuntu:14.04
MAINTAINER Kevin Smyth <kevin.m.smyth@gmail.com>

RUN printf 'deb http://ppa.launchpad.net/chris-lea/node.js/ubuntu trusty main\ndeb-src http://ppa.launchpad.net/chris-lea/node.js/ubuntu trusty main\n' > /etc/apt/sources.list.d/chris-lea-node_js-trusty.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys B9316A7BC7917B12 #44A334DA # 87374F5D

RUN apt-get -qq update && sudo apt-get install -y --no-install-recommends curl wget unzip build-essential openjdk-6-jdk git-core nodejs xvfb firefox python moreutils

ENV JAVA_HOME /usr/lib/jvm/java-6-openjdk-amd64/

RUN npm install -g protractor@1.6.1
RUN webdriver-manager update --standalone

RUN echo Xvfb :99 -ac -screen 0 1024x768x24 \& > /etc/init.d/xvfb

ENV DISPLAY=":99.0"

# 2/5/2015 firefox-35 + protractor is broken! use firefox-34
RUN curl -f -s -S http://ftp.mozilla.org/pub/mozilla.org/firefox/releases/34.0/linux-x86_64/en-US/firefox-34.0.tar.bz2 | tar xj --directory / && dpkg --remove firefox
ENV PATH="/firefox:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

#VOLUME ["/mms-webcyphy"]
WORKDIR /mms-webcyphy

# docker build -t mms-webcyphy-protractor protractor
# docker kill mms-webcyphy-protractor ; docker rm mms-webcyphy-protractor
# docker run --rm --name mms-webcyphy-protractor --volumes-from mms-webcyphy --link mms-webcyphy:mms-webcyphy --link component-server:component-server -t mms-webcyphy-protractor bash test/protractor/docker-script.sh

