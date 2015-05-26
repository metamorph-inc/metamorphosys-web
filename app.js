/**
 * Created by Zsolt on 4/4/2014.
 */

var config = require('./' + (process.argv[2] || 'config')),
    webgme = require('webgme');

webgme.addToRequireJsPaths(config);

var myServer = new webgme.standaloneServer(config);
myServer.start();
