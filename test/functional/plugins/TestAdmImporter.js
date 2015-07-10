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

describe('TestAdmImporter', function () {
    'use strict';

    var Artifact;
    var acmTemplates;
    var admTemplates;
    var jszip;
    var Core;

    var logger = testFixture.logger.fork('ProjectImporterTest'),
        gmeConfig = testFixture.getGmeConfig(),
        project,
        projectName = 'TestAdmImporter',
        commitHash,
        PluginCliManager = require('../../../node_modules/webgme/src/plugin/climanager');

    testConf.useStorage(projectName, before, after);

    before(function (done) {
        requirejs(['blob/Artifact', 'test/models/adm/functional/Templates', 'jszip', 'common/core/core'], function (Artifact_, admTemplates_, jszip_, Core_) {
            Artifact = Artifact_;
            admTemplates = admTemplates_;
            jszip = jszip_;
            Core = Core_;
            done();
        }, done);
    });

    beforeEach(function (done) {
        var importParam = {
            projectSeed: './test/models/SimpleModelica.json',
            projectName: projectName,
            logger: logger,
            gmeConfig: gmeConfig
        };

        testConf.gmeAuth.authorizeByUserId('guest', 'guest+' + projectName, 'set', {read: true, write: true, delete: true})
            .then(function() {
                return testConf.storage.deleteProject({projectId: 'guest+' + projectName, userName: 'guest'});
            })
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

    it('use zips', function (done) {
        var testPoint = '/1007576016/1659905525',
            bc = newBlobClient(),
            zip = new jszip();

        zip.file('Container.adm', admTemplates['Container.adm'], {date: new Date("December 25, 2007 00:00:01")});
        zip.file('resource.bin', 'o-umlaut\u00f6 aka o-diaeresis', {date: new Date("December 25, 2007 00:00:01")});
        bc.putFile('containerupload.zip', zip.generate({type: 'nodebuffer'}), function (err, hash) {
            if (err) {
                return done(err);
            }

            // console.log(hash); // 95f5f253ec1bd748cf668024c0d51b9cc9f565f3
            var pluginContext = {
                    commitHash: commitHash,
                    activeNode: testPoint,
                    branchName: 'master'
                },
                pluginConfig = {
                    admFile: hash,
                    useExistingComponents: true
                },
                pluginManager = new PluginCliManager(project, logger, gmeConfig);

            pluginManager.executePlugin('AdmImporter', pluginConfig, pluginContext, testConf.callbackImmediate(function (err, result) {
                chai.expect(err).to.equal(null);
                chai.expect(result.getSuccess()).to.equal(true);
                var q = require('q');
                var core = new Core(project, {
                    globConf: CONFIG,
                    logger: require('webgme').Logger.create('TestAdmImporter', CONFIG.bin.log, false)
                });

                return project.getBranches()
                    .then(function (branchNames) {
                        chai.expect(result.messages["0"].commitHash).to.not.equal(branchNames.master);
                        return q.ninvoke(project, 'loadObject', branchNames.master);
                    }).then(function (commit) {
                        return q.ninvoke(core, 'loadRoot', commit.root);
                    }).then(function (root) {
                        return q.ninvoke(core, 'loadByPath', root, testPoint);
                    }).then(function (admFolder) {
                        return q.ninvoke(core, 'loadChildren', admFolder);
                    }).then(function (children) {
                        chai.expect(children.length).to.equal(2);
                        // TODO: test Resource for o-umlaut
                    }).then(function () {
                        done();
                    }).catch(function (err) {
                        done(err);
                    });
            }));
        });
    });

    function newBlobClient() {
        return testConf.newBlobClient();
    }
});
