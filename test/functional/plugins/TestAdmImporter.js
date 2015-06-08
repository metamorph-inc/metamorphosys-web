/*globals window, require, describe, it,before */


if (typeof window === 'undefined') {

    // server-side setup
    var requirejs = require('../../../test-conf.js').requirejs;
    var webgme = require('webgme');
    var CONFIG = require('../../../test-conf.js').config;
    var testConf = require('../../../test-conf.js');

    var chai = require('chai');
}

describe('TestAdmImporter', function () {
    'use strict';

    var BlobClient;
    var Artifact;
    var acmTemplates;
    var admTemplates;
    var jszip;
    var Core;

    testConf.useServer(before, after);

    before(function (done) {
        requirejs(['blob/BlobClient', 'blob/Artifact', 'test/models/adm/functional/Templates', 'jszip', 'common/core/core'], function (BlobClient_, Artifact_, admTemplates_, jszip_, Core_) {
            BlobClient = BlobClient_;
            Artifact = Artifact_;
            admTemplates = admTemplates_;
            jszip = jszip_;
            Core = Core_;
            done();
        }, done);
    });

    var projectName = 'TestAdmImporter';
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
            var storage = undefined,
                config = {admFile: hash};

            // console.log(hash); // 95f5f253ec1bd748cf668024c0d51b9cc9f565f3

            webgme.runPlugin.main(
                storage,
                CONFIG, {
                    projectName: projectName,
                    pluginName: 'AdmImporter',
                    branchName: 'master',
                    activeNode: testPoint,
                    pluginConfig: config
                }, config, function (err, result) {
                    chai.expect(err).to.equal(null);
                    chai.expect(result.getSuccess()).to.equal(true);
                    updateMeta.withProject(CONFIG, projectName, function (err, project) {
                        if (err) {
                            return done(err);
                        }
                        var q = require('q');
                        var core = new Core(project, {
                            globConf: CONFIG,
                            logger: require('webgme').Logger.create('TestAdmImporter', CONFIG.bin.log, false)
                        });

                        return q.ninvoke(project, 'getBranchNames')
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
