/* globals module, require, requireJS, console */
/*
 http://localhost:8855/rest/external/testbenches/testbench_id
 */

'use strict';

var ensureAuthenticated,
    gmeConfig, //global config is passed by server/standalone.js
    logger,
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


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

var ResultSchema = new Schema({
    id: ObjectId,
    userId: String,
    testBenchId: String,
    status: {type: String, match: /Running|Failed|Succeeded/, default: 'Running'},
    startTime: String, // or Date ???
    endTime: String, // or Date ???
    resultUrl: String,
    config: Object
});

// FIXME: name this collection as you wish
var Result = mongoose.model('_test_bench_results', ResultSchema);

var TestBenchesRestComponent = function (req, res/*, next*/) {
    var userId = getUserId(req),

    // call next if request is not handled here.
        url = req.url.split('/'),
        testBenchId,
        responseData;

    if (url.length === 2) {
        testBenchId = url[1];

        responseData = {
            id: testBenchId,
            userId: userId,
            results: []
        };

        // read test bench results from mongo based on testBenchId
        // Note: testBenchId might be an empty string

        Result.find({testBenchId: testBenchId}, function (err, docs) {
            if (err) {
                logger.error('error', err);
                res.send(500);
                return;
            }

            docs.forEach(function (doc) {
                responseData.results.push(doc);
            });

            // send results for test bench
            res.json(responseData);
        });

    } else {
        res.sendStatus(404);
    }
};

var setup = function (_gmeConfig, _ensureAuthenticated, _logger) {
    gmeConfig = _gmeConfig;
    logger = _logger.fork('gme:meta-morph:REST-TestBenches', true);

    // https://www.npmjs.com/package/mongoose#connecting-to-mongodb
    // Important! Mongoose buffers all the commands until it's connected to the database.
    // This means that you don't have to wait until it connects to MongoDB in order to define models, run queries, etc.
    mongoose.connect(gmeConfig.mongo.uri);


    // populate database with dummy data
    var status = ['Running', 'Failed', 'Succeeded'],
        i;

    for (i = 0; i < 100; i += 1) {
        var result = new Result();
        result.testBenchId = i % 10;
        result.config = [
            {
                id: 1,
                name: 'quantity',
                value: 600
            }
        ];
        result.startTime = new Date((new Date()).getTime() - 20000 - Math.floor(Math.random() * 20000)).toISOString();
        result.endTime = new Date((new Date()).getTime() - Math.floor(Math.random() * 15000)).toISOString();
        result.resultUrl = 'something_' + i + '.zip';
        result.status = status[Math.floor(Math.random() * status.length)];

        if (result.status === 'Running') {
            // clear end time if it is still running
            result.endTime = null;
        }

        result.save(function (err) {
            if (err) {
                logger.error('Failed to save dummy test bench result: ', err);
            }
            logger.info('Added dummy test bench result.');
        });
    }


    ensureAuthenticated = _ensureAuthenticated;
    return TestBenchesRestComponent;
};

module.exports = setup;
