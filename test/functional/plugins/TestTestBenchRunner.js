/*globals window, require, describe, it,before */


if (typeof window === 'undefined') {

    // server-side setup
    var requirejs = require('../../../test-conf.js').requirejs;
    var webgme = require('webgme');
    var CONFIG = require('../../../test-conf.js').config;
    var testConf = require('../../../test-conf.js');

    var chai = require('chai');
}

describe('TestBenchRunner', function () {
    'use strict';

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

    var projectName = 'TestTestBenchRunner';
    var updateMeta;
    before(function (done) {
        requirejs(['utils/update_meta.js'],
            function (updateMeta_) {
                updateMeta = updateMeta_;

                updateMeta.withProject(CONFIG, projectName, function (err, project) {
                    if (err) {
                        return done(err);
                    }
                    return updateMeta.importLibrary(CONFIG, projectName, 'master', 'test/models/SimpleModelica.json', project)
                        .then(function (/*commitHash*/) {
                            done();
                        });
                });
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
            var storage = undefined;
            // console.log(hash); // 95f5f253ec1bd748cf668024c0d51b9cc9f565f3

            webgme.runPlugin.main(
                storage,
                CONFIG, {
                projectName: projectName,
                pluginName: pluginName,
                activeNode: testPoint,
                pluginConfig: {}
            }, {}, function (err, result) {
                chai.expect(err).to.equal(null);
                chai.expect(result.getSuccess()).to.equal(true);
                var bc = newBlobClient();
                bc.getSubObject(result.artifacts[0], 'executor_config.json', function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res = JSON.parse(res);
                    chai.expect(res.cmd).to.equal('run_execution.cmd');
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
