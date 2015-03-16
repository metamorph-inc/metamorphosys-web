/*
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * Author: Zsolt Lattmann
 *
 * Configuration for server-side mocha tests.
 */

var PATH = require('path');

var CONFIG = require('./config.js');
exports.config = CONFIG;
CONFIG.mongo.uri = 'mongodb://127.0.0.1:27017/CyPhyFunctional';
CONFIG.mongo.options.server = CONFIG.mongo.options.server || {};
CONFIG.mongo.options.server.socketOptions = {connectTimeoutMS: 500};
CONFIG.log.level = 0;
var webgme = require('webgme');
var requirejs = webgme.requirejs;
webgme.addToRequireJsPaths(CONFIG);
var requirejsBase = webgme.requirejs.s.contexts._.config.baseUrl;
requirejs.define('gmeConfig', function () { return CONFIG; });

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
        paths[keys[i]] = PATH.relative(requirejsBase,PATH.resolve(testPaths[keys[i]]));
    }
    requirejs.config({
        paths:paths
    });
}
requirejs(['logManager'], function (LogManager) {
    LogManager.setLogLevel(0);
});

exports.requirejs = requirejs;

if (require.main === module) {

}
