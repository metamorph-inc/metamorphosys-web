# HOWTO run webgme-cyphy in Docker
# 0. On Windows or OSX, install boot2docker and configure it
#    bash "c:\Program Files\Boot2Docker for Windows\start.sh"
#    "c:\Program Files\Oracle\VirtualBox\VBoxManage" modifyvm "boot2docker-vm" --natpf1 "containerssh,tcp,,80,,80"
#    bash "c:\Program Files\Boot2Docker for Windows\start.sh"
#    "c:\Program Files\Boot2Docker for Windows\boot2docker.exe" ssh
# 1. Run a mongodb container
#    docker run --name webgme_mongo -d dockerfile/mongodb
# 2. Run a webgme-cyphy container
#    docker build -t webgme-cyphy .
#    docker run -p 80:80 --name webgme-cyphy --link webgme_mongo:webgme_mongo -d webgme-cyphy
# 3. Inspect/stop/kill/rm/cleanup
#    docker logs webgme-cyphy
#    docker kill webgme-cyphy
#    docker rm webgme-cyphy
#    docker rmi webgme-cyphy

FROM dockerfile/nodejs
MAINTAINER Kevin Smyth <kevin.m.smyth@gmail.com>

# create webgme user
RUN adduser --disabled-password --home=/webgme --gecos "" webgme
RUN echo "webgme ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
WORKDIR /webgme
USER webgme

RUN git init \
 && git remote add origin https://github.com/webgme/webgme-cyphy.git \
 && git fetch \
 && git branch master origin/master \
 && git checkout master

RUN sudo npm install
RUN sed -i "s|.*mongoip.*|\"mongoip\": \"webgme_mongo\",|g" config.json

EXPOSE 8855
CMD ["sudo", "node", "app.js"]
