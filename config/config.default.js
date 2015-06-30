/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

var config = require('webgme/config/config.default'),
    path = require('path');

config.server.port = 8855;
config.mongo.uri = 'mongodb://127.0.0.1:27017/CyPhy';

config.plugin.basePaths.push('./src/plugins/ADMEditor');
config.plugin.allowServerExecution = true;

config.executor.enable = true;

config.visualization.visualizerDescriptors.push('./Visualizers.json');

config.rest.components.desert = path.resolve('./src/rest/desert/Desert'); //This is not really maintained, use executor instead
config.rest.components.serverinfo = path.resolve('./src/rest/serverInfo/ServerInfo');

config.requirejsPaths.ejs = './node_modules/webgme/src/common/util/ejs';
config.requirejsPaths.xmljsonconverter = './utils/xmljsonconverter';
config.requirejsPaths.sax = './vendor/sax/sax';
config.requirejsPaths.executor = './node_modules/webgme/src/middleware/executor';
config.requirejsPaths.requirejs = './src/client';
config.requirejsPaths.CyPhyMETA = './meta';
config.requirejsPaths.cyphyDist = './dist';

config.requirejsPaths['panels/ProjectAnalyzer'] = './src/panels/ProjectAnalyzer';
config.requirejsPaths['widgets/ProjectAnalyzer'] = './src/widgets/ProjectAnalyzer';
//config.storage.loadBucketSize = 100;

module.exports = config;
