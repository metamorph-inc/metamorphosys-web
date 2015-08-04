/* global define,require,process */
define([
    'plugin/PluginBase',
    'plugin/AdmImporter/AdmImporter/meta',
    'q',
    'superagent'
], BrdImporter);
function BrdImporter(PluginBase, MetaTypes, Q, superagent) {
    'use strict';
    //<editor-fold desc="============================ Class Definition ================================">
    /**
     * Initializes a new instance of BrdImporter.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin BrdImporter.
     * @constructor
     */
    var BrdImporter = function () {
        PluginBase.call(this);
        this.meta = MetaTypes;
    };

    // Prototypal inheritance from PluginBase.
    BrdImporter.prototype = Object.create(PluginBase.prototype);
    BrdImporter.prototype.constructor = BrdImporter;

    /**
     * Gets the name of the BrdImporter.
     * @returns {string} The name of the plugin.
     * @public
     */
    BrdImporter.prototype.getName = function () {
        return 'BRD Importer';
    };

    /**
     * Gets the description of the BrdImporter.
     * @returns {string} The description of the plugin.
     * @public
     */
    BrdImporter.prototype.getDescription = function () {
        return 'Imports an brd file generated from EAGLE.';
    };

    /**
     * Gets the semantic version (semver.org) of the BrdImporter.
     * @returns {string} The version of the plugin.
     * @public
     */
    BrdImporter.prototype.getVersion = function () {
        return '0.1.0';
    };

    /**
     * Gets the configuration structure for the BrdImporter.
     * The ConfigurationStructure defines the configuration for the plugin
     * and will be used to populate the GUI when invoking the plugin from webGME.
     * @returns {object} The version of the plugin.
     * @public
     */
    BrdImporter.prototype.getConfigStructure = function () {
        return [
            {
                'name': 'brdFile',
                'displayName': 'BRD file',
                'description': 'Board file',
                'value': '',
                'valueType': 'asset',
                'readOnly': false
            }
        ];
    };

    BrdImporter.prototype.getBoardSynthesis = function () {
        var path = require('path'),
            fs = require('fs');
        if (process.env.BOARDSYNTHESIS) {
            return Q(process.env.BOARDSYNTHESIS);
        }

        var deferred = Q.defer();
        if (process.platform === 'win32') {
            var winreg = require('winreg');
            var regKey = new winreg({
                hive: winreg.HKLM,
                key: '\\Software' + (process.arch === 'x64' ? '\\Wow6432Node' : '') + '\\META' // FIXME should specify 32bit hive in a better way
            });
            regKey.values(function (err, items) {
                var metaPath = (items || []).filter(function (value) {
                    return value.name === 'META_PATH' && value.type === 'REG_SZ';
                })[0];
                if (metaPath) {
                    var bs = path.join(metaPath.value, '../tonka/src/BoardSynthesis/bin/Release/BoardSynthesis.exe');
                    fs.exists(bs, function (exists) {
                        if (exists) {
                            return deferred.resolve(bs);
                        }
                        bs = path.join(metaPath.value, 'bin/BoardSynthesis.exe');
                        fs.exists(bs, function (exists) {
                            if (exists) {
                                return deferred.resolve(bs);
                            }
                            deferred.resolve('BoardSynthesis.exe');
                        });
                    });
                } else {
                    deferred.resolve('BoardSynthesis.exe');
                }
            });
        } else {
            deferred.resolve('BoardSynthesis.exe');
        }

        return deferred.promise;
    };

    BrdImporter.prototype.loadLastResult = function () {
        var self = this;

        function compareResult(a, b) {
            if (a.startTime < b.startTime) {
                // newest first
                return 1;
            }
            return -1;
        }

        var url = '/rest/external/testbenches/results/?projectId=' + encodeURIComponent(self.projectName)
            + '&branchId=' + encodeURIComponent(self.branchName);
        if (typeof window === 'undefined') {
            // TODO: won't work after we turn on auth
            url = (self.gmeConfig.server.https.enable ? 'https://' : 'http://') +
                '127.0.0.1:' + self.gmeConfig.server.port +
                url;
        }
        var request = superagent.get(url);
        return Q.ninvoke(request, 'end')
            .then(function (res) {
                var results = res.body.results;
                return Q.allSettled(results.map(function (result) {
                    return Q.ninvoke(self.core, 'loadByPath', self.rootNode, result.testBenchId)
                        .then(function (tb) {
                            return {node: tb, result: result};
                        });
                })).then(function (filteredResults) {
                    filteredResults = filteredResults.filter(function (result) {
                        return result.state === 'fulfilled';
                    }).map(function (result) {
                        return result.value;
                    }).filter(function (result) {
                        return self.core.getAttribute(result.node, 'name') === 'Place and Route';
                    }).filter(function (result) {
                        return self.core.getPointerPath(result.node, 'TopLevelSystemUnderTest') === self.core.getPath(self.activeNode);
                    }).map(function (result) {
                        return result.result;
                    });
                    filteredResults.sort(compareResult);
                    self.testBenchResult = filteredResults[0];
                    if (!self.testBenchResult || self.testBenchResult.status !== 'Succeeded') {
                        throw new Error('Latest testbench result has not succeeded. Start a testbench and wait for it to complete');
                    }
                    // TODO: check model's hash matches result hash? (but what if there are unrelated changes)
                });
            });
    };

    BrdImporter.prototype.updateLayoutJson = function () {
        var self = this;
        // get/save input files: brd from config, sch and layout.json from last result

        var crypto = require('crypto');
        var fs = require('fs');
        var path = require('path');
        var os = require('os');
        var child_process = require('child_process');

        var mkdirs = function (fold, callback) {
            var pf = path.dirname(fold);
            fs.exists(pf, function (exists) {
                var create = function () {
                    fs.mkdir(fold, callback);
                };
                if (exists) {
                    create();
                } else {
                    mkdirs(pf, create);
                }
            });
        };

        var dirname = path.join(os.tmpdir(), 'brd' + crypto.pseudoRandomBytes(15).toString('hex'));
        return Q.nfcall(mkdirs, dirname)
            .then(function () {
                return Q.ninvoke(self.blobClient, 'getArtifact', self.testBenchResult.resultHash);
            })
            .then(function (artifact) {
                var saveBlobAsFile = function (hash, filename) {
                    return Q.ninvoke(self.blobClient, 'getObject', hash)
                        .then(function (fileContent) {
                            return Q.ninvoke(fs, 'writeFile', path.join(dirname, filename), fileContent);
                        });
                };
                return Q.all([
                    saveBlobAsFile(artifact.descriptor.content['results/schema.sch'].content, 'schema.sch'),
                    saveBlobAsFile(artifact.descriptor.content['results/layout.json'].content, 'layout.json'),
                    saveBlobAsFile(self.getCurrentConfig().brdFile, 'schema.brd')
                ]);
            })
            .then(function () {
                return self.getBoardSynthesis()
                    .then(function (boardSynthesis) {
                        return Q.ninvoke(child_process, 'execFile', boardSynthesis, ['schema.sch', 'layout.json', '-r'],
                            {
                                cwd: dirname
                                // TODO encoding: ...; child_process.exec("powershell [console]::OutputEncoding.CodePage", function (err, stdout, stderr) { console.log(err,stdout,stderr) }) => 437
                            })
                            .then(function (stdout, stderr) {
                                self.logger.info('BoardSynthesis.exe stdout ' + stdout + '\nstderr ' + stderr);
                            })
                            .then(function () {
                                return Q.ninvoke(fs, 'readFile', path.join(dirname, 'layout.json'), {encoding: 'utf8'});
                            })
                            .then(function (layoutJson_) {
                                // TODO: remove dirname
                                self.layoutJson = layoutJson_;
                            });
                    });
            });
    };

    BrdImporter.prototype.updateModel = function () {
        var self = this;
        // add Resource to model
        var oldArtifactHash = self.core.getAttribute(self.activeNode, 'Resource');
        var artifactPromise;
        if (oldArtifactHash) {
            artifactPromise = Q.ninvoke(self.blobClient, 'getArtifact', oldArtifactHash)
                .then(function (artifact) {
                    delete artifact.descriptor.content['layout.json'];
                    return artifact;
                });
        } else {
            artifactPromise = Q(self.blobClient.createArtifact(self.core.getAttribute(self.activeNode, 'name')));
        }
        return artifactPromise.then(function (artifact) {
            return Q.ninvoke(artifact, 'addFileAsSoftLink', 'layout.json', self.layoutJson)
                .then(function () {
                    return Q.ninvoke(artifact, 'save');
                });
        }).then(function (artifactHash) {
            self.core.setAttribute(self.activeNode, 'Resource', artifactHash);

            return Q.ninvoke(self.core, 'loadChildren', self.activeNode);
        }).then(function (containerChildren) {
            // TODO load children and check for already exist
            var resource = containerChildren.filter(function (child) {
                return self.isMetaTypeOf(child, self.META.Resource) && self.core.getAttribute(child, 'name') === 'layoutFile';
            })[0];
            if (!resource) {
                resource = self.core.createNode({
                    parent: self.activeNode,
                    base: self.meta.Resource
                });
            }
            self.core.setAttribute(resource, 'name', 'layoutFile');
            self.core.setAttribute(resource, 'Path', 'layout.json');

            var domainModel = containerChildren.filter(function (child) {
                return self.isMetaTypeOf(child, self.META.DomainModel) && self.core.getAttribute(child, 'name') === 'circuitLayout';
            })[0];
            if (!domainModel) {
                domainModel = self.core.createNode({
                    parent: self.activeNode,
                    base: self.meta.DomainModel
                });
            }
            self.core.setAttribute(domainModel, 'name', 'circuitLayout');
            self.core.setAttribute(domainModel, 'Type', 'CircuitLayout');
            var layout = JSON.parse(self.layoutJson);
            var box = '0,0,' + layout.boardWidth + ',' + layout.boardHeight;
            self.core.setAttribute(domainModel, 'BoundingBoxes', box + ',0,' + box + ',1');
            self.core.deleteSet(domainModel, 'UsesResource');
            self.core.addMember(domainModel, 'UsesResource', resource);
            return Q.ninvoke(self, 'save', 'imported brd file');
        });
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always have to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    BrdImporter.prototype.main = function (callback) {
        var self = this,
            config = self.getCurrentConfig();

        if (typeof window !== 'undefined') {
            self.createMessage(null, 'This plugin must be run on the server', 'error');
            callback('This plugin must be run on the server', self.result);
            return;
        }
        if (!self.activeNode) {
            self.createMessage(null, 'Active node is not present', 'error');
            callback('Active node is not present', self.result);
            return;
        }

        if (self.isMetaTypeOf(self.activeNode, self.META.Container) === false) {
            self.result.setSuccess(false);
            self.createMessage(null, 'This plugin must be called from a Container', 'error');
            callback(null, self.result);
            return;
        }
        // config.brdFile = config.brdFile || 'cc65f40954e16cf3e6c7250c63ef9aee2013cc9b';
        if (!config.brdFile) {
            self.createMessage(null, 'No brd file provided', 'error');
            callback(null, self.result);
            return;
        }
        self.updateMETA(self.meta);

        self.loadLastResult()
            .then(self.updateLayoutJson.bind(self))
            .then(self.updateModel.bind(self))
            .nodeify(function (err) {
                if (err) {
                    self.createMessage(null, err.message || err.msg || err, 'error');
                    callback(null, self.result);
                    return;
                }
                self.result.setSuccess(true);
                callback(null, self.result);
            });

    };

    return BrdImporter;
}
