/*globals window, require, describe, it,before, after, beforeEach */


if (typeof window === 'undefined') {

    // server-side setup
    var requirejs = require('../../../test-conf.js').requirejs;
    var webgme = require('webgme');
    var CONFIG = require('../../../test-conf.js').config;
    var testConf = require('../../../test-conf.js');

    var chai = require('chai');

    var testFixture = require('../../../node_modules/webgme/test/_globals');
}

describe('ProjectImporter', function () {
    'use strict';


    var logger = testFixture.logger.fork('ProjectImporterTest'),
        gmeConfig = testFixture.getGmeConfig(),
        project,
        projectName = 'ProjectImporterTest',
        commitHash,
        Q = testFixture.Q,
        PluginCliManager = require('../../../node_modules/webgme/src/plugin/climanager');

    var path = require('path');
    var fs = require('fs');
    var BlobClient;
    var Artifact;
    var jszip;

    testConf.useStorage(projectName, before, after);


    before(function (done) {
        requirejs(['blob/BlobClient', 'blob/Artifact', 'jszip'], function (BlobClient_, Artifact_, acmTemplates_, admTemplates_, jszip_) {
            BlobClient = BlobClient_;
            Artifact = Artifact_;
            jszip = jszip_;
            done();
        }, done);
    });

    beforeEach(function (done) {
        var importParam = {
            projectSeed: './meta/ADMEditor_metaOnly.json',
            projectName: projectName,
            logger: logger,
            gmeConfig: gmeConfig
        };

        testConf.storage.deleteProject({projectName: projectName})
            .then(function () {
                return testFixture.importProject(testConf.storage, importParam);
            })
            .then(function (importResult) {
                project = importResult.project;
                commitHash = importResult.commitHash;
                done();
            })
            .catch(done);
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
                var pluginContext = {
                        commitHash: commitHash,
                        activeNode: '/1',
                        branchName: 'master'
                    },
                    pluginConfig = {
                        UploadedFile: hash
                    },
                    pluginManager = new PluginCliManager(project, logger, gmeConfig);

                pluginManager.executePlugin('ProjectImporter', pluginConfig, pluginContext, testConf.callbackImmediate(function (err, result) {
                        chai.expect(err).to.equal(null);
                        chai.expect(result.getSuccess()).to.equal(true);
                        // TODO: look at model
                        done();
                    }));
            });
        });
    });

    function newBlobClient() {
        return testConf.newBlobClient();
    }
});
