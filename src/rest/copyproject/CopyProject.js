/* global define,require,webGMEGlobal */
/*
config.json: "rextrast": { "copyproject": "./src/rest/copyproject/CopyProject", ...
http://localhost:8855/rest/external/copyproject
 */
define(['logManager',
    'core/coreforplugins',
    'storage/serveruserstorage',
    'coreclient/serialization',
], function (logManager, Core, Storage, Serialization) {
    "use strict";

    var BSON_FILE = 'dump\\CyPhy\\NkLabsPrototype.bson';

    var logger = logManager.create('REST-COPYPROJECT');
    var mongodb = require('mongodb');
    var BSONStream = require('bson-stream');
    var fs = require('fs');
    var child_process = require('child_process');
    var CONFIG = webGMEGlobal.getConfig();

    var use_exec = undefined;

    function Copy(req, res, callback) {
        var projectName = "Test_" + Math.floor(Math.random() * 100000);
        var fatal = function (err) {
            callback(err);
        };
        var options = {'host': CONFIG.mongoip, 'port': CONFIG.mongoport, 'database': CONFIG.mongodatabase};

        var copy = function () {
            if (use_exec) {
                var child = child_process.execFile('mongorestore', ['--host', options.host, '--port', options.port, '--db', options.database,
                        '--collection', projectName, BSON_FILE ], function (err, stdout, stderr) {
                    if (err) {
                        return fatal(err);
                    }
                    // return fatal(stdout + "\n\n" + stderr);
                    callback(null, projectName);
                });
            } else {
                mongodb.MongoClient.connect("mongodb://" + options.host + ":" + options.port + "/" + options.database, {
                    'w': 1,
                    'native-parser': true,
                    'auto_reconnect': true,
                    'poolSize': 20,
                    socketOptions: {keepAlive: 1}
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
        if (use_exec === undefined) {
            child_process.execFile('mongorestore', ['--help'], function (err, stdout, stderr) {
                if (err) {
                    use_exec = false;
                    logger.warning('mongorestore is unavailable (is it on the PATH?). Using slower node.js implementation');
                } else {
                    use_exec = true;
                }
                copy();
            });
        } else {
            copy();
        }
    }

    var CopyProject = function (req, res, next) {
        var url = req.url.split('/');

        if (req.url === '/') {
            Copy(req, res, function (err, projectName) {
                if (err) {
                    return res.status(500).send(err);
                }
                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                res.header("Pragma", "no-cache");
                res.redirect('/?project=' + projectName);
            });
        } else if (url.length === 2 && url[1] === 'noredirect') {
            Copy(req, res, function (err, projectName) {
                if (err) {
                    return res.status(500).send(err);
                }
                res.status(200).send(projectName);
            });
        } else {
            res.send(404);
        }
    };

    return CopyProject;
});
