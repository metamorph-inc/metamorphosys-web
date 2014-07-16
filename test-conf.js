/*
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * Author: Zsolt Lattmann
 *
 * Server side configuration file for all tests.
 */

var PATH = require('path');

var CONFIG = require('./config.json');
var webgme = require('webgme');
var requirejs = require('requirejs');
webGMEGlobal.setConfig(CONFIG);
var requirejsBase = webGMEGlobal.baseDir;

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

if (require.main === module) {

}