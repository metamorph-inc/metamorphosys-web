/* globals module, require, requireJS, console */
/*
 GET http://localhost:8855/rest/external/testbenches/results/?testbench_id=:id
 GET http://localhost:8855/rest/external/testbenches/result/:resultId
 curl -H "Content-Type: application/json" -XPUT -d {\"id\":\"asdf\"} http://localhost:8855/rest/external/testbenches/result/
 curl -H "Content-Type: application/json" -XPOST -d {\"status\":\"Succeeded\"} http://localhost:8855/rest/external/testbenches/result/03580d6ab3
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
            _id: {type: String, index: true},
            userId: String,
            projectId: String,
            branchId: String,
            commitHash: String,
            executionJobHash: String,
            testBenchId: String,
            status: {type: String, match: /Running|Failed|Succeeded/, default: 'Running'},
            startTime: String, // or Date ???
            endTime: String, // or Date ???
            resultHash: String,
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

    // handlers
    router.get('/results', function (req, res/*, next*/) {
        var userId = getUserId(req),
            testBenchId = req.query.testBenchId,
            query = {},
            responseData;

        // TODO: in the response we may not need to send these back ...
        responseData = {
            id: testBenchId,
            userId: userId,
            results: []
        };

        // read test bench results from mongo based on testBenchId
        // Note: testBenchId might be an empty string

        ['projectId', 'branchId', 'testBenchId', 'hash'].forEach(function (field) {
            if (req.query[field]) {
                query[field] = req.query[field];
            }
        });

        Result.find(query, function (err, docs) {
            if (err) {
                logger.error('error', err);
                res.sendStatus(500);
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
                res.sendStatus(500);
                return;
            }

            if (doc) {
                res.json(doc);
            } else {
                res.sendStatus(404);
            }
        });
    });


    router.put('/result', function (req, res/*, next*/) {
        var userId = getUserId(req),
            result = new Result(),
            receivedData = req.body;

        for (var key in ResultSchema.paths) {
            result[key] = receivedData[key];
        }
        result.userId = userId;
        result._id = receivedData.id;

        result.save(function (err) {
            if (err) {
                if (err.code === 11000) {
                    res.status(409).send('Conflict: already exists').end();
                    return;
                }
                logger.error('error', err);
                res.sendStatus(500);
                return;
            }
            // created
            res.sendStatus(201);
        });
    });

    router.post('/result/:resultId', function (req, res/*, next*/) {
        var userId = getUserId(req),
            result = new Result(),
            receivedData = req.body;

        Result.findOne({_id: req.params.resultId}, function (err, doc) {
            if (err) {
                logger.error('error', err);
                res.sendStatus(500);
                return;
            }

            if (doc) {

                for (var key in ResultSchema.paths) {
                    doc[key] = receivedData[key] || doc[key];
                    result[key] = receivedData[key];
                }
                doc.userId = userId;

                doc.save(function (err) {
                    if (err) {
                        logger.error('error', err);
                        res.sendStatus(500);
                        return;
                    }
                    // updated
                    res.sendStatus(200);
                });
            } else {
                res.sendStatus(404);
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
