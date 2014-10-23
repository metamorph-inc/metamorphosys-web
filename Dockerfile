# HOWTO run webgme-cyphy in Docker
# 0. On Windows or OSX, install boot2docker and configure it
#    bash "c:\Program Files\Boot2Docker for Windows\start.sh"
#    "c:\Program Files\Oracle\VirtualBox\VBoxManage" modifyvm "boot2docker-vm" --natpf1 "containerssh,tcp,,80,,80"
#    bash "c:\Program Files\Boot2Docker for Windows\start.sh"
#    ssh-agent
#    "c:\Program Files\Boot2Docker for Windows\boot2docker.exe" ssh -A
# 1. Run a mongodb container
#    docker run --name webgme_mongo -d dockerfile/mongodb
# 2. Run a webgme-cyphy container
#    git clone git@bitbucket.org:metamorphsoftwareinc/mms-webcyphy.git
#    docker build -t mms-webcyphy ./mms-webcyphy
#    docker run -p 80:8855 --name mms-webcyphy --link webgme_mongo:webgme_mongo -d mms-webcyphy
# 3. Inspect/stop/kill/rm/cleanup
#    docker logs mms-webcyphy
#    docker kill mms-webcyphy
#    docker rm mms-webcyphy
#    docker rmi mms-webcyphy

FROM dockerfile/nodejs
MAINTAINER Kevin Smyth <kevin.m.smyth@gmail.com>

# create webgme user
RUN adduser --disabled-password --home=/webgme --gecos "" webgme
RUN echo "webgme ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

RUN mkdir -p /tmp
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /webgme && cp -a /tmp/node_modules /webgme

WORKDIR /webgme
USER webgme

ADD . /webgme
RUN sed -i "s|.*mongoip.*|\"mongoip\": \"webgme_mongo\",|g" config.json

EXPOSE 8855
CMD ["sudo", "node", "app.js"]
