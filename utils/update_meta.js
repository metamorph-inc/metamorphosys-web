/* global WebGMEGlobal, __dirname */
var Q = require('q');
var exportsDeferred = Q.defer();
var PATH = require('path');
var fs = require('fs');
var gmeConfig;

if (typeof module !== 'undefined') {
    module.exports = exportsDeferred.promise;

    var cyphyRootDir = PATH.resolve(__dirname, '..');
    var webGme = require('webgme');
    var CONFIG = gmeConfig = require('../config');
    var requirejs = webGme.requirejs;
    requirejs.define('gmeConfig', function () { return CONFIG; });
    webGme.addToRequireJsPaths(CONFIG);
    var define = require(PATH.resolve(cyphyRootDir, 'test-conf.js')).requirejs;
    require(PATH.resolve(__dirname, 'JSON2_ordered'));
} else {
    //var CONFIG = require('../../../test-conf.js').config;
}

if (typeof module !== 'undefined' && require.main === module) {
    var fatal = function fatal(msg) {
        console.log(msg);
        throw Error(msg);
        process.exit(1);
    };

    module.exports.then(function (exports) {
        var imported = Q.defer();
        exports.withProject(CONFIG, 'TmpProject', function (err, project) {
            if (err) {
                return imported.reject(err);
            }
            imported.resolve(exports.importLibrary(CONFIG, 'TmpProject', 'master', PATH.resolve(cyphyRootDir, 'meta/ADMEditor_metaOnly.json'), project));
            return imported.promise;
        }).catch(function (err) {
            fatal(err + ' ' + err.stack);
        });
        return imported.promise.then(function () {
                return Q.nfcall(exports.writeMetaLib);
            }).then (function () {
                return Q.nfcall(exports.writeMetaJs);
            }).then(function () {
                console.log('Success');
            });
    }).catch(fatal);
    gmeConfig = require('../config');
}


var webgme = require('webgme');
var Storage = require('webgme').serverUserStorage;
var Logger = require('webgme').Logger;
//var logger = webgme.Logger.create('cyphy:update_meta', gmeConfig.bin.log, false);
var gmeAuth, storage;
var import_ = require('../node_modules/webgme/src/bin/import').import;

define(
    [
    'common/core/core',
    'blob/BlobClient',
    'gmeConfig'
], function (Core, BlobClient, CONFIG) {
    'use strict';

    var Serialization = webgme.serializer,
        logger = Logger.create('update_meta', CONFIG.bin.log, false);

    function withProject(CONFIG, projectName, fn) {
        var args = Array.prototype.slice.call(arguments, 3),
            self = this,
            project;
        if ( global.v8debug) {
            global.v8debug.Debug.setBreakOnException(); // enable it, global.v8debug is only defined when the --debug or --debug-brk flag is set
        }
        return webgme.getGmeAuth(gmeConfig)
            .then(function (gmeAuth__) {
                gmeAuth = gmeAuth__;
                storage = require('webgme').getStorage(logger.fork('storage'), gmeConfig, gmeAuth);
                //storage = new Storage({
                //    logger: logger.fork('storage'),
                //    log: logger.fork('storage2'), // This will be deprecated by 0.9.0
                //    globConf: CONFIG}
                //);
                return Q.all([storage.openDatabase(), gmeAuth.authorizeByUserId(gmeConfig.authentication.guestAccount, projectName, 'create', { read: true, write: true, delete: true })]);
            })
            .then(function () {
                return storage.createProject({projectName: projectName, username: gmeConfig.authentication.guestAccount, createProject: true})
                    .catch(function (e) {
                        if (('' + e).indexOf('Project already exist') !== -1) {
                            return storage.openProject({projectName: projectName, username: gmeConfig.authentication.guestAccount, createProject: true});
                        }
                        throw e;
                    });
            }).then(function (project_) {
                project = project_;
                args.push(project);
                args.unshift(null /* err */);
                return fn.apply(self, args);
            }).finally(function () {
                if (project) {
                    return project.closeProject();
                }
            }).finally(function () {
                return storage.closeDatabase();
            }).catch(fn);
    }

    function importLibrary(CONFIG, projectName, branch, metaJson, project) {
        return Q.ninvoke(fs, 'readFile', metaJson, {encoding: 'utf-8'})
            .then(function (metaJson) {
                return Q.nfcall(import_, storage, gmeConfig, projectName, JSON.parse(metaJson), 'master', 'true', 'guest');
            });


        var storage__ = require('webgme').getStorage(logger.fork('storage'), gmeConfig, gmeAuth),
            core,
            deferred = Q.defer(),
            root;

        project = new Project(dbProject, storage, logger, gmeConfig);
        project.setUser(username);

        core = new Core(project, {globConf: CONFIG, logger: logger});
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
        var __storage /*= new Storage({
                log: logger.fork('storage'),
                logger: logger.fork('storage'),
                globConf: CONFIG
            })*/,
            project,
            core,
            projectName = 'TmpProject';
        Q.ninvoke(storage, 'openDatabase')
            .then(function () {
                return storage.openProject({projectName: projectName, username: gmeConfig.authentication.guestAccount, createProject: true});
                // return storage.openProject(', projectName);
            }).then(function (p) {
                project = p;
                core = new Core(storage, {globConf: CONFIG, logger: logger});
                return project.getBranchHash('master');
            }).then(function (commitHash) {
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
        pluginConfig.projectName = pluginConfig.project = "TmpProject";
        pluginConfig.branch = "master";
        pluginConfig.pluginName = "PluginGenerator";
        pluginConfig.activeNode = undefined;
        pluginConfig.activeSelection = undefined;
        pluginConfig.pluginConfig = {};
        webGme.runPlugin.main(null, CONFIG, pluginConfig, pluginConfig.pluginConfig, function (err, result) {
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
        pluginConfig.projectName = pluginConfig.project = "TmpProject";
        pluginConfig.branch = "master";
        pluginConfig.pluginName = "MockModelGenerator";
        pluginConfig.activeNode = "/1";
        pluginConfig.activeSelection = undefined;
        pluginConfig.pluginConfig = { timeOut: 0};
        webGme.runPlugin.main(null, CONFIG, pluginConfig, pluginConfig.pluginConfig, function (err, result) {
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
}, function (err) {
    exportsDeferred.reject(err);
});
