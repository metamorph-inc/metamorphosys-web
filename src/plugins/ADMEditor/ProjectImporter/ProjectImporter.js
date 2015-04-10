/*globals define, escape */

define(['plugin/PluginConfig',
    'plugin/PluginBase',
    'plugin/AdmImporter/AdmImporter/meta',
    'blob/BlobClient',
    'js/logger',
    'jszip',
    'xmljsonconverter',
    'q',
    '/plugin/AcmImporter/AcmImporter/AcmImporter',
    '/plugin/AdmImporter/AdmImporter/AdmImporter',
    'plugin/PluginContext'
], function (PluginConfig, PluginBase, MetaTypes, BlobClient, LogManager, JSZip, Xml2Json, Q, AcmImporter, AdmImporter, PluginContext) {
    'use strict';

    /**
     * Initializes a new instance of ProjectImporter.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin ProjectImporter.
     * @constructor
     */
    var ProjectImporter = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.metaTypes = MetaTypes;
        this.id2NodeMap = {};
        this.valueFlowIdMap = {};
        this.recursionCounter = 0;
        this.id2ComponentMap = {};
        this.deleteExisting = false;
        this.cleanImport = true;

        //this.propertyJson = {};
    };

    // Prototypal inheritance from PluginBase.
    ProjectImporter.prototype = Object.create(PluginBase.prototype);
    ProjectImporter.prototype.constructor = ProjectImporter;

    /**
     * Gets the name of the ProjectImporter.
     * @returns {string} The name of the plugin.
     * @public
     */
    ProjectImporter.prototype.getName = function () {
        return 'Project Importer';
    };

    /**
     * Gets the semantic version (semver.org) of the ProjectImporter.
     * @returns {string} The version of the plugin.
     * @public
     */
    ProjectImporter.prototype.getVersion = function () {
        return '0.1.0';
    };

    /**
     * Gets the description of the ProjectImporter.
     * @returns {string} The description of the plugin.
     * @public
     */
    ProjectImporter.prototype.getDescription = function () {
        return 'Imports a project from an export of a GME classic project';
    };

    /**
     * Gets the configuration structure for the ProjectImporter.
     * The ConfigurationStructure defines the configuration for the plugin
     * and will be used to populate the GUI when invoking the plugin from webGME.
     * @returns {object} The version of the plugin.
     * @public
     */
    ProjectImporter.prototype.getConfigStructure = function () {
        return [{
            'name': 'UploadedFile', // May be a single .acm or a zip containing several
            'displayName': 'Exported files',
            'description': 'Upload .zips containing .acms, .adms, and testbenches.zip',
            'value': '',
            'valueType': 'asset',
            'readOnly': false
        }, {
            'name': 'DeleteExisting',
            'displayName': 'DeleteExisting',
            'description': 'Deletes any existing Component with matching ID',
            'value': false,
            'valueType': 'boolean',
            'readOnly': false
        }];
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} mainCallback - the result callback
     */
    ProjectImporter.prototype.main = function (mainCallback) {
        var self = this,
            activeNode,
            uploadedFileHash;

        self.config = self.getCurrentConfig();
        self.nameDeferred = Q.defer();
        uploadedFileHash = self.config.UploadedFile;

        // uploadedFileHash = '123fc7afde0166ced3b9c2eb5c7655cc36bc9760';

        self.updateMETA(self.metaTypes);

        activeNode = self.activeNode;


        Q.fcall(function () {
            if (self.activeNode && self.isMetaTypeOf(self.activeNode, self.metaTypes.WorkSpace)) {
                return self.activeNode;
            } else {
                return Q.ninvoke(self.core, 'loadChildren', self.rootNode)
                    .then(function (children) {
                        var workSpaces = children.filter(function (node) {
                            return self.isMetaTypeOf(node, self.metaTypes.WorkSpace);
                        });
                        if (workSpaces.length === 0) {
                            var workspace = self.core.createNode({
                                base: self.metaTypes.WorkSpace,
                                parent: self.rootNode
                            });
                            return workspace;
                        } else {
                            return workSpaces[0];
                        }
                    });
            }
        }).then(function (workSpace) {
            self.workSpace = workSpace;
        }).then(function () {
            return Q.ninvoke(self.blobClient, 'getArtifact', uploadedFileHash);
        }).then(function (artifact) {
            self.artifact = artifact;
        }).then(function () {
            self.acmFolder = self.core.createNode({
                base: self.metaTypes.ACMFolder,
                parent: self.workSpace,
            });
            self.core.setAttribute(self.acmFolder, 'name', 'Components');

            var acmZips = Object.getOwnPropertyNames(self.artifact.descriptor.content)
                .filter(function (filename) {
                    return (filename.lastIndexOf('.zip') === filename.length - 4) &&
                        filename !== 'testbenches.zip';
                });

            return throttle(acmZips, function (acmZip) {
                var config = {
                    UploadedFile: self.artifact.descriptor.content[acmZip].content,
                    DeleteExisting: true
                };

                return self.runPlugin(AcmImporter, config, {activeNode: self.acmFolder});
            });
        }).then(function () {
            self.admFolder = self.core.createNode({
                base: self.metaTypes.ADMFolder,
                parent: self.workSpace
            });
            self.core.setAttribute(self.admFolder, 'name', 'Designs');

            var adms = Object.getOwnPropertyNames(self.artifact.descriptor.content)
                .filter(function (filename) {
                    return (filename.lastIndexOf('.adm') === filename.length - 4);
                });

            return throttle(adms, function (adm) {
                var config = {
                    admFile: self.artifact.descriptor.content[adm].content
                };
                return self.runPlugin(AdmImporter, config, {activeNode: self.admFolder});
            });
        }).then(function () {
            self.atmFolder = self.core.createNode({
                base: self.metaTypes.ATMFolder,
                parent: self.workSpace
            });
            self.core.setAttribute(self.atmFolder, 'name', 'TestBenches');

            var testbenches_zip = Object.getOwnPropertyNames(self.artifact.descriptor.content)
                .filter(function (filename) {
                    return filename === 'testbenches.zip';
                })[0];
            if (!testbenches_zip) {
                return Q.reject('Uploaded files must include testbenches.zip');
            }
            var testbenches_json = Object.getOwnPropertyNames(self.artifact.descriptor.content)
                .filter(function (filename) {
                    return filename === 'testbenches.json';
                })[0];
            if (!testbenches_json) {
                return Q.reject('Uploaded files must include testbenches.json');
            }
            // TODO check for missing testbenches_zip or json
            var designModels;

            return Q.ninvoke(self.core, 'loadChildren', self.admFolder)
                .then(function(designModels_) {
                    designModels = designModels_;
                }).then(function () {
                    return Q.ninvoke(self.blobClient, 'getObject', self.artifact.descriptor.content[testbenches_json].content);
                }).then(function(testBenches) {
                    // {"/Testing/PlaceAndRoute_1x2": "Template_Module_1x2__few_bga_connections"}
                    var tbs = Object.getOwnPropertyNames(testBenches);
                    return throttle(tbs, function (tb) {
                        var tbModel = self.core.createNode({
                            base: self.metaTypes.AVMTestBenchModel,
                            parent: self.atmFolder
                        });
                        self.core.setAttribute(tbModel, 'name', testBenches[tb]);

                        var design = designModels.filter(function (design) {
                            return self.core.getAttribute(design, 'name') === testBenches[tb];
                        })[0]; // TODO check for undefined
                        self.core.setPointer(tbModel, 'TopLevelSystemUnderTest', design);
                        self.core.setAttribute(tbModel, 'TestBenchFiles', self.artifact.descriptor.content[testbenches_zip].content);
                        self.core.setAttribute(tbModel, 'ID', tb);

                        self.core.createNode({
                            base: self.metaTypes.Container,
                            parent: tbModel,
                            name: self.core.getAttribute(design, 'name')
                        });
                        return Q([]);
                    });
                });



        }).then(function () {
            return Q.ninvoke(self, 'save', 'ProjectImporter');
        }).then(function () {
            self.result.setSuccess(true);
            mainCallback(null, self.result);
        }).catch(function (err) {
            self.result.setSuccess(false);
            self.createMessage(self.workSpace, (err.message || err), 'error');
            mainCallback(err, self.result);
        });
    };

    ProjectImporter.prototype.runPlugin = function (pluginClass, config, context) {
        var self = this;

        var pluginContext = new PluginContext();
        pluginContext.activeNode = self.activeNode;
        pluginContext.META = self.META;
        pluginContext.project = self.project;
        pluginContext.projectName = self.project.projectName;
        pluginContext.core = self.core;
        pluginContext.commitHash = self.commitHash;
        pluginContext.activeSelection = []; // selected objects
        pluginContext.rootNode = self.rootNode;

        for (var key in context) {
            if (context.hasOwnProperty(key)) {
                pluginContext[key] = context[key];
            }
        }

        var pluginLogger = LogManager.create('Plugin.' + name);
        var plugin = new pluginClass();
        plugin.save = function (message, callback) {
            callback(null);
        };
        var startTime = (new Date()).toISOString();
        plugin.initialize(pluginLogger, new BlobClient(), self.gmeConfig);

        plugin.setCurrentConfig(config);

        plugin.configure(pluginContext);
        return Q.ninvoke(plugin, 'main')
            .then(function (result) {
                result.setFinishTime((new Date()).toISOString());
                result.setStartTime(startTime);

                if (!result.success) {
                    return Q.reject(result.error || result.messages[0].message);
                }
                return result;
            });
    };

    function throttle(input, fn) {
        var doit = function (i) {
            return fn(input[i])
                .then(function (result) {
                    i++;
                    if (i < input.length) {
                        return doit(i)
                            .then(function (res) {
                                res.push(result);
                                return res;
                            });
                    }
                    return [result];
                });
        };
        if (input.length === 0) {
            return Q([]);
        }
        return doit(0);
    }

    return ProjectImporter;
});
