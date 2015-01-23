/**
 * Created by Zsolt on 5/28/2014.
 *
 * Adds full directory with all subdirectories to the blob-local-storage
 *
 * node add_dir_to_blob.js samples\RollingWheel
 *
 */

if (process.argv.length < 3) {
    console.error('Usage: node add_dir_to_blob.js start_directory_path');
    console.error('       run this from the root directory, where blob-local-storage is located.');
    return;
}

var config = require('./config.json'),
    webgme = require('webgme'),
    fs = require('fs'),
    path = require('path');

var startDir = path.resolve(process.argv[2]);

config.paths.blob = './node_modules/webgme/src/middleware/blob'
// updating default configuration with ours
WebGMEGlobal.setConfig(config);

//var requirejs = WebGMEGlobal.requirejs;
//var BlobFSBackend = requirejs('blob/BlobFSBackend');
//var BlobRunPluginClient = requirejs('blob/BlobRunPluginClient');
//var blobClient = new BlobRunPluginClient(blobBackend);

var bc = WebGMEGlobal.requirejs('blob/BlobClient');
var host, port, httpsecure;
if (process.argv[3]) {
    var url = require('url').parse(process.argv[3]);
} else {
    host = 'localhost';
    port = config.port;
    httpsecure = false;
}
var blobClient = new bc({server: process.argv[3] || , serverPort: port, httpsecure: httpsecure });

var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};


if (fs.statSync(startDir).isDirectory()) {
    walk(startDir, AddFiles);
} else {
    var files = [startDir];
    startDir = path.resolve(startDir, '..');
    AddFiles(null, files);
}

function AddFiles(err, files, callback) {
    if (err) {
        console.error(err);
        return;
    }
    callback = callback || function() {};

    console.log('Directory ' + startDir + ' has ' + files.length + ' files.');

    var artifactName = path.basename(startDir);

    var resultArtifact = blobClient.createArtifact(artifactName);

    if (files.length === 0) {
        console.log('No files in directory.');
        return;
    }

    console.log('Adding files ...');

    var remaining = files.length;

    for (var i = 0; i < files.length; i += 1) {


        var filename = path.relative(startDir, files[i]).replace(/\\/g,'/');

        // TODO: stream the file
        resultArtifact.addFileAsSoftLink(filename, fs.readFileSync(files[i]), function (err, hash) {
            remaining -= 1;

            if (err) {
                console.error("Adding file failed: " + err);
                callback(err);
                return;
            }

            if (remaining === 0) {
                resultArtifact.save(function (err, artifactHash) {
                    if (err) {
                        console.error(err);
                        callback(err);
                        return;
                    }

                    console.log('All files were added successfully.');

                    var port = WebGMEGlobal.getConfig().port;

                    console.log(artifactName + ' - localhost:' + port);
                    console.log(' - metadata: localhost:' + port + blobClient.getMetadataURL(artifactHash));
                    console.log(' - download: localhost:' + port + blobClient.getDownloadURL(artifactHash));
                    callback(null, artifactHash);

                });
            }
        });
    }

}

module.exports.AddFiles = AddFiles;
