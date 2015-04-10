/*jshint node: true*/
/* global __dirname */

var path = require('path');
var config = require('webgme/config/config.default');
module.exports = config;

config.debug = true;

config.server.port = 8855;

config.mongo.uri = 'mongodb://127.0.0.1:27017/CyPhy';
config.storage.cache = 0;

config.client.appDir = path.join(__dirname, 'public/apps/mmsApp');

config.executor.enable = true;
// config.executor.nonce = null;

config.log = {
            level: 2, // 5 = ALL, 4 = DEBUG, 3 = INFO, 2 = WARNING, 1 = ERROR, 0 = OFF
            file: 'server.log'
        };


config.plugin.allowServerExecution = true;
config.plugin.basePaths.push('./src/plugins/ADMEditor');
config.plugin.basePaths.push('./src/plugins/META');
config.rest.components = mapPaths({
            'desert': './src/rest/desert/Desert',
            'serverinfo': './src/rest/serverInfo/ServerInfo',
            'copyproject': './src/rest/copyproject/CopyProject',
            'acminfo': './src/rest/acminfo/AcmInfo'
        });
config.visualization.visualizerDescriptors.push('./Visualizers.json');
config.storage.keyType = 'rand160Bits';
config.requirejsPaths = {
        'ejs': './node_modules/webgme/src/common/util/ejs',
        'xmljsonconverter': './utils/xmljsonconverter',
        'sax': './vendor/sax/sax',

        'panels/ProjectAnalyzer': './src/panels/ProjectAnalyzer',
        'widgets/ProjectAnalyzer': './src/widgets/ProjectAnalyzer',
        'executor': './node_modules/webgme/src/common/executor',
        'desert': './src/rest/desert',
        'acminfo': './src/rest/acminfo',
        //'serverinfo': './src/rest/serverInfo',
        'CyPhyApp': './src/client',
        'CyPhyMETA': './meta',
        'cyphyDist': './dist'
    };

require('webgme/config/validator')(config);

function mapPaths(paths) {

    'use strict';

    var mapped = {},
        key;

    for (key in paths) {
        mapped[key] = path.resolve(paths[key]);
    }
    return mapped;
}
