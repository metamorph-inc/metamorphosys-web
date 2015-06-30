/*globals window, require, describe, it,before */


if (typeof window === 'undefined') {

    // server-side setup
    var requirejs = require('../../../test-conf.js').requirejs;
    var webgme = require('webgme');
    var CONFIG = require('../../../test-conf.js').config;
    var testConf = require('../../../test-conf.js');

    var chai = require('chai');
    var testFixture = require('../../../node_modules/webgme/test/_globals');
}

describe('TestBenchRunner', function () {
    'use strict';

    var BlobClient;
    var Artifact;
    var acmTemplates;
    var admTemplates;
    var jszip;

    var projectName = 'TestTestBenchRunner';
    var logger = testFixture.logger.fork(projectName),
        gmeConfig = testFixture.getGmeConfig(),
        project,
        commitHash,
        PluginCliManager = require('../../../node_modules/webgme/src/plugin/climanager');

    testConf.useStorage(projectName, before, after);

    beforeEach(function (done) {
        var importParam = {
            projectSeed: './test/models/SimpleModelica.json',
            projectName: projectName,
            logger: logger,
            gmeConfig: gmeConfig
        };

        testConf.storage.deleteProject({projectId: webgme.requirejs('common/storage/util').getProjectIdFromUserIdAndProjectName('guest', projectName)})
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

    it('TestBenchRunner', function (done) {
        var pluginName = 'TestBenchRunner',
            testPoint = '/1007576016/1059726760/686890673',
            bc = newBlobClient(),
            zip = new jszip();

        zip.file('testbench.xme', '<fake xme>', {date : new Date("December 25, 2007 00:00:01")});
        bc.putFile('testbench.zip', zip.generate(), function (err, hash) {
            if (err) {
                return done(err);
            }
            var pluginContext = {
                    commitHash: commitHash,
                    activeNode: testPoint,
                    branchName: 'master'
                },
                pluginConfig = {
                },
                pluginManager = new PluginCliManager(project, logger, gmeConfig);

            pluginManager.executePlugin(pluginName, pluginConfig, pluginContext, testConf.callbackImmediate(function (err, result) {
                chai.expect(err).to.equal(null);
                chai.expect(result.getSuccess()).to.equal(true);
                //chai.expect(result.artifacts[0]).to.equal('647767cc4a46fc26b663f7ead26944b09ed8ad99');
                var bc = newBlobClient();
                bc.getSubObject(result.artifacts[0], 'executor_config.json', function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res = JSON.parse(res);
                    chai.expect(res.cmd).to.equal('run_execution.cmd');
                    done();
                });
            }));
        });
    });

    function newBlobClient() {
        return testConf.newBlobClient();
    }
});
