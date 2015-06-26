/*globals window, require, describe, it,before,after */


if (typeof window === 'undefined') {

    // server-side setup
    var webgme = require('webgme');
    var requirejs = require('../../../test-conf.js').requirejs;
    var config = require('../../../test-conf.js').config;
    var testConf = require('../../../test-conf.js');

    var chai = require('chai');
}

describe.skip('TestTesting', function () {
    'use strict';
    var projectName = 'TestTesting',
        updateMeta,
        commitHash; // TODO: restore master to this commit before each test (but then 'AdmImporter should succeed on ValueFlow' will fail)

    var BlobClient;
    var Artifact;
    var acmTemplates;
    var admTemplates;

    // testConf.useServer(before, after);

    before(function (done) {
        requirejs(['blob/BlobClient', 'blob/Artifact', 'test/models/acm/unit/Templates', 'test/models/adm/functional/Templates'], function (BlobClient_, Artifact_, acmTemplates_, admTemplates_) {
            BlobClient = BlobClient_;
            Artifact = Artifact_;
            acmTemplates = acmTemplates_;
            admTemplates = admTemplates_;
            done();
        });
    });

    before(function (done) {
        requirejs(
            ['utils/update_meta.js'],
            function (updateMeta_) {
                updateMeta = updateMeta_;

                updateMeta.withProject(config, projectName, function (err, project) {
                    if (err) {
                        return done(err);
                    }
                    return updateMeta.importLibrary(config, projectName, 'master', 'test/models/SimpleModelica.json', project)
                        .then(function (commitHash_) {
                            commitHash = commitHash_;
                            done();
                        });
                });
            });
    });

    it('AdmExporter should fail on AtmAsActiveNode', function (done) {
        var pluginName = 'AdmExporter',
            testPoint = '/1007576016/1059726760/686890673',
            expectedSuccess = false;

        webgme.runPlugin.main(null, config, {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, {}, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmImporter should fail on AtmAsActiveNode', function (done) {
        var pluginName = 'AdmImporter',
            testPoint = '/1007576016/1059726760/686890673',
            expectedSuccess = false;

        webgme.runPlugin.main(null, config, {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, {}, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AcmImporter should fail on AtmAsActiveNode', function (done) {
        var pluginName = 'AcmImporter',
            testPoint = '/1007576016/1059726760/686890673',
            expectedSuccess = false;

        webgme.runPlugin.main(null, config, {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint,
            pluginConfig: { UploadedFile: 'nonexistant' }
        }, { UploadedFile: 'nonexistant' }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmImporter should fail on AcmAsActiveNode', function (done) {
        var pluginName = 'AdmImporter',
            testPoint = '/1007576016/1671134528',
            expectedSuccess = false;

        webgme.runPlugin.main(null ,config, {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, {}, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmExporter should fail on AcmAsActiveNode', function (done) {
        var pluginName = 'AdmExporter',
            testPoint = '/1007576016/1671134528',
            expectedSuccess = false;

        webgme.runPlugin.main(null, config, {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, {}, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AcmImporter should fail on AcmAsActiveNode', function (done) {
        var pluginName = 'AcmImporter',
            testPoint = '/1007576016/1671134528/1332252948',
            expectedSuccess = false;

        webgme.runPlugin.main(null, config, {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint,
            pluginConfig: { UploadedFile: 'nonexistant' }
        }, { UploadedFile: 'nonexistant' }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmExporter should succeed on WheelADM', function (done) {
        var pluginName = 'AdmExporter',
            testPoint = '/1007576016/1659905525/1591506645',
            expectedSuccess = true;
        webgme.runPlugin.main(null, config, {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, {}, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmImporter should fail on AdmAsActiveNode', function (done) {
        var pluginName = 'AdmImporter',
            testPoint = '/1007576016/1659905525/1591506645',
            expectedSuccess = false;

        webgme.runPlugin.main(null, config, {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, {}, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AcmImporter should fail on AdmAsActiveNode', function (done) {
        var pluginName = 'AcmImporter',
            testPoint = '/1007576016/1659905525/1591506645',
            expectedSuccess = false;

        webgme.runPlugin.main(null, config, {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint,
            pluginConfig: { UploadedFile: 'nonexistant' }
        }, { UploadedFile: 'nonexistant' }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    function newBlobClient() {
        return new BlobClient({
            server: 'localhost',
            serverPort: config.server.port,
            httpsecure: false
        });
    }

    it('AcmImporter should succeed on Formulas', function (done) {
        var pluginName = 'AcmImporter',
            testPoint = '/1007576016/1671134528',
            expectedSuccess = true,
            artifact = new Artifact('Formulas.zip', newBlobClient());

        artifact.addFiles({'component.acm': acmTemplates['Formulas.acm']}, function (err, hashes) {
            if (err) {
                return done(err);
            }
            artifact.save(function (err, hash) {
                if (err) {
                    return done(err);
                }
                webgme.runPlugin.main(null, config, {
                    projectName: projectName,
                    pluginName: pluginName,
                    activeNode: testPoint,
                    pluginConfig: { UploadedFile: hash }
                }, { UploadedFile: hash}, function (err, result) {
                    chai.expect(err).to.equal(null);
                    chai.expect(result.getSuccess()).to.equal(expectedSuccess);
                    done();
                });
            });
        });
    });

    it('AdmImporter should succeed on ValueFlow', function (done) {
        var pluginName = 'AdmImporter',
            testPoint = '/1007576016/1659905525',
            expectedSuccess = true,
            bc = newBlobClient();

        bc.putFile("Container.adm", admTemplates['Container.adm'], function(err, hash) {
            if (err) {
                return done(err);
            }
            webgme.runPlugin.main(null, config, {
                projectName: projectName,
                pluginName: pluginName,
                activeNode: testPoint,
                pluginConfig: { admFile: hash }
            }, { admFile: hash }, function (err, result) {
                chai.expect(err).to.equal(null);
                chai.expect(result.getSuccess()).to.equal(expectedSuccess);
                done();
            });
        });
    });

});
