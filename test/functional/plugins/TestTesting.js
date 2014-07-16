


if (typeof window === 'undefined') {

    // server-side setup
    var webgme = require('webgme');
    var webgmeConfig = require('../../../config.json');
    webGMEGlobal.setConfig(webgmeConfig);

    var chai = require('chai');
}

describe('TestTesting', function () {
    'use strict';
    
    it('AdmExporter should fail on AtmAsActiveNode', function (done) {
        var projectName = 'ADMEditor',
            pluginName = 'AdmExporter',
            testPoint = '/1937510081/1067632681/267370409',
            expectedSuccess = false,
            assetHash = '';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
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
        var projectName = 'ADMEditor',
            pluginName = 'AdmImporter',
            testPoint = '/1937510081/1067632681/267370409',
            expectedSuccess = false,
            assetHash = '';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
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
        var projectName = 'ADMEditor',
            pluginName = 'AcmImporter',
            testPoint = '/1937510081/1067632681/267370409',
            expectedSuccess = false,
            assetHash = '';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
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
        var projectName = 'ADMEditor',
            pluginName = 'AdmImporter',
            testPoint = '/1937510081/1096423255/1226230639',
            expectedSuccess = false,
            assetHash = '';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
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
        var projectName = 'ADMEditor',
            pluginName = 'AdmExporter',
            testPoint = '/1937510081/1096423255/1226230639',
            expectedSuccess = false,
            assetHash = '';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
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
        var projectName = 'ADMEditor',
            pluginName = 'AcmImporter',
            testPoint = '/1937510081/1096423255/1226230639',
            expectedSuccess = false,
            assetHash = '';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
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
        var projectName = 'ADMEditor',
            pluginName = 'AdmExporter',
            testPoint = '/1937510081/640868054/1855432438',
            expectedSuccess = true,
            assetHash = '';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
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
        var projectName = 'ADMEditor',
            pluginName = 'AdmImporter',
            testPoint = '/1937510081/1067632681/267370409',
            expectedSuccess = false,
            assetHash = '';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
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
        var projectName = 'ADMEditor',
            pluginName = 'AcmImporter',
            testPoint = '/1937510081/1067632681/267370409',
            expectedSuccess = false,
            assetHash = '';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AcmImporter should succeed on ImportDamper', function (done) {
        var projectName = 'ADMEditor',
            pluginName = 'AcmImporter',
            testPoint = '/1937510081/977006072/311681776',
            expectedSuccess = true,
            assetHash = 'cdf0bf15cbd31f0b4b07a2deb7a47abcd952d8be';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint,
            pluginConfig: { UploadedFile: assetHash }
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

    it('AdmImporter should succeed on ImportWheel', function (done) {
        var projectName = 'ADMEditor',
            pluginName = 'AdmImporter',
            testPoint = '/1937510081/799069300/1883835269/1367508869',
            expectedSuccess = true,
            assetHash = '1b40c20526b7eb0c454abc0f5bd6bc3d3e864e54';

        webgme.runPlugin.main(webGMEGlobal.getConfig(), {
            projectName: projectName,
            pluginName: pluginName,
            activeNode: testPoint,
            pluginConfig: { admFile: assetHash }
        }, function (err, result) {
            chai.expect(err).to.equal(null);
            chai.expect(result.getSuccess()).to.equal(expectedSuccess);
            done();
        });
    });

});