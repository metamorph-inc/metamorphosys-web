/* globals module, require, requireJS, console */
/*
 GET http://localhost:8855/rest/external/testbenches/results/?testbench_id=:id
 PUT http://localhost:8855/rest/external/testbenches/result/
 POST http://localhost:8855/rest/external/testbenches/result/:resultId
 DELETE http://localhost:8855/rest/external/testbenches/result/:resultId
 */

'use strict';

var express = require('express'),
    router = express.Router(),
    ensureAuthenticated,
    gmeConfig, //global config is passed by server/standalone.js
    logger,
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


// see webgme/src/server/api/index.js
function getUserId(req) {
    return req.session.hasOwnProperty('udmId') ? req.session.udmId : null;
}


function initialize(middlewareOpts) {

    var ResultSchema = new Schema({
            id: ObjectId,
            userId: String,
            testBenchId: String,
            status: {type: String, match: /Running|Failed|Succeeded/, default: 'Running'},
            startTime: String, // or Date ???
            endTime: String, // or Date ???
            resultUrl: String,
            config: Object
        }),

    // FIXME: name this collection as you wish
        Result = mongoose.model('_test_bench_results', ResultSchema);

    // middlewareOpts contains gmeConfig, ensureAuthenticated function and logger, etc.

    // get configurations
    gmeConfig = middlewareOpts.gmeConfig;
    logger = middlewareOpts.logger.fork('gme:meta-morph:REST-TestBenches', true);
    ensureAuthenticated = middlewareOpts.ensureAuthenticated;

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
                return;
            }
            logger.info('Added dummy test bench result.');
        });
    }
    // dummy data ends here


    // handlers
    router.get('/results', function (req, res/*, next*/) {
        var userId = getUserId(req),
            testBenchId = req.query.testBenchId,
            query,
            responseData;

        // TODO: in the response we may not need to send these back ...
        responseData = {
            id: testBenchId,
            userId: userId,
            results: []
        };

        // read test bench results from mongo based on testBenchId
        // Note: testBenchId might be an empty string

        if (testBenchId) {
            query = {testBenchId: testBenchId};
        } else {
            query = {};
        }

        Result.find(query, function (err, docs) {
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
    });

    router.get('/result/:resultId', function (req, res/*, next*/) {
        var userId = getUserId(req);

        Result.findOne({_id: req.params.resultId}, function (err, doc) {
            if (err) {
                logger.error('error', err);
                res.send(500);
                return;
            }

            if (doc) {
                res.json(doc);
            } else {
                res.send(404);
            }
        });
    });


    router.put('/result', function (req, res/*, next*/) {
        var userId = getUserId(req),
            result = new Result(),
            receivedData = req.body;

        result.userId = userId;
        result.testBenchId = receivedData.testBenchId;
        result.config = receivedData.config;
        result.startTime = receivedData.startTime;
        result.endTime = receivedData.endTime;
        result.resultUrl = receivedData.resultUrl;
        result.status = receivedData.status;

        // TODO: should we check if the received data is valid?

        result.save(function (err) {
            if (err) {
                logger.error('error', err);
                res.send(500);
                return;
            }
            // created
            res.send(201);
        });
    });

    router.post('/result/:resultId', function (req, res/*, next*/) {
        var userId = getUserId(req),
            result = new Result(),
            receivedData = req.body;

        Result.findOne({_id: req.params.resultId}, function (err, doc) {
            if (err) {
                logger.error('error', err);
                res.send(500);
                return;
            }

            if (doc) {

                doc.userId = userId;
                doc.testBenchId = receivedData.testBenchId || doc.testBenchId;
                doc.config = receivedData.config || doc.config;
                doc.startTime = receivedData.startTime || doc.startTime;
                doc.endTime = receivedData.endTime || doc.endTime;
                doc.resultUrl = receivedData.resultUrl || doc.resultUrl;
                doc.status = receivedData.status || doc.status;

                doc.save(function (err) {
                    if (err) {
                        logger.error('error', err);
                        res.send(500);
                        return;
                    }
                    // updated
                    res.send(200);
                });
            } else {
                res.send(404);
            }
        });
    });


    router.delete('/result/:resultId', function (req, res/*, next*/) {
        var userId = getUserId(req);

        Result.find({_id: req.params.resultId}).remove(function (err) {
            if (err) {
                logger.error('error', err);
                res.send(500);
                return;
            }

            // deleted
            res.send(204);
        });
    });


    // TODO: add any special error handling here
    //router.use(function (err, req, res, next) {
    //
    //});

}

module.exports = {
    initialize: initialize,
    router: router
};
