/**
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * Author: Patrik Meijer
 */

define(['plugin/PluginConfig', 'plugin/PluginBase', 'ejs', 'plugin/MockModelGenerator/MockModelGenerator/Templates/Templates'], function (PluginConfig, PluginBase, ejs, TEMPLATES) {
    'use strict';

    /**
    * Initializes a new instance of MockModelGenerator.
    * @class
    * @augments {PluginBase}
    * @classdesc This class represents the plugin MockModelGenerator.
    * @constructor
    */
    var MockModelGenerator = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.modelNodes = [];
        this.metaNodes = [];
        this.basePairs = {};
        this.pointers = [];
        this.activeNodeData = {};
    };

    // Prototypal inheritance from PluginBase.
    MockModelGenerator.prototype = Object.create(PluginBase.prototype);
    MockModelGenerator.prototype.constructor = MockModelGenerator;

    /**
    * Gets the name of the MockModelGenerator.
    * @returns {string} The name of the plugin.
    * @public
    */
    MockModelGenerator.prototype.getName = function () {
        return "Mock Model Generator";
    };

    /**
    * Gets the semantic version (semver.org) of the MockModelGenerator.
    * @returns {string} The version of the plugin.
    * @public
    */
    MockModelGenerator.prototype.getVersion = function () {
        return "0.1.0";
    };

    /**
    * Gets the description of the MockModelGenerator.
    * @returns {string} The description of the plugin.
    * @public
    */
    MockModelGenerator.prototype.getDescription = function () {
        return "Generates CoreMock-code that will be instantiated to mock the model starting from the activeNode.  ";
    };

    /**
    * Gets the configuration structure for the MockModelGenerator.
    * The ConfigurationStructure defines the configuration for the plugin
    * and will be used to populate the GUI when invoking the plugin from webGME.
    * @returns {object} The version of the plugin.
    * @public
    */
    MockModelGenerator.prototype.getConfigStructure = function () {
        return [
            {
                'name': 'modelName',
                'displayName': 'Model Name',
                'regex': '^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[a-zA-Z_$][0-9a-zA-Z_$]*',
                'regexMessage': 'No spaces nor special characters allowed. This value is used as a js-file name.',
                'description': 'File name (w/o extension) for the model.',
                'value': 'examplemodel',
                'valueType': "string",
                'readOnly': false
            },
            {
                'name': 'meta',
                'displayName': 'Include META',
                'description': 'Regenerate the META mock model.',
                'value': true,
                'valueType': 'boolean',
                'readOnly': false
            },
            {
                'name': 'timeOut',
                'displayName': 'Time out [ms]',
                'description': 'Time out time for asynchronous core methods.',
                'value': 1,
                "minValue": 1,
                "maxValue": 100,
                'valueType': 'number',
                'readOnly': false
            }
        ];
    };


    /**
    * Main function for the plugin to execute. This will perform the execution.
    * Notes:
    * - Always log with the provided logger.[error,warning,info,debug].
    * - Do NOT put any user interaction logic UI, etc. inside this method.
    * - callback always has to be called even if error happened.
    *
    * @param {function(string, plugin.PluginResult)} callback - the result callback
    */
    MockModelGenerator.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            config = self.getCurrentConfig(),
            modelData = {},
            generateFiles,
            date = new Date();

        if (!self.activeNode) {
            callback('No activeNode given', self.result);
            return;
        }
        // ADMMoldelCool : "/1667744534/1064479209/181258295"
        modelData.date = date;
        modelData.timeOut = config.timeOut;

        generateFiles = function () {
            var modelFileName = 'test/models/' + self.projectName + '/' + config.modelName + '.js',
                metaFileName = 'test/models/' + self.projectName + '/META.js',
                metaData = {},
                artifact = self.blobClient.createArtifact('mockModel'),
                files = {};

            files[modelFileName] = ejs.render(TEMPLATES['model.js.ejs'], modelData);
            if (config.meta) {
                metaData.date = date;
                self.populateMetaNodes();
                metaData.metaNodes = self.metaNodes;
                files[metaFileName] = ejs.render(TEMPLATES['meta.js.ejs'], metaData);
            }
            artifact.addFiles(files, function (err, hashes) {
                if (err) {
                    callback(err, self.result);
                    return;
                }
                self.logger.warning(hashes.toString());
                artifact.save(function (err, hash) {
                    if (err) {
                        callback(err, self.result);
                        return;
                    }
                    self.result.addArtifact(hash);
                    self.result.setSuccess(true);
                    callback(null, self.result);
                });
            });
        };

        self.visitAllChildren(self.activeNode, function (err) {
            if (err) {
                callback('failed to get modelNodes' + err, self.result);
                return;
            }
            modelData.modelNodes = self.modelNodes;
            self.atModelNode(self.activeNode, null, function (err) {
                if (err) {
                    callback('failed to get modelNode for activeNode' + err, self.result);
                    return;
                }
                modelData.activeNode = self.activeNodeData;
                modelData.basePairs = self.basePairs;
                modelData.pointers = self.pointers;
                generateFiles();
            });

        });
    };

    MockModelGenerator.prototype.atModelNode = function (node, parent, callback) {
        var self = this, i,
            metaTypeName = self.core.getAttribute(self.getMetaType(node), 'name'),
            attributeNames = self.core.getAttributeNames(node),
            pointerNames = self.core.getPointerNames(node),
            counter = pointerNames.length,
            error = '',
            pointerData,
            pointerDataType = {
                owner: '',
                name: '',
                pointsTo: null
            },
            nodeData = {
                attr: {},
                reg: {},
                ID: self.getUniqueID(node),
                parentID: null,
                metaType: metaTypeName,
                base: null,
                baseIsMeta: false
            },
            counterCallback = function (err) {
                counter -= 1;
                error = err ? error += err : error;
                if (counter <= 0) {
                    // This is just so this function can be reused for the active node.
                    if (parent) {
                        nodeData.parentID = self.getUniqueID(parent);
                        self.modelNodes.push(nodeData);
                    } else {
                        self.activeNodeData = nodeData;
                    }
                    callback(error);
                }
            },
            pointerCallback;
        // ----- BaseNode -------
        if (self.baseIsMeta(node)) {
            nodeData.base = metaTypeName;
            nodeData.baseIsMeta = true;
        } else {
            nodeData.base = self.getUniqueID(self.core.getBase(node));
            nodeData.baseIsMeta = false;
            self.basePairs[nodeData.ID] = nodeData.base;
        }
        // ----- Attributes -----
        for (i = 0; i < attributeNames.length; i += 1) {
            nodeData.attr[attributeNames[i]] = self.core.getAttribute(node, attributeNames[i]);
        }
        // ----- Pointers -------
        if (pointerNames.length === 0) {
            counterCallback(null);
        }

        pointerCallback = function (pointerName) {
            return function (err, pointsTo) {
                if (err) {
                    counterCallback(err);
                    return;
                }
                pointerData = Object.create(pointerDataType);
                pointerData.owner = nodeData.ID;
                pointerData.name = pointerName;
                if (pointsTo) {
                    pointerData.pointsTo = self.getUniqueID(pointsTo);
                } else {
                    self.logger.warning(nodeData.attr.name + "'s pointer '" + pointerName + "' is a null pointer.");
                }
                self.pointers.push(pointerData);
                counterCallback(null);
            };
        };

        for (i = 0; i < pointerNames.length; i += 1) {
            if (pointerNames[i] === 'base') {
                counterCallback(null);
            } else {
                self.core.loadPointer(node, pointerNames[i], pointerCallback(pointerNames[i]));
            }
        }
    };

    MockModelGenerator.prototype.getUniqueID = function (node) {
        var self = this,
            guid = self.core.getGuid(node);

        return 'ID__' + guid.replace(/-/gi, '_');
    };

    MockModelGenerator.prototype.populateMetaNodes = function () {
        var self = this,
            i,
            base,
            names = Object.keys(self.META),
            orderedMetaNodes = {},
            nbrOfBases = 0,
            nodeData,
            nodeDataType = {
                name: null,
                base: null
            };
        // Iterate over all meta-nodes and put their data in orderedMetaNodes
        // based on their number of bases.
        for (i = 0; i < names.length; i += 1) {
            nodeData = Object.create(nodeDataType);
            nodeData.name = names[i];
            base = self.core.getBase(self.META[names[i]]); // What happens for FCO?
            nbrOfBases = 0;
            if (base) {
                nodeData.base = self.core.getAttribute(base, 'name');
                while (base) {
                    nbrOfBases += 1;
                    base = self.core.getBase(base);
                }
            }
            if (orderedMetaNodes[nbrOfBases]) {
                orderedMetaNodes[nbrOfBases].push(nodeData);
            } else {
                orderedMetaNodes[nbrOfBases] = [nodeData];
            }
        }
        // When we have all data for the nodes move it over, sorted, to an array.
        self.populateMetaNodesOrdered(orderedMetaNodes);
    };

    /**
     * Populates self.metaNodes with meta-node data ordered first based on number of bases,
     * and secondly on the names.
     * @param metaNodes - dictionary with #bases as keys and arrays of nodeData as values.
     */
    MockModelGenerator.prototype.populateMetaNodesOrdered = function (metaNodes) {
        var self = this,
            subArray,
            keys = Object.keys(metaNodes),
            i,
            compare = function (a, b) {
                return a.name.localeCompare(b.name);
            };

        keys.sort();
        for (i = 0; i < keys.length; i += 1) {
            subArray = metaNodes[keys[i]];
            subArray.sort(compare);
            self.metaNodes = self.metaNodes.concat(subArray);
        }
    };

    MockModelGenerator.prototype.visitAllChildren = function (node, callback) {
        var self = this;
        self.core.loadChildren(node, function (err, children) {
            var i,
                error = '',
                counter,
                counterCallback,
                atModelNodeCallback;
            if (err) {
                callback('Could not load children for first object, err: ' + err);
                return;
            }
            if (children.length === 0) {
                callback(null);
                return;
            }
            counter = {visits: children.length};
            counterCallback = function (err) {
                error = err ? error += err : error;
                counter.visits -= 1;
                if (counter.visits === 0) {
                    callback(error);
                }
            };

            atModelNodeCallback = function (childNode) {
                return function (err) {
                    self.visitAllChildrenRec(childNode, counter, counterCallback);
                };
            };
            for (i = 0; i < children.length; i += 1) {
                self.atModelNode(children[i], node, atModelNodeCallback(children[i]));
            }
        });
    };

    MockModelGenerator.prototype.visitAllChildrenRec = function (node, counter, callback) {
        var self = this;
        self.core.loadChildren(node, function (err, children) {
            var i,
                atModelNodeCallback;
            if (err) {
                callback('loadChildren failed for ' + self.core.getAttribute(node, 'name'));
                return;
            }
            counter.visits += children.length;
            if (children.length === 0) {
                callback(null);
            } else {
                counter.visits -= 1;
                atModelNodeCallback = function (childNode) {
                    return function (err) {
                        self.visitAllChildrenRec(childNode, counter, callback);
                    };
                };
                for (i = 0; i < children.length; i += 1) {
                    self.atModelNode(children[i], node, atModelNodeCallback(children[i]));
                }
            }
        });
    };

    /**
    * Checks if the given node is of the given meta-type.
    * Usage: <tt>self.isMetaTypeOf(aNode, self.META['FCO']);</tt>
    * @param node - Node to be checked for type.
    * @param metaNode - Node object defining the meta type.
    * @returns {boolean} - True if the given object was of the META type.
    */
    MockModelGenerator.prototype.isMetaTypeOf = function (node, metaNode) {
        var self = this,
            metaGuid = self.core.getGuid(metaNode);
        while (node) {
            if (self.core.getGuid(node) === metaGuid) {
                return true;
            }
            node = self.core.getBase(node);
        }
        return false;
    };

    /**
    * Finds and returns the node object defining the meta type for the given node.
    * @param node - Node to be checked for type.
    * @returns {Object} - Node object defining the meta type of node.
    */
    MockModelGenerator.prototype.getMetaType = function (node) {
        var self = this,
            name;
        while (node) {
            name = self.core.getAttribute(node, 'name');
            if (self.META.hasOwnProperty(name) && self.core.getPath(self.META[name]) === self.core.getPath(node)) {
                break;
            }
            node = self.core.getBase(node);
        }
        return node;
    };

    /**
    * Returns true if node is a direct instance of a meta-type node (or a meta-type node itself).
    * @param node - Node to be checked.
    * @returns {boolean}
    */
    MockModelGenerator.prototype.baseIsMeta = function (node) {
        var self = this,
            baseName,
            baseNode = self.core.getBase(node);
        if (!baseNode) {
            // FCO does not have a base node, by definition function returns true.
            return true;
        }
        baseName = self.core.getAttribute(baseNode, 'name');
        return self.META.hasOwnProperty(baseName) && self.core.getPath(self.META[baseName]) === self.core.getPath(baseNode);
    };

    return MockModelGenerator;
});