/* global define,require,console */
/*
 config.json: "rextrast": { "copyproject": "./src/rest/copyproject/CopyProject", ...
 http://localhost:8855/rest/external/copyproject
 */
define(['logManager'
], function (logManager) {
    'use strict';

    var path = require('path'),
        BSON_FILE = path.join('dump', 'CyPhy', 'Template_Module_1x2.bson'),
        logger = logManager.create('REST-COPYPROJECT'),
        mongodb = require('mongodb'),
        BSONStream = require('bson-stream'),
        fs = require('fs'),
        childProcess = require('child_process'),
        CONFIG,
        useMongoRestore;

    function copy(req, res, callback) {
        var projectName = 'Test_' + Math.floor(Math.random() * 100000);
        var fatal = function (err) {
            console.log(err);
            callback(err);
        };
        var copyDb = function () {
            if (useMongoRestore) {
                var url = require('url').parse(CONFIG.mongo.uri);
                childProcess.execFile('mongorestore', ['--host', url.hostname, '--port', url.port,
                    '--db', url.path.substr(1),
                    '--collection', projectName, BSON_FILE
                ], function (err/*, stdout, stderr*/) {
                    if (err) {
                        return fatal(err);
                    }
                    // return fatal(stdout + '\n\n' + stderr);
                    callback(null, projectName);
                });
            } else {
                mongodb.MongoClient.connect(CONFIG.mongo.uri, {
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
                    db.createCollection(projectName, {}, function (err, collection) {
                        if (err) {
                            return fatal(err);
                        }
                        var bsons = rs.pipe(new BSONStream());
                        var pending = 1;
                        var done = function (err) {
                            if (err) {
                                done = function () {
                                };
                                return fatal(err);
                            }
                            pending--;
                            if (pending === 0) {
                                callback(null, projectName);
                                db.close();
                            }
                        };
                        bsons.on('data', function (obj) {
                            pending++;
                            collection.insert(obj, function (err) {
                                done(err);
                            });
                        });
                        bsons.on('end', function (err) {
                            done(err);
                        });
                    });
                });
            }
        };
        if (useMongoRestore === undefined) {
            childProcess.execFile('mongorestore', ['--help'], function (err/*, stdout, stderr*/) {
                if (err) {
                    useMongoRestore = false;
                    logger.warning(
                        'mongorestore is unavailable (is it on the PATH?). Using slower node.js implementation'
                    );
                } else {
                    useMongoRestore = true;
                }
                copyDb();
            });
        } else {
            copyDb();
        }
    }

    var CopyProject = function (req, res/*, next*/) {
        var url = req.url.split('/');

        if (req.url === '/') {
            copy(req, res, function (err, projectName) {
                if (err) {
                    return res.status(500)
                        .send(err);
                }
                res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.header('Pragma', 'no-cache');
                res.redirect('/#/editor/' + projectName);
            });
        } else if (url.length === 2 && url[1] === 'noredirect') {
            copy(req, res, function (err, projectName) {
                if (err) {
                    return res.status(500)
                        .send(err);
                }
                res.status(200)
                    .send(projectName);
            });
        } else {
            res.sendStatus(404);
        }
    };

    return function (gmeConfig) {
        CONFIG = gmeConfig;
        return CopyProject;
    };
});
