/* globals module, require, requireJS, console */
/*
 http://localhost:8855/rest/external/testbenches/testbench_id
 */

'use strict';

var ensureAuthenticated,
    gmeConfig, //global config is passed by server/standalone.js
    logger;


// see webgme/src/server/api/index.js
function getUserId(req) {
    return req.session.hasOwnProperty('udmId') ? req.session.udmId : null;
}

//var TestBenchesRestComponent = function (req, res/*, next*/) {
//
//
//    // the request can be handled with ensureAuthenticated
//    ensureAuthenticated(req, res, handleRequest);
//};


var TestBenchesRestComponent = function (req, res, next) {
    var userId = getUserId(req),

        // call next if request is not handled here.
        url = req.url.split('/'),
        testBenchId,
        responseData,
        i;

    if (url.length === 2) {
        testBenchId = url[1];

        responseData = {
            id: testBenchId,
            userId: userId,
            results: []
        };

        // TODO: read results from mongo
        var status = ['Running', 'Failed', 'Succeeded'];

        for (i = 0; i < 100; i += 1) {
            responseData.results.push({
                id: i,
                testBenchId: testBenchId,
                config: [
                    {
                        id: 1,
                        name: 'quantity',
                        value: 600
                    }
                ],
                startTime: new Date((new Date()).getTime() - 20000 - Math.floor(Math.random() * 20000)).toISOString(),
                endTime: new Date((new Date()).getTime() - Math.floor(Math.random() * 15000)).toISOString(),
                status: status[Math.floor(Math.random() * status.length)],
                resultUrl: 'something_' + i + '.zip'
            });

            if (responseData.results[i].status === 'Running') {
                responseData.results[i].endTime = null;
            }
        }


        // send results for test bench
        res.json(responseData);

    } else {
        res.sendStatus(404);
    }
};

var setup = function (_gmeConfig, _ensureAuthenticated, _logger) {
    gmeConfig = _gmeConfig;
    logger = _logger.fork('gme:meta-morph:REST-TestBenches', true);
    logger.info('got initialized');
    ensureAuthenticated = _ensureAuthenticated;
    return TestBenchesRestComponent;
};

module.exports = setup;
