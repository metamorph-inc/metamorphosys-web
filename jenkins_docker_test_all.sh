#!/bin/bash -x

set -e

function cleanup {
name=mms-webcyphy
docker logs $name || true
docker kill $name || true
docker rm $name || true
}
trap cleanup EXIT

cleanup

docker build $DOCKER_BUILD_ARGS -t mms-webcyphy mms-webcyphy
docker run -d --name mms-webcyphy -t mms-webcyphy
#docker exec mms-webcyphy mongorestore

export i=0
while (($i < 30)); do
 if docker exec mms-webcyphy nc -v -w 1 localhost 27017 </dev/null; then break ; fi
  export i=$[$i + 1]
  sleep 1
done

# docker exec mms-webcyphy npm run test_all
docker exec mms-webcyphy npm install xunit-file@0.0.6
docker exec mms-webcyphy node node_modules/istanbul/lib/cli.js --hook-run-in-context test node_modules/mocha/bin/_mocha -- -R xunit-file --recursive test/unit test/functional || true
# use tar to preserve timestamp
docker exec mms-webcyphy tar c xunit.xml | tar x xunit.xml
