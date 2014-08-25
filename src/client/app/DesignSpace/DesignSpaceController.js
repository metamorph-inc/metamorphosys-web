/*globals define, console, window*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

define(['../../js/DesertFrontEnd',
        'xmljsonconverter'], function (DesertFrontEnd, Converter) {
    'use strict';

    var DesignSpaceController = function ($scope, $rootScope, $moment, $routeParams, smartClient, Chance, growl) {
        var self = this;

        self.$scope = $scope;
        self.$moment = $moment;
        self.$routeParams = $routeParams;
        self.$rootScope = $rootScope;
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
//        self.$scope.exportDesign = function (id) {
//            // FIXME: this should probably not be here.
//            self.smartClient.runPlugin('AdmExporter', {activeNode: id, pluginConfig: {'acms': false}}, function (result) {
//                if (result.error) {
//                    console.error(result.error);
//                    return;
//                }
//                // FIXME: is this the right approach?
//                if (result.artifacts[0]) {
//                    window.location.assign(self.smartClient.blobClient.getDownloadURL(result.artifacts[0]));
//                }
//            });
//        };
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
        self.menuItemSave = null;
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

        self.territories = {};

        territoryPattern[self.$scope.id] = {children: 999};
        self.$rootScope.appIsLoading = true;
        self.update();
        territoryId = self.smartClient.client.addUI(null, function (events) {
            var i,
                event,
                nodeObj;
            self.$rootScope.appIsLoading = true;
            self.update();
            self.$scope.containers = {};
            self.$scope.components = {};
            self.$scope.rootNode = [];
            self.$scope.desertInfo = {};
            self.$scope.desert = { cfgs:  {}, selectedCfg: null };
            for (i = 0; i < events.length; i += 1) {
                event = events[i];
                nodeObj = self.smartClient.client.getNode(event.eid);

                if (event.eid === self.$scope.id) {
                    if (event.etype === 'load' || event.etype === 'update') {
                        self.$scope.name = nodeObj.getAttribute('name');
                        self.$scope.description = nodeObj.getAttribute('INFO');
                        self.$scope.mainNavigator.items = self.getNavigatorStructure(nodeObj);
                        self.$scope.mainNavigator.separator = true;
                        self.addContainer(events[i].eid);
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
                                            self.$scope.desert.cfgs[cfg['@id']].alternativeAssignments[elemIdToPath[altAss['@alternative_end_']]] = true;
                                        }
                                    }
                                    self.$scope.desert.selectedCfg = self.$scope.desert.cfgs['1'];
                                    self.menuItemSave.disabled = false;
                                    self.update();
                                });
                            }
                        });
                    } else if (event.etype === 'unload') {
                        console.error('TODO: not implemented yet.');
                    }
                } else if (self.smartClient.isMetaTypeOf(events[i].eid, 'Container')) {
                    if (events[i].etype === 'load' || events[i].etype === 'update') {
                        self.addContainer(events[i].eid);
                    }
                } else if (self.smartClient.isMetaTypeOf(events[i].eid, 'AVMComponentModel')) {
                    if (events[i].etype === 'load' || events[i].etype === 'update') {
                        self.addComponent(events[i].eid);
                    }
                }
            }
            self.$rootScope.appIsLoading = false;
            self.update();
        });

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
                type: null,
                componentsCount: self.chance.integer({min: 0, max: 12}),
                containersCount: self.chance.integer({min: 0, max: 4})
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
        if (this.$scope.containers.hasOwnProperty(id)) {
            delete this.$scope.containers[id];
        }

        this.update();
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
            //console.info(JSON.stringify(desertData, null, 2));
            if (desertObject instanceof Error) {
                callback('Output desert XML not valid xml, err: ' + desertObject.message);
                return;
            }
            callback(null, desertObject.DesertBackSystem);
        });
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
            id: 'saveCfgs',
            label: 'Save Configurations',
            disabled: true,
            iconClass: 'glyphicon glyphicon-floppy-save',
            action: function () {
                var key,
                    cfg;
                if (!self.$scope.desert) {
                    console.error('No desert defined on scope');
                }
                for (key in self.$scope.desert.cfgs) {
                    if (self.$scope.desert.cfgs.hasOwnProperty(key)) {
                        cfg = self.$scope.desert.cfgs[key];
                        if (cfg.isSelected) {
                            self.growl.warning('Would save cfg : ' + JSON.stringify(cfg, null, 2));
                        }
                    }
                }
            },
            actionData: {}
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
                    self.menuItemSave
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

