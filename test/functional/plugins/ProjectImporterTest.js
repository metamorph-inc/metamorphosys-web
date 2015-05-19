/*globals window, require, describe, it,before, after */


if (typeof window === 'undefined') {

    // server-side setup
    var requirejs = require('../../../test-conf.js').requirejs;
    var webgme = require('webgme');
    var CONFIG = require('../../../test-conf.js').config;
    var testConf = require('../../../test-conf.js');

    var chai = require('chai');
}

describe('ProjectImporter', function () {
    'use strict';

    var path = require('path');
    var fs = require('fs');
    var BlobClient;
    var Artifact;
    var acmTemplates;
    var admTemplates;
    var jszip;

    testConf.useServer(before, after);

    before(function (done) {
        requirejs(['blob/BlobClient', 'blob/Artifact', 'test/models/acm/unit/Templates', 'test/models/adm/unit/Templates', 'jszip'], function (BlobClient_, Artifact_, acmTemplates_, admTemplates_, jszip_) {
            BlobClient = BlobClient_;
            Artifact = Artifact_;
            acmTemplates = acmTemplates_;
            admTemplates = admTemplates_;
            jszip = jszip_;
            done();
        }, done);
    });

    var projectName = 'ProjectImporterTest';
    var updateMeta;
    before(function (done) {
        requirejs(['utils/update_meta.js'],
            function (updateMeta_) {
                updateMeta = updateMeta_;

                updateMeta.withProject(CONFIG, projectName, function (err, project) {
                    if (err) {
                        return done(err);
                    }
                    return updateMeta.importLibrary(CONFIG, projectName, 'master', 'meta/ADMEditor_metaOnly.json', project)
                        .then(function (/*commitHash*/) {
                            done();
                        });
                });
            }, done);
    });

    it('should run on small_export', function (done) {
        var bc = newBlobClient(),
            artifact = new Artifact('exported_files', bc),
            files = {};
        fs.readdirSync('test/models/small_export').forEach(function (filename) {
            files[filename] = fs.readFileSync(path.join('test/models/small_export', filename));
        });
        artifact.addFilesAsSoftLinks(files, function (err/*, hashes*/) {
            if (err) {
                return done(err);
            }
            artifact.save(function (err, hash) {
                if (err) {
                    return done(err);
                }
                var storage = undefined;
                webgme.runPlugin.main(
                    storage,
                    CONFIG, {
                        projectName: projectName,
                        pluginName: 'ProjectImporter',
                        activeNode: '/',
                        pluginConfig: {
                            UploadedFile: hash
                        }
                    }, {UploadedFile: hash}, function (err, result) {
                        chai.expect(err).to.equal(null);
                        chai.expect(result.getSuccess()).to.equal(true);
                        // TODO: look at model
                        done();
                    });
            });
        });
    });

    function newBlobClient() {
        return new BlobClient({
            server: 'localhost',
            serverPort: CONFIG.server.port,
            httpsecure: false
        });
    }
});
