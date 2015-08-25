/*jshint node:true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

var config = require('./' + (process.argv[2] || 'config')),
    webgme = require('webgme');

webgme.addToRequireJsPaths(config);

var myServer = new webgme.standaloneServer(config);
myServer.start(function (err) {
    if (err) {
        process.exit(1);
    }
});
