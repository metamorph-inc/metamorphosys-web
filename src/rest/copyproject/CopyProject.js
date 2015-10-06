/* global define,require,console */
/*
 config.json: "rextrast": { "copyproject": "./src/rest/copyproject/CopyProject", ...
 http://localhost:8855/rest/external/copyproject
 */

'use strict';

var path = require('path'),
    fs = require('fs'),
    ensureAuthenticated,
    gmeConfig,
    workerManager,
    logger,
    express = require('express'),
    router = express.Router(),
    BSON_FILE = path.join('dump', 'CyPhy', 'Template_Module_1x2.bson'),
    mongodb = require('mongodb'),
    BSONStream = require('bson-stream');

module.exports = {
    initialize: initialize,
    router: router
};

function getUserId(req) {
    return req.session.udmId;
}

function copy(req, res, callback) {
    var projectName = 'Test_' + Math.floor(Math.random() * 100000);
    var fatal = function (err) {
        console.log(err);
        callback(err);
    };
    mongodb.MongoClient.connect(gmeConfig.mongo.uri, {
        db: {
            'w': 1,
            'native_parser': true
        },
        server: {
            'auto_reconnect': true,
            'poolSize': 20,
            socketOptions: {
                keepAlive: 1
            }
        }
    }, function (err, db) {
        if (err) {
            return fatal(err);
        }
        fatal = function (err) {
            db.close();
            if (err) {
                callback(err);
            }
        };
        var rs = fs.createReadStream(BSON_FILE);
        var bsons = rs.pipe(new BSONStream());
        var master;
        bsons.on('data', function (obj) {
            if (obj._id === '*master') {
                master = obj.hash;
            }
        });
        bsons.on('end', function (err) {
            if (!master) {
                err = 'Couldnt find *master in bson';
            }
            if (err) {
                callback(err);
            }
            var parameters = {
                userId: 'guest',
                webGMESessionId: req.session.id,
                type: 'db',
                projectName: projectName,
                seedName: 'Template_Module_1x2',
                seedBranch: 'master',
                seedCommit: master, // "#a79d96bbae12d1e44809f396dd38cd6bea6be272",
                command: 'seedProject'
            };
            workerManager.request(parameters, function (err, result) {
                if (err) {
                    return callback(err);
                }
                callback(err, parameters.userId + '+' + projectName);
            });
        });
    });
}

function initialize(middlewareOpts) {
    gmeConfig = middlewareOpts.gmeConfig;
    logger = middlewareOpts.logger.fork('gme:meta-morph:REST-CopyProject', true);
    ensureAuthenticated = middlewareOpts.ensureAuthenticated;
    workerManager = middlewareOpts.workerManager;

    router.use(function (req, res, next) {
        req.session.udmId = req.session.udmId || 'guest'; // HACK
        req.session.save(next);
    });
    router.get('/', function (req, res/*, next*/) {
        copy(req, res, function (err, projectName) {
            if (err) {
                logger.warn(err);
                return res.status(500).send(err);
            }
            res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.header('Pragma', 'no-cache');
            res.redirect('/#/editor/' + projectName);
        });
    });
    router.get('/noredirect', function (req, res) {
        copy(req, res, function (err, projectName) {
            if (err) {
                logger.warn(err);
                return res.status(500).send(err);
            }
            res.status(200).send(projectName);
        });
    });

}
