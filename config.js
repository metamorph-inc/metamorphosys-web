/*jshint node: true*/

var path = require('path');
var config = require('webgme/config/config.default');
module.exports = config;

config.debug = true;

config.server.port = 8855;

config.mongo.uri = 'mongodb://127.0.0.1:27017/CyPhy';
config.storage.cache = 0;

//config.client.appDir =

config.executor.enable = true;
// config.executor.nonce = null;


config.plugin.allowServerExecution = true;
config.plugin.basePaths.push("./src/plugins/ADMEditor");
config.rest.components = mapPaths({
            "desert": "./src/rest/desert/Desert",
            "serverinfo": "./src/rest/serverInfo/ServerInfo",
            "copyproject": "./src/rest/copyproject/CopyProject"
        });
config.visualization.visualizerDescriptors.push("./Visualizers.json");
config.storage.keyType = 'rand160Bits'
config.requirejsPaths = {
        "ejs": "./node_modules/webgme/src/common/util/ejs",
        "xmljsonconverter": "./utils/xmljsonconverter",
        "sax": "./vendor/sax/sax",

        "panels/ProjectAnalyzer": "./src/panels/ProjectAnalyzer",
        "widgets/ProjectAnalyzer": "./src/widgets/ProjectAnalyzer",
        "executor": "./node_modules/webgme/src/middleware/executor",
        "desert": "./src/rest/desert",
        "serverinfo": "./src/rest/serverInfo",
        "CyPhyApp" : "./src/client",
        "CyPhyMETA" : "./meta",
        "cyphyDist": "./dist"
    };

require('webgme/config/validator')(config);

function mapPaths(paths) {
    var mapped = {};
    for (key in paths) {
        mapped[key] = path.relative('node_modules/webgme/src', paths[key]);
    }
    return mapped;
}