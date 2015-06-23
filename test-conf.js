/* global require,module,exports,console*/
/*
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * Author: Zsolt Lattmann
 *
 * Configuration for server-side mocha tests.
 */
'use strict';

var PATH = require('path');

var CONFIG = JSON.parse(JSON.stringify(require('./config.js')));
CONFIG.server.log.transports.forEach(function (transport) {
    transport.options.handleExceptions = false;
    if (transport.transportType === 'Console') {
        transport.options.level = 'error';
    }
});

exports.config = CONFIG;
CONFIG.blob.fsDir = './blob-local-storage';
CONFIG.server.port = 49049;
CONFIG.mongo.uri = 'mongodb://127.0.0.1:27017/CyPhyFunctional';
CONFIG.mongo.options.server = CONFIG.mongo.options.server || {};
CONFIG.mongo.options.server.socketOptions = {connectTimeoutMS: 500};
CONFIG.executor.enable = false; // fails until https://github.com/webgme/webgme/issues/323 is fixed
var webgme = require('webgme');
var requirejs = webgme.requirejs;
webgme.addToRequireJsPaths(CONFIG);
var requirejsBase = webgme.requirejs.s.contexts._.config.baseUrl;
requirejs.define('gmeConfig', function () {
    return JSON.parse(JSON.stringify(CONFIG));
});
requirejs.define('test-conf', function () {
    return exports;
});


// specifies all test specific requirejs paths for server side tests
// read it from the config file
var testPaths = {
    "mocks": "./test/mocks",
    "test/models": "./test/models",
    "test/lib": "./test/lib"
};
if (testPaths) {
    var paths = {};
    var keys = Object.keys(testPaths);
    for (var i = 0; i < keys.length; i += 1) {
        paths[keys[i]] = PATH.relative(requirejsBase, PATH.resolve(testPaths[keys[i]]));
    }
    requirejs.config({
        paths: paths
    });
}

exports.requirejs = requirejs;

exports.useServer = function useServer(before, after) {
    var server = webgme.standaloneServer(CONFIG);
    after(function stopServer(done) {
        server.stop(done);
    });
    before(function startServer(done) {
        server.start(done);
    });
};

exports.useStorage = function useStorage(projectName, before, after) {
    var testFixture = require('./node_modules/webgme/test/_globals');
    var Q = testFixture.Q;
    var deferred = Q.defer();
    var logger = testFixture.logger.fork('ProjectImporterTest');

    var gmeAuth, storage;
    before(function (done) {
        testFixture.clearDBAndGetGMEAuth(CONFIG, projectName)
            .then(function (gmeAuth_) {
                gmeAuth = gmeAuth_;
                storage = testFixture.getMemoryStorage(logger, CONFIG, gmeAuth);
                return storage.openDatabase();
            }).then(function () {
                exports.gmeAuth = gmeAuth;
                exports.storage = storage;
                deferred.resolve([gmeAuth, storage]);
            }).nodeify(done);
    });

    after(function (done) {
        exports.gmeAuth = null;
        exports.storage = null;
        Q.all([
            storage.closeDatabase(),
            gmeAuth.unload()
        ])
        .nodeify(done);
    });

    return deferred.promise;
};

exports.callbackImmediate = function (callback) {
    // 'expect' throws exceptions that must not be caught by q
    var self = this;
    return function () {
        var args = arguments;
        setImmediate(function () {
            callback.apply(self, args);
        });
    };
};


if (require.main === module) {
    console.log(JSON.stringify(CONFIG, null, 4));
}
