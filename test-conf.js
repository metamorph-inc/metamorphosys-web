/*
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * Author: Zsolt Lattmann
 *
 * Configuration for server-side mocha tests.
 */

var PATH = require('path');

var CONFIG = require('./config.json');
CONFIG.mongodatabase = 'CyPhyFunctional';
var webgme = require('webgme');
var requirejs = global.WebGMEGlobal.requirejs;
CONFIG.loglevel = 0;
WebGMEGlobal.setConfig(CONFIG);
var requirejsBase = WebGMEGlobal.baseDir;

// specifies all test specific requirejs paths for server side tests
// read it from the config file
if (CONFIG.test_paths) {
    var paths = {};
    var keys = Object.keys(CONFIG.test_paths);
    for (var i = 0; i < keys.length; i += 1) {
        paths[keys[i]] = PATH.relative(requirejsBase,PATH.resolve(CONFIG.test_paths[keys[i]]));
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
