/* global WebGMEGlobal */
var Q = require('q');
var exportsDeferred = Q.defer();
var PATH = require('path');
var fs = require('fs');

if (typeof module !== 'undefined' && require.main === module) {
    module.exports = exportsDeferred.promise;

    var cyphyRootDir = PATH.resolve(__dirname, '..');
    var webGme = require('webgme');
    var CONFIG = WebGMEGlobal.getConfig();
    var define = require(PATH.resolve(cyphyRootDir, 'test-conf.js')).requirejs;
    require(PATH.resolve(__dirname, 'JSON2_ordered'));

    var CyPhyConfig = require(PATH.resolve(cyphyRootDir, "config.json"));
    WebGMEGlobal.setConfig(CyPhyConfig);
// TODO: check if command line config valid or not
// TODO: probably we should not overwrite the dictionary and array options
    for (var key in CyPhyConfig) {
        CONFIG[key] = CyPhyConfig[key];
    }
    var fatal = function fatal(msg) {
        console.log(msg);
        throw Error(msg);
        process.exit(1);
    };

    module.exports.then(function (exports) {
        exports.withProject(CONFIG, 'TmpProject', exports.importLibrary, CONFIG, 'TmpProject', 'master', PATH.resolve(cyphyRootDir, 'meta/ADMEditor_metaOnly.json'))
            .then(function () {
                return Q.nfcall(exports.writeMetaLib);
            }).then (function () {
                return Q.nfcall(exports.writeMetaJs);
            }).then(function () {
                console.log('Success');
            });
    }).catch(fatal);
}

define([
    'core/coreforplugins',
    'storage/serveruserstorage',
    'coreclient/serialization',
    'blob/BlobClient',
    'logManager'
], function (Core, Storage, Serialization, BlobClient, LogManager) {
    'use strict';

    function withProject(CONFIG, projectName, fn) {
        var storage = new Storage({'host': CONFIG.mongoip, 'port': CONFIG.mongoport, 'database': CONFIG.mongodatabase, log: LogManager.create('storage')}),
            args = Array.prototype.slice.call(arguments, 3),
            self = this,
            project;
        return Q.ninvoke(storage, 'openDatabase')
            .then(function () {
                return Q.ninvoke(storage, 'openProject', projectName);
            }).then(function (project_) {
                project = project_;
                args.push(project);
                return fn.apply(self, args);
            }).finally(function () {
                return Q.ninvoke(project, 'closeProject');
            }).finally(function () {
                return Q.ninvoke(storage, 'closeDatabase');
            });

    }

    function importLibrary(CONFIG, projectName, branch, metaJson, project) {
        var storage = new Storage({'host': CONFIG.mongoip, 'port': CONFIG.mongoport, 'database': CONFIG.mongodatabase, log: LogManager.create('storage')}),
            core,
            deferred = Q.defer(),
            root;
        core = new Core(project);
        root = core.createNode({parent: null, base: null});
        Q.ninvoke(fs, 'readFile', metaJson, {encoding: 'utf-8'})
            .then(function (metaJson) {
                var parsedMetaJson = JSON.parse(metaJson);
                if (parsedMetaJson.root.path) {
                    throw new Error('Input should be export of branch, not library export'); // TODO: support lib export
                }
                return Q.ninvoke(Serialization, 'import', core, root, parsedMetaJson);
            }).catch(function (err) {
                return Q.ninvoke(storage, 'deleteProject', projectName)
                    .then(function () {
                        throw err;
                    });
            }).then(function () {
                var rhash, commitHash,
                    persistDeferred = Q.defer(),
                    makeCommitDeferred = Q.defer();
                core.persist(root, function (err) {
                    if (err) {
                        return persistDeferred.reject(err);
                    }
                    persistDeferred.resolve();
                });
                rhash = core.getHash(root);
                commitHash = project.makeCommit([], rhash, 'project imported', function (err) {
                    if (err) {
                        return makeCommitDeferred.reject(err);
                    }
                    makeCommitDeferred.resolve();
                });
                return [commitHash, Q.ninvoke(project, 'getBranchHash', 'master', '#hack'), persistDeferred, makeCommitDeferred];
            }).spread(function (commitHash, oldhash) {
                oldhash = oldhash[0];
                return [commitHash, Q.ninvoke(project, 'setBranchHash', 'master', oldhash, '')];
            }).spread(function (commitHash) {
                return [commitHash, Q.ninvoke(project, 'setBranchHash', 'master', '', commitHash)];
            }).spread(function (commitHash) {
                return commitHash;
            }).catch(function (err) {
                deferred.reject(err);
            }).then(function (commitHash) {
                deferred.resolve(commitHash);
            });
        return deferred.promise;
    }

    function writeMetaLib(callback) {
        var storage = new Storage({'host': CONFIG.mongoip, 'port': CONFIG.mongoport, 'database': CONFIG.mongodatabase}),
            project,
            core,
            projectName = 'TmpProject';
        Q.ninvoke(storage, 'openDatabase')
            .then(function () {
                return Q.ninvoke(storage, 'openProject', projectName);
            }).then(function (p) {
                project = p;
                core = new Core(project);
                return Q.ninvoke(project, 'getBranchHash', 'master', '#hack');
            }).spread(function (commitHash) {
                return Q.ninvoke(project, 'loadObject', commitHash);
            }).then(function (res) {
                return Q.ninvoke(core, 'loadRoot', res.root);
            }).then(function (root) {
                console.log(root);
                return Q.ninvoke(core, 'loadChildren', root);
            }).then(function (children) {
                var meta = children.filter(function (child) {
                    return core.getAttribute(child, 'name') === 'ADMEditorModelingLanguage';
                })[0];

                return Q.ninvoke(Serialization, 'export', core, meta);
            }).then(function (res) {
                return Q.ninvoke(fs, 'writeFile', PATH.resolve(cyphyRootDir, 'meta/ADMEditor_metaLib.json'), JSON.stringify_ordered(res, undefined, 4), {encoding: 'utf-8'});
            }).catch(fatal)
            .finally(function () {
                return Q.ninvoke(project, 'closeProject');
            }).finally(function () {
                return Q.ninvoke(storage, 'closeDatabase');
            }).then(function () {
                callback(null);
            });

    }

    function writeMetaJs(callback) {
        var pluginConfig = {};
        pluginConfig.projectName = "TmpProject";
        pluginConfig.branch = "master";
        pluginConfig.pluginName = "PluginGenerator";
        pluginConfig.activeNode = undefined;
        pluginConfig.activeSelection = undefined;
        pluginConfig.pluginConfig = {};
        webGme.runPlugin.main(CONFIG, pluginConfig, function (err, result) {
            if (err) {
                fatal(err);
            }
            var blobClient = new BlobClient({
                server: 'localhost',
                serverPort: 8855,
                httpsecure: false,
                sessionId: undefined
            });
            blobClient.getArtifact(result.artifacts[0], function (err, data) {
                if (err) {
                    fatal(err);
                }
                blobClient.getSubObject(result.artifacts[0], 'src/plugins/TmpProject/NewPlugin/meta.js', function (err, res) {
                    if (err) {
                        fatal(err);
                    }
                    var meta_js = res.toString('utf8');
                    ['src/plugins/ADMEditor/AcmImporter/meta.js',
                        'src/plugins/ADMEditor/AdmExporter/meta.js',
                        'src/plugins/ADMEditor/AdmImporter/meta.js',
                        'src/plugins/ADMEditor/AtmExporter/meta.js',
                        'src/plugins/ADMEditor/AtmImporter/meta.js'].forEach(function (f) {
                            fs.writeFileSync(PATH.resolve(cyphyRootDir, f), meta_js, {encoding: 'utf-8'});
                        });

                    writeExampleModel(callback);
                });
            });
        });
    }
    function writeExampleModel(callback) {
        var pluginConfig = {};
        pluginConfig.projectName = "TmpProject";
        pluginConfig.branch = "master";
        pluginConfig.pluginName = "MockModelGenerator";
        pluginConfig.activeNode = "/1";
        pluginConfig.activeSelection = undefined;
        pluginConfig.pluginConfig = { timeOut: 0};
        webGme.runPlugin.main(CONFIG, pluginConfig, function (err, result) {
            if (err) {
                fatal(err);
            }
            var blobClient = new BlobClient({
                server: 'localhost',
                serverPort: 8855,
                httpsecure: false,
                sessionId: undefined
            });
            blobClient.getArtifact(result.artifacts[0], function (err, data) {
                if (err) {
                    fatal(err);
                }
                blobClient.getSubObject(result.artifacts[0], 'test/models/TmpProject/META.js', function (err, res) {
                    if (err || res.error) {
                        fatal(err || res.error);
                    }
                    var meta_js = res.toString('utf8');
                    ['test/models/AcmImporter/META.js'].forEach(function (f) {
                            fs.writeFileSync(PATH.resolve(cyphyRootDir, f), meta_js, {encoding: 'utf-8'});
                        });
                    callback(null);
                });
            });
        });
    }

    var exp = {
        withProject: withProject,
        importLibrary: importLibrary,
        writeMetaLib: writeMetaLib,
        writeMetaJs: writeMetaJs
    };
    exportsDeferred.resolve(exp);
    return exp;
});
