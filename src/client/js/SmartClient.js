/**
 * Created by Zsolt on 7/3/2014.
 */

define(['js/client',
    'blob/BlobClient',
    'executor/ExecutorClient',
    'core/core',
    'plugin/PluginManagerBase',
    'plugin/PluginResult',
    './DesertFrontEnd'], function (Client, BlobClient, ExecutorClient, Core, PluginManagerBase, PluginResult, DesertFrontEnd) {
    "use strict";

    var SmartClient = function (config) {
        this.config = config || {};

        // get a new client instance
        this.client = new Client(this.config);
        this.blobClient = new BlobClient();
        this.executorClient = new ExecutorClient();

        this.ROOT_ID = '';

        this.metaTerritoryId = null;
        this.metaTerritoryPattern = {};
        this.metaTerritoryPattern[this.ROOT_ID] = {children: 0};
        this.metaNodes = {};
        this.pendingMetaNodes = [];

        this.initialized = false;
        this.initialMessages = [];
        this.uiTerritories = {};

        this.desertFrontEnd = new DesertFrontEnd({client: this.client, meta: this.metaNodes});

        this._savedConfigs = {};
    };

    SmartClient.prototype.openProject = function (projectName, branchName, projectJSON, callback, stopOnFailure) {
        var self = this,
            defaultBranch;

        console.assert(typeof projectName === 'string', 'ProjectName must be a string.');
        console.assert(projectName.length > 0, 'ProjectName must have at least one character.');

        console.assert(typeof callback === 'function', 'Callback has to be a function.');

        if (this.metaTerritoryId) {
            this.client.removeUI(this.metaTerritoryId);
        }

        this.metaTerritoryId = null;
        this.metaTerritoryPattern = {};
        this.metaTerritoryPattern[''] = {children: 0};
        this.metaNodes = {};
        this.pendingMetaNodes = [];

        this.initialized = false;

        this.uiTerritories = {};

        // parameters
        defaultBranch = branchName || 'master';
        stopOnFailure = stopOnFailure || false;

        // connect to the database, open the project, load a branch

        self.client.connectToDatabaseAsync(null, function (err) {
            if (err) {
                callback(err);
                return;
            }

            self.client.getFullProjectListAsync(function (err, projectList) {
                if (err) {
                    callback(err);
                    return;
                }

                console.log(projectList);

                if (projectList.hasOwnProperty(projectName)) {
                    console.info(projectName + ' project already exists.');
                    self.initialMessages.push({message: projectName + ' project exists.', severity: 'debug'});
                    self.client.selectProjectAsync(projectName, function (err) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        self.client.selectBranchAsync(defaultBranch, function (err) {
                            if (err) {
                                callback(err);
                                return;
                            }

                            self.initializeMETA(callback);
                        });
                    })
                } else {

                    if (stopOnFailure) {
                        callback(projectName + ' project does not exist or failed to be imported.');
                        return;
                    }

                    if (projectJSON) {
                        self.client.createProjectFromFileAsync(projectName, JSON.parse(projectJSON), function (err) {
                            if (err) {
                                console.error(projectName + ' project import failed.');
                                self.initialMessages.push({message: projectName + ' project import failed.',
                                    severity: 'error'});
                                callback(err);
                                return;
                            }

                            console.info(projectName + ' project was imported.');
                            self.initialMessages.push({message: projectName + ' project was imported.', severity: 'info'});
                            self.openProject(projectName, branchName, projectJSON, callback, true);
                        });
                    } else {
                        console.info(projectName + ' project template was not defined. Creating an empty project.');
                        self.initialMessages.push({message: projectName + ' project template was not defined. Creating an empty project.',
                            severity: 'warning'});
                        self.client.createProject(projectName, function (err) {
                            if (err) {
                                callback(err);
                                return;
                            }

                            console.info(projectName + ' empty project was created.');
                            self.openProject(projectName, branchName, null, callback, true);
                        });
                    }
                }
            });
        });
    };

    SmartClient.prototype.initializeMETA = function (callback) {
        var self = this,
            i,
            event,
            nodeObj,
            metaObjectIds,
            len,
            patternUpdated,
            metaNode,
            pendingMetaNodeIdx;

        console.assert(typeof callback === 'function', 'Callback has to be a function.');

        this.metaTerritoryId = this.client.addUI(this, function (events) {

            for (i = 0; i < events.length; i += 1) {
                event = events[i];

                nodeObj = self.client.getNode(event.eid);

                if (event.eid === self.ROOT_ID) {
                    if (event.etype === 'unload') {
                        self.metaNodes = {};
                    } else if (event.etype === 'load' || event.etype === 'update') {

                        // get all meta types
                        metaObjectIds = nodeObj.getMemberIds('MetaAspectSet');

                        len = metaObjectIds.length;

                        console.log('Updating META member list ...');
                        patternUpdated = false;
                        while (len--) {
                            metaNode = self.client.getNode(metaObjectIds[len]);

                            if (metaNode) {
                                // assume meta has unique names
                                self.metaNodes[metaNode.getAttribute('name')] = metaNode;
                            } else {
                                self.pendingMetaNodes.push(metaObjectIds[len]);
                                self.metaTerritoryPattern[metaObjectIds[len]] = {children: 0};
                                patternUpdated = true;
                            }
                        }

                        if (patternUpdated) {
                            self.client.updateTerritory(self.metaTerritoryId, self.metaTerritoryPattern);
                        }

                    } else {
                        throw 'Unrecognized event type: ' + event.etype;
                    }
                }

                pendingMetaNodeIdx = self.pendingMetaNodes.indexOf(event.eid);
                if (pendingMetaNodeIdx > -1) {
                    self.pendingMetaNodes.splice(pendingMetaNodeIdx, 1);
                    self.metaNodes[nodeObj.getAttribute('name')] = nodeObj;
                }
            }

            if (self.initialized === false && self.pendingMetaNodes.length === 0) {
                self.initialized = true;

                console.log(self.metaNodes);
                console.log('META member list initialization done.');

                // initialize is ready
                callback(null);
            }
        });

        this.client.updateTerritory(this.metaTerritoryId, this.metaTerritoryPattern);
    };

    SmartClient.prototype.isMetaTypeOf = function (node, metaNode) {
        var self = this,
            idWasGiven = false,
            metaNodeName;

        console.assert(typeof node === 'string' || typeof node === 'object', 'Node has to be an id (path) [string] or a node object [object].');
        console.assert(typeof metaNode === 'string' || typeof metaNode === 'object', 'Node has to be an id (path) or meta type name [string] or a node object [object].');

        if (typeof node === 'string') {
            node = self.client.getNode(node);
            idWasGiven = true;
        }

        if (typeof metaNode === 'string') {
            if (metaNode.charAt(0) === '/') {
                // treat it as a path
                metaNode = self.client.getNode(metaNode);
            } else {
                // treat it as a meta type name
                metaNodeName = metaNode;
                metaNode = self.metaNodes[metaNodeName];
                if (metaNode) {
                    // type was resolved - ok
                } else {
                    console.error('Meta type cannot not be resolved: ' + metaNodeName);
                    return false;
                }
            }

            idWasGiven = true;
        }

        if (idWasGiven) {
            return self.isMetaTypeOf(node, metaNode);
        }

        while (node) {
            if (node.getId() === metaNode.getId()) {
                return true;
            }
            node = self.client.getNode(node.getBaseId());
        }
        return false;
    };

    SmartClient.prototype.addUI = function (nodeId, types, callback) {
        var self = this,
            pattern,
            terrId;

        pattern = {children: 1};

        terrId = self.client.addUI(null, function (events) {
            var updateTerr = false,
                i,
                event,
                node,
                len;

            callback(events);

            for (i = 0; i < events.length; i += 1) {
                event = events[i];
                node = self.client.getNode(event.eid);

                if (event.etype === 'load') {
                    len = types.length;
                    while (len--) {
                        if (self.isMetaTypeOf(node, types[len])) {
                            self.uiTerritories[terrId][node.getId()] = {children: 1};
                            updateTerr = true;
                        }
                    }
                } else if (event.etype === 'unload') {
                    if (self.uiTerritories[terrId].hasOwnProperty(event.eid)) {
                        delete self.uiTerritories[terrId][event.eid];
                    }
                }
            }

            if (updateTerr) {
                self.client.updateTerritory(terrId, self.uiTerritories[terrId]);
            }
        });

        self.uiTerritories[terrId] = {};
        self.uiTerritories[terrId][nodeId] = pattern;

        self.client.updateTerritory(terrId, self.uiTerritories[terrId]);

        return terrId;
    };


    SmartClient.prototype.removeUI = function (guid) {
        this.client.removeUI(guid);
    };


    SmartClient.prototype.getPlugin = function (name, callback) {
        requirejs(['/plugin/' + name + '/' + name + '/' + name],
            function (InterpreterClass) {
                callback(null, InterpreterClass);
            },
            function (err) {
                callback(err, null);
            });
    };

    SmartClient.prototype.runPlugin = function (name, runPluginConfig, callback) {
        var self = this;

        console.info('Run plugin: ' + name + ' ' + JSON.stringify(runPluginConfig, null, 4));

        self.getPlugin(name, function (err, plugin) {
            if (!err && plugin) {
                var plugins = {};
                plugins[name] = plugin;
                var pluginManager = new PluginManagerBase(self.client.getProjectObject(), Core, plugins);
                pluginManager.initialize(null, function (pluginConfigs, configSaveCallback) {
                    //#1: display config to user
                    var hackedConfig = {
                        'Global Options': [
                            {
                                "name": "runOnServer",
                                "displayName": "Execute on Server",
                                "description": '',
                                "value": false, // this is the 'default config'
                                "valueType": "boolean",
                                "readOnly": false
                            }
                        ]
                    };

                    for (var i in pluginConfigs) {
                        if (pluginConfigs.hasOwnProperty(i)) {
                            hackedConfig[i] = pluginConfigs[i];

                            // retrieve user settings from previous run
                            if (self._savedConfigs.hasOwnProperty(i)) {
                                var iConfig = self._savedConfigs[i];
                                var len = hackedConfig[i].length;

                                while (len--) {
                                    if (iConfig.hasOwnProperty(hackedConfig[i][len].name)) {
                                        hackedConfig[i][len].value = iConfig[hackedConfig[i][len].name];
                                    }
                                }

                            }
                        }
                    }

                    // update with config

                    var updatedConfig = {};
                    for (var i in hackedConfig) {
                        updatedConfig[i] = {};
                        var len = hackedConfig[i].length;
                        while (len--) {
                            updatedConfig[i][hackedConfig[i][len].name] = hackedConfig[i][len].value;
                        }

                        if (runPluginConfig && runPluginConfig.pluginConfig) {
                            for (var j in runPluginConfig.pluginConfig) {
                                updatedConfig[i][j] = runPluginConfig.pluginConfig[j];
                            }
                        }
                    }

                    var activeNode = null;
                    var activeSelection = [];

                    if (WebGMEGlobal && WebGMEGlobal.State) {
                        activeNode = WebGMEGlobal.State.getActiveObject() || activeNode;
                        activeSelection = WebGMEGlobal.State.getActiveSelection() || activeSelection;
                    }

                    if (runPluginConfig) {
                        if (runPluginConfig.activeNode) {
                            activeNode = runPluginConfig.activeNode;
                        }

                        if (runPluginConfig.activeSelection) {
                            activeSelection = runPluginConfig.activeSelection;
                        }
                    }

                    //when Save&Run is clicked in the dialog
                    var globalconfig = updatedConfig['Global Options'];
                    delete updatedConfig['Global Options'];

                    // save config from user
                    for (var i in updatedConfig) {
                        self._savedConfigs[i] = updatedConfig[i];
                    }

                    //#2: save it back and run the plugin
                    if (configSaveCallback) {
                        configSaveCallback(updatedConfig);

                        // TODO: if global config says try to merge branch then we should pass the name of the branch
                        var config = {
                            "project": self.client.getActiveProjectName(),
                            "token": "",
                            "activeNode": activeNode, // active object in the editor
                            "activeSelection": activeSelection, // selected objects
                            "commit": self.client.getActualCommit(), //"#668b3babcdf2ddcd7ba38b51acb62d63da859d90",
                            "branchName": self.client.getActualBranch() // this has priority over the commit if not null
                        };

                        if (globalconfig.runOnServer === true) {
                            var context = {
                                managerConfig: config,
                                pluginConfigs: updatedConfig
                            };
                            self.client.runServerPlugin(name, context, function (err, result) {
                                if (err) {
                                    console.error(err);
                                    callback(new PluginResult()); //TODO return proper error result
                                } else {
                                    var resultObject = new PluginResult(result);
                                    callback(resultObject);
                                }
                            });
                        } else {
                            config.blobClient = new BlobClient();

                            pluginManager.executePlugin(name, config, function (err, result) {
                                if (err) {
                                    console.error(err);
                                }
                                callback(result);
                            });
                        }
                    }

                });
            } else {
                console.error(err);
                console.error('unable to load plugin');
                callback(null); //TODO proper result
            }
        });
    };

    return SmartClient;
});