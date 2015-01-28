/*globals window, WebGMEGlobal, require, describe, it,before */


if (typeof window === 'undefined') {

    // server-side setup
    var webgme = require('webgme');
    var requirejs = require("../../../test-conf.js").requirejs;
    var webgme = require('webgme');

    var chai = require('chai');
}

describe('TestTesting', function () {
    'use strict';
    var projectName = 'TestTesting',
        updateMeta,
        commitHash; // TODO: restore master to this commit before each test (but then 'AdmImporter should succeed on ValueFlow' will fail)

    var BlobClient;
    var Artifact;
    var acmTemplates;
    var admTemplates;
    before(function (done) {
        requirejs(['blob/BlobClient', 'blob/Artifact', 'test/models/acm/unit/Templates', 'test/models/adm/unit/Templates'], function (BlobClient_, Artifact_, acmTemplates_, admTemplates_) {
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

                updateMeta.withProject(WebGMEGlobal.getConfig(), projectName, function (project) {
                    return updateMeta.importLibrary(WebGMEGlobal.getConfig(), projectName, 'master', 'test/models/SimpleModelica.json', project)
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

        webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmImporter should fail on AtmAsActiveNode', function (done) {
        var pluginName = 'AdmImporter',
            testPoint = '/1007576016/1059726760/686890673',
            expectedSuccess = false;

        webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AcmImporter should fail on AtmAsActiveNode', function (done) {
        var pluginName = 'AcmImporter',
            testPoint = '/1007576016/1059726760/686890673',
            expectedSuccess = false;

        webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmImporter should fail on AcmAsActiveNode', function (done) {
        var pluginName = 'AdmImporter',
            testPoint = '/1007576016/1671134528',
            expectedSuccess = false;

        webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmExporter should fail on AcmAsActiveNode', function (done) {
        var pluginName = 'AdmExporter',
            testPoint = '/1007576016/1671134528',
            expectedSuccess = false;

        webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AcmImporter should fail on AcmAsActiveNode', function (done) {
        var pluginName = 'AcmImporter',
            testPoint = '/1007576016/1671134528/1332252948',
            expectedSuccess = false;

        webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmExporter should succeed on WheelADM', function (done) {
        var pluginName = 'AdmExporter',
            testPoint = '/1007576016/1659905525/1591506645',
            expectedSuccess = true;
        webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmImporter should fail on AdmAsActiveNode', function (done) {
        var pluginName = 'AdmImporter',
            testPoint = '/1007576016/1659905525/1591506645',
            expectedSuccess = false;

        webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AcmImporter should fail on AdmAsActiveNode', function (done) {
        var pluginName = 'AcmImporter',
            testPoint = '/1007576016/1659905525/1591506645',
            expectedSuccess = false;

        webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    function newBlobClient() {
        return new BlobClient({
            server: 'localhost',
            serverPort: WebGMEGlobal.getConfig().port,
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
                webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
                    projectName: projectName,
                    pluginName: pluginName,
                    activeNode: testPoint,
                    pluginConfig: { UploadedFile: hash }
                }, function (err, result) {
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

        bc.putFile("ValueFlow.adm", admTemplates['ValueFlow.adm'], function(err, hash) {
            if (err) {
                return done(err);
            }
            webgme.runPlugin.main(WebGMEGlobal.getConfig(), {
                projectName: projectName,
                pluginName: pluginName,
                activeNode: testPoint,
                pluginConfig: { admFile: hash }
            }, function (err, result) {
                chai.expect(err).to.equal(null);
                chai.expect(result.getSuccess()).to.equal(expectedSuccess);
                done();
            });
        });
    });

});
