/*globals define, console, window*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

define(['../../js/DesertFrontEnd',
        'xmljsonconverter'], function (DesertFrontEnd, Converter) {
    'use strict';

    var DesignSpaceController = function ($scope, $rootScope, $moment, $routeParams, $location, smartClient, Chance, growl) {
        var self = this;

        self.$scope = $scope;
        self.$moment = $moment;
        self.$routeParams = $routeParams;
        self.$rootScope = $rootScope;
        self.$location = $location;
        self.smartClient = smartClient;
        self.desertFrontEnd = new DesertFrontEnd(smartClient);
        self.growl = growl;

        self.xmlToJson = new Converter.Xml2json({
            skipWSText: true,
            arrayElements: {
                Configuration: true,
                Element: true,
                AlternativeAssignment: true
            }
        });

        self.chance = Chance ? new Chance() : null;
        self.territories = {};
        self.initialize();
    };

    DesignSpaceController.prototype.update = function () {
        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
    };

    DesignSpaceController.prototype.initialize = function () {
        var self = this;

        // scope model
        self.$scope.id = self.$routeParams.id;
        self.$scope.name = '';
        self.$scope.description = '';
        self.$scope.readMe = null;
        self.$scope.lastUpdated = null;
        self.$scope.containers = {};
        self.$scope.components = {};
        self.$scope.rootNode = [];
        self.$scope.desertInfo = {};
        self.$scope.hideCompoundComponents = false;
        self.$scope.desert = { cfgs:  {}, selectedCfg: null };
        self.$scope.$on('$destroy', function () {
            var key;
            for (key in self.territories) {
                if (self.territories.hasOwnProperty(key)) {
                    self.smartClient.removeUI(self.territories.territoryId);
                    console.log('Removed Territory ', self.territories.territoryId);
                }
            }
        });
        // initialization of methods
        if (self.smartClient) {
            // if smartClient exists
            self.initWithSmartClient();
        } else {
            console.warn('Data is not linked to the WebGME database.');
            self.initTestData();
        }
    };

    DesignSpaceController.prototype.initTestData = function () {
        var self = this,
            i,
            nbrOfContainers = 10;

        self.$scope.name = self.chance.word();
        self.$scope.description = self.chance.sentence();
        self.$scope.lastUpdated = {
            time: self.chance.date(),
            user: self.chance.name(),
            hash: self.chance.hash(),
            message: 'something happened'
        };
        for (i = 0; i < nbrOfContainers; i += 1) {
            self.addContainer('/' + i.toString());
        }
    };

    DesignSpaceController.prototype.getRandomId = function () {
        var len = Math.floor((Math.random() * 2) + 3),
            i,
            id = '';
        for (i = 0; i < len; i += 1) {
            id += '/' + Math.floor((Math.random() * 10000) + 1).toString();
        }
        return id;
    };

    DesignSpaceController.prototype.initWithSmartClient = function () {
        var self = this,
            territoryPattern = {},
            territoryId;

        territoryPattern[self.$scope.id] = {children: 999};

        self.$rootScope.appIsLoading = true;
        self.update();
        territoryId = self.smartClient.client.addUI(null, function (events) {
            var i,
                event,
                unloadOccurred = false,
                nodeObj;
            self.territories[self.$scope.id].hasLoaded = true;
            self.$rootScope.appIsLoading = true;
            self.update();
            for (i = 0; i < events.length; i += 1) {
                event = events[i];
                nodeObj = self.smartClient.client.getNode(event.eid);
                if (event.etype === 'unload') {
                    if (event.eid === self.$scope.id) {
                        self.growl.warning(self.$scope.name + ' was deleted.');
                        self.$location.path('/workspace');
                    } else if (self.removeContainer(event.eid)) {
                        // Container was removed
                        unloadOccurred = true;
                    }
                } else if (event.eid === self.$scope.id) {
                    if (event.etype === 'load') {
                        self.$scope.name = nodeObj.getAttribute('name');
                        self.$scope.description = nodeObj.getAttribute('INFO');
                        self.$scope.mainNavigator.items = self.getNavigatorStructure(nodeObj);
                        self.$scope.mainNavigator.separator = true;
                        self.addContainer(event.eid);
                        self.$scope.rootNode = [self.$scope.containers[self.$scope.id]];
                        self.desertFrontEnd.addSimpleListener(self.$scope.id, function (status) {
                            self.$scope.desertInfo = status;
                            //self.growl.info(JSON.stringify(status, null, 2));
                            self.update();
                            if (status.backFile) {
                                self.getDesertDesertBackSystem(status.backFile.content, function (err, desertBackSystem) {
                                    var j,
                                        k,
                                        cfg,
                                        elem,
                                        altAss,
                                        elemIdToPath = {};
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                    for (j = 0; j < desertBackSystem.Element.length; j += 1) {
                                        elem = desertBackSystem.Element[j];
                                        elemIdToPath[elem['@_id']] = status.idMap[elem['@externalID']];
                                    }
                                    for (j = 0; j < desertBackSystem.Configuration.length; j += 1) {
                                        cfg = desertBackSystem.Configuration[j];
                                        self.$scope.desert.cfgs[cfg['@id']] = {
                                            name: cfg['@name'],
                                            id: cfg['@id'],
                                            isSelected: false,
                                            alternativeAssignments: {}
                                        };
                                        for (k = 0; k < cfg.AlternativeAssignment.length; k += 1) {
                                            altAss = cfg.AlternativeAssignment[k];
                                            self.$scope.desert.cfgs[cfg['@id']].alternativeAssignments[elemIdToPath[altAss['@alternative_end_']]] = {
                                                selectedAlternative: elemIdToPath[altAss['@alternative_end_']],
                                                alternativeOf: elemIdToPath[altAss['@alternative_of_end_']]
                                            };
                                        }
                                    }
                                    self.$scope.desert.selectedCfg = self.$scope.desert.cfgs['1'];
                                    self.update();
                                });
                            }
                        });
                    } else if (event.etype === 'update') {
                        console.warn('Update not handled for root-container!');
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'Container')) {
                    if (event.etype === 'load') {
                        self.addContainer(event.eid);
                    } else if (event.etype === 'update') {
                        console.log('container ' + self.$scope.containers[event.eid].name + ' updated.');
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'AVMComponentModel')) {
                    if (event.etype === 'load') {
                        self.addComponent(event.eid);
                    } else if (event.etype === 'update') {
                        console.log('component ' + self.$scope.components[event.eid].name + ' updated.');
                    }
                }
            }
            if (unloadOccurred) {
                self.growl.info('Containers or Components are being deleted from the design-space.');
            }
            self.$rootScope.appIsLoading = false;
            self.update();
        });

        self.territories[self.$scope.id] = { nodeId: self.$scope.id, territoryId: territoryId, hasLoaded: false };
        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    // Designs
    DesignSpaceController.prototype.addContainer = function (id) {
        var self = this,
            random,
            container,
            nodeObj,
            parentId;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);
            parentId = nodeObj.getParentId();
            container = {
                id: id,
                parentId: parentId,
                name: nodeObj.getAttribute('name'),
                description: nodeObj.getAttribute('INFO'),
                date: new Date(),
                type: nodeObj.getAttribute('Type'),
                containers: {},
                components: {},
                enabled: true
            };
            if (self.$scope.containers[parentId]) {
                self.$scope.containers[parentId].containers[id] = container;
            }
        } else {
            container = {
                id: id,
                name: self.chance.word(),
                description: self.chance.sentence(),
                date: self.chance.date(),
                type: null
            };
            random = self.chance.integer({min: 0, max: 10});
            if (random > 5) {
                container.type = 'Alternative';
            } else if (random > 3) {
                container.type = 'Optional';
            } else {
                container.type = 'Compound';
            }
        }

        if (container) {
            self.$scope.containers[id] = container;
            //this.update();
        }
    };

    DesignSpaceController.prototype.removeContainer = function (id) {
        var self = this,
            currContainer,
            parentContainer;
        currContainer = self.$scope.containers[id];
        if (currContainer) {
            parentContainer = self.$scope.containers[currContainer.parentId];
            if (parentContainer) {
                if (parentContainer.containers[id]) {
                    delete parentContainer.containers[id];
                }
            }
            delete self.$scope.containers[id];
            return true;
        }
        return false;
    };

    DesignSpaceController.prototype.addComponent = function (id) {
        var self = this,
            nodeObj,
            component,
            parentId;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);
            parentId = nodeObj.getParentId();
            component = {
                id: id,
                parentId: parentId,
                name: nodeObj.getAttribute('name'),
                description: nodeObj.getAttribute('INFO'),
                avmId: nodeObj.getAttribute('ID'),
                date: new Date(),
                enabled: true
            };
            if (self.$scope.containers[parentId]) {
                self.$scope.containers[parentId].components[id] = component;
            }
        } else {
            component = {
                id: id,
                name: self.chance.word(),
                description: self.chance.sentence(),
                date: self.chance.date(),
                avmId: self.chance.guid
            };
        }

        if (component) {
            self.$scope.components[id] = component;
        }
    };

    DesignSpaceController.prototype.getDesertDesertBackSystem = function (hash, callback) {
        var self = this;

        self.smartClient.blobClient.getObject(hash, function (err, content) {
            var desertObject;
            if (err) {
                callback('Could not get content for desert output XML, err: ' + err);
                return;
            }
            desertObject = self.xmlToJson.convertFromBuffer(content);
            //console.info(JSON.stringify(desertObject, null, 2));
            if (desertObject instanceof Error) {
                callback('Output desert XML not valid xml, err: ' + desertObject.message);
                return;
            }
            callback(null, desertObject.DesertBackSystem);
        });
    };

    DesignSpaceController.prototype.saveConfigurationSet = function (name) {
        var self = this,
            key,
            aaKey,
            cfgSetPath,
            cfgPath,
            aa,
            cfgCnt = 0,
            cfg;

        // Create the configuration set node.
        cfgSetPath = self.smartClient.client.createChild({
            parentId: self.$scope.id,
            baseId: self.smartClient.metaNodes.DesertConfigurationSet.getId()
        });
        if (name) {
            self.smartClient.client.setAttributes(cfgSetPath, 'name', name, '[WebCyPhy] - DesertCfg was named: ' + name);
        }

        self.growl.info('Created new DesertConfigurationSet in model. Adding configurations..');
        // Go through cfgs and for the selected ones add new configuration nodes.
        for (key in self.$scope.desert.cfgs) {
            if (self.$scope.desert.cfgs.hasOwnProperty(key)) {
                cfg = self.$scope.desert.cfgs[key];
                if (cfg.isSelected) {
                    cfgCnt += 1;
                    cfgPath = self.smartClient.client.createChild({
                        parentId: cfgSetPath,
                        baseId: self.smartClient.metaNodes.DesertConfiguration.getId()
                    });
                    aa = [];
                    for (aaKey in cfg.alternativeAssignments) {
                        if (cfg.alternativeAssignments.hasOwnProperty(aaKey)) {
                            aa.push(cfg.alternativeAssignments[aaKey]);
                        }
                    }
                    self.smartClient.client.setAttributes(cfgPath, 'name', cfg.name,
                            '[WebCyPhy] - DesertCfg was named: ' + cfg.name);
                    self.smartClient.client.setAttributes(cfgPath, 'AlternativeAssignments', JSON.stringify(aa, null),
                            '[WebCyPhy] - DesertCfg got AlternativeAssignments');
                }
            }
        }
        if (cfgCnt > 0) {
            self.growl.success('Created new DesertConfigurations in model.');
        } else {
            self.growl.warning('There were no selected configurations.');
        }
    };

    DesignSpaceController.prototype.loadConfigurationSet = function () {
        var self = this;
        self.growl.warning('Will open configuration window!');
    };

    DesignSpaceController.prototype.getNavigatorStructure = function (node) {
        var self = this,
            firstMenu,
            parentNode,
            secondMenu,
            thirdMenu;

        parentNode = self.smartClient.client.getNode(node.getParentId());
        while (parentNode && self.smartClient.isMetaTypeOf(parentNode, 'WorkSpace') === false) {
            parentNode = self.smartClient.client.getNode(parentNode.getParentId());
        }
        if (!parentNode) {
            console.error('No workspace for design!!');
            return {};
        }
        self.menuItemSave = {

        };
        firstMenu = {
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root',
            action: function () {
                window.location.href = '#/workspace';
            },
            actionData: {},
            menu: []
        };

        secondMenu = {
            id: 'workspace',
            label: parentNode.getAttribute('name'),
            itemClass: 'workspace',
            action: function () {
                window.location.href = '#/workspaceDetails/' + parentNode.getId();
            },
            actionData: {},
            menu: []
        };

        thirdMenu = {
            id: 'designSpace',
            label: self.$scope.name,
            itemClass: 'designSpace',
            menu: [{
                id: 'top',
                items: [
                    {
                        id: 'hide',
                        label: 'Show/Hide Compound Components',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-filter',
                        action: function () {
                            self.$scope.hideCompoundComponents = !self.$scope.hideCompoundComponents;
                        },
                        actionData: {}
                    },
                    {
                        id: 'desert',
                        label: 'Calculate Design Space',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-th',
                        action: function () {
                            self.desertFrontEnd.calculateNbrOfCfgs(self.$scope.id);
                        },
                        actionData: {}
                    },
                    {
                        id: 'saveCfgs',
                        label: 'Save Configurations',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-floppy-save',
                        action: function () {
                            if (!self.$scope.desert) {
                                self.growl.error('Nothing to save.');
                                return;
                            }
                            if (Object.keys(self.$scope.desert.cfgs).length === 0) {
                                self.growl.error('No configurations to save. Did you calculate the design space?');
                                return;
                            }
                            self.saveConfigurationSet();
                        },
                        actionData: {}
                    },
                    {
                        id: 'loadCfgs',
                        label: 'Load Configurations',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-floppy-open',
                        action: function () {
                            self.loadConfigurationSet();
                        },
                        actionData: {}
                    }
                ]
            }, {
                id: 'editor',
                items: [
                    {
                        id: 'open',
                        label: 'Open in editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        action: function () {
                            window.open('/?project=ADMEditor&activeObject=' + self.$scope.id, '_blank');
                        },
                        actionData: {}
                    }
                ]
            }]
        };

        return [ firstMenu, secondMenu, thirdMenu];
    };

    return DesignSpaceController;
});

