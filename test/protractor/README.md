HOWTO run in Docker
-------------------

Cleanup:

    docker kill mms-webcyphy-protractor ; docker rm -v mms-webcyphy-protractor
    docker kill mms-webcyphy ; docker rm -v mms-webcyphy
    docker kill component-server ; docker rm -v component-server

Option 1: real content server:

    docker build -t component-server content-server
    docker run --name component-server -t component-server

Option 2: proxy to content server:

    docker build -t cs-proxy cs-proxy
    docker run -d --name component-server -t component-server

    docker build -t mms-webcyphy mms-webcyphy
    docker run -d --name mms-webcyphy -p 8855:8855 --link component-server:component-server -t mms-webcyphy
    sleep 5
    docker exec mms-webcyphy mongorestore

    (cd mms-webcyphy/test && docker build -t mms-webcyphy-protractor protractor)
    docker run --rm --name mms-webcyphy-protractor --volumes-from mms-webcyphy --link mms-webcyphy:mms-webcyphy --link component-server:component-server -t mms-webcyphy-protractor bash test/protractor/docker-script.sh | tee protractor_log
