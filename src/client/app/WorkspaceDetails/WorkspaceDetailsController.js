/*globals define, console, window*/

/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */

define([], function () {
    "use strict";

    var WorkspaceDetailsController = function ($scope, $rootScope, $moment, $routeParams, smartClient, Chance, growl) {
        var self = this;

        self.$scope = $scope;
        self.$moment = $moment;
        self.$routeParams = $routeParams;
        self.$rootScope = $rootScope;
        self.smartClient = smartClient;
        self.growl = growl;
        self.territories = {};
        self.compares = 0;
        // For test-data
        self.chance = Chance ? new Chance() : null;
        self.nbrOfComponets = 15;
        self.nbrOfDesigns = 3;
        self.nbrOfTestBenches = 10;
        self.allLoaded = false;
        self.initialize();
    };

    WorkspaceDetailsController.prototype.initialize = function () {
        var self = this;
        //self.$rootScope.appIsLoading = true;
        // scope model
        self.$scope.id = self.$routeParams.id;
        self.$scope.name = '';
        self.$scope.description = '';
        self.$scope.readMe = null;
        self.$scope.lastUpdated = null;
        self.$scope.components = {};
        self.$scope.designs = {};
        self.$scope.testBenches = {};
        self.$scope.requirements = {};
        self.$scope.getUrl = function (objId) {
            return '/?project=ADMEditor&activeObject=' + objId;
        };
        self.$scope.$on('$destroy', function () {
            var key;
            for (key in self.territories) {
                if (self.territories.hasOwnProperty(key)) {
                    if (self.territories[key].territoryId) {
                        self.smartClient.removeUI(self.territories[key].territoryId);
                        console.log('Removed Territory ', self.territories[key].territoryId);
                    } else {
                        console.error('No territoryId for ', self.territories[key]);
                    }
                }
            }
        });
        if (self.smartClient) {
            // if smartClient exists
            self.initWithSmartClient();
        } else {
            console.warn('Data is not linked to the WebGME database.');
            self.initTestData();
        }
    };

    WorkspaceDetailsController.prototype.initTestData = function () {
        var self = this,
            i,
            id;

        self.$scope.name = self.chance.word();
        self.$rootScope.$emit('navigatorStructureChange', {
            id: 'secondItem',
            label: self.$scope.name,
            menu: []
        });
        self.$scope.description = self.chance.sentence();
        self.$scope.lastUpdated = {
            time: self.chance.date(),
            user: self.chance.name(),
            hash: self.chance.hash(),
            message: 'something happened'
        };

        // Initialize functions
        self.$scope.exportDesign = self.initExportDesign();
        self.$scope.deleteObject = self.initDeleteObject();
        self.$scope.executeTestBench = self.initExecuteTestBench();
        self.$scope.updateTLSUT = self.initUpdateTLSUT();
        self.$scope.getDashboard = self.initGetDashboard();
        // Populate components, designs and test-benches.
        for (i = 0; i < self.nbrOfComponets; i += 1) {
            id = '/' + i;
            self.addComponent(id);
        }
        for (i = 0; i < self.nbrOfDesigns; i += 1) {
            id = '/' + (i + self.nbrOfComponets);
            self.addDesign(id);
        }
        for (i = 0; i < self.nbrOfTestBenches; i += 1) {
            id = '/' + (i + self.nbrOfComponets + self.nbrOfDesigns);
            self.addTestBench(id);
            self.matchDesignsAndTestBenches(id);
        }
        self.addRequirement(self.getRandomId());
    };

    WorkspaceDetailsController.prototype.initWithSmartClient = function () {
        var self = this,
            territoryPattern = {},
            territoryId;

        territoryPattern[self.$scope.id] = {children: 0};
        territoryId = self.smartClient.client.addUI(null, function (events) {
            var i,
                event,
                nodeObj;
            for (i = 0; i < events.length; i += 1) {
                event = events[i];
                nodeObj = self.smartClient.client.getNode(event.eid);

                if (event.eid === self.$scope.id) {
                    if (event.etype === 'load' || event.etype === 'update') {
                        self.$scope.name = nodeObj.getAttribute('name');
                        self.$scope.mainNavigator.items = self.getNavigatorStructure();
                        self.$scope.mainNavigator.separator = true;
                        self.$scope.description = nodeObj.getAttribute('INFO');
                        self.update(true);
                        if (event.etype === 'load') {
                            self.$scope.exportDesign = self.initExportDesign();
                            self.$scope.deleteObject = self.initDeleteObject();
                            self.$scope.executeTestBench = self.initExecuteTestBench();
                            self.$scope.updateTLSUT = self.initUpdateTLSUT();
                            self.$scope.getDashboard = self.initGetDashboard();
                        }
                        if (self.territories.hasOwnProperty(event.eid)) {
                            // Workspace has a watcher..
                        } else {
                            self.addWorkspaceWatcher(event.eid);
                        }
                    } else if (event.etype === 'unload') {
                        if (self.territories.hasOwnProperty(event.eid)) {
                            self.smartClient.removeUI(self.territories[event.eid].territoryId);
                            delete self.territories[event.eid];
                        }
                        self.growl.warning('Workspace "' + self.$scope.name + '" was deleted!');
                        window.location.href = '#workspace';
                    }
                }
            }
            if (self.territories['0'].hasLoaded === false) {
                self.territories['0'].hasLoaded = true;
                self.territoriesLoaded('0');
            }
            self.update();
        });

        self.territories['0'] = { nodeId: '0', territoryId: territoryId, hasLoaded: false };
        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    WorkspaceDetailsController.prototype.addWorkspaceWatcher = function (id) {
        var self = this,
            territoryPattern = {},
            terrId;

        territoryPattern[id] = { children: 1 };
        terrId = self.smartClient.client.addUI(null, function (events) {
            var j,
                event;
            for (j = 0; j < events.length; j += 1) {
                event = events[j];
                if (event.eid === id) {
                    // The work-space is being watched from above.
                } else if (event.etype === 'unload' && self.territories[event.eid]) {
                    self.smartClient.removeUI(self.territories[event.eid].territoryId);
                    delete self.territories[event.eid];
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'ACMFolder')) {
                    if (event.etype === 'load') {
                        self.addFolderWatcher(event.eid, 'acm');
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'ADMFolder')) {
                    if (event.etype === 'load') {
                        self.addFolderWatcher(event.eid, 'adm');
                    }
                } else if (self.smartClient.isMetaTypeOf(events[j].eid, 'ATMFolder')) {
                    if (event.etype === 'load') {
                        self.addFolderWatcher(event.eid, 'atm');
                    }
                }
            }
            if (self.territories[id].hasLoaded === false) {
                self.territories[id].hasLoaded = true;
                self.territoriesLoaded(id);
            }
        });

        self.territories[id] = { nodeId: id, territoryId: terrId, hasLoaded: false };
        self.smartClient.client.updateTerritory(terrId, territoryPattern);
    };

    /**
     * @param id - Path of folder node.
     * @param type - 'acm', 'adm', 'atm' or 'requirement'.
     */
    WorkspaceDetailsController.prototype.addFolderWatcher = function (id, type) {
        // TODO: the typeMap approach is probably not too good. saves some time when writing/testing the code.
        var self = this,
            territoryPattern = {},
            territoryId,
            typeMap = {
                acm: {
                    folderMetaName: 'ACMFolder',
                    modelMetaName: 'AVMComponentModel',
                    modelWatcher: 'addComponentWatcher',
                    modelUpdater: 'updateComponent',
                    unloader: 'removeComponent'
                },
                adm: {
                    folderMetaName: 'ADMFolder',
                    modelMetaName: 'Container',
                    modelWatcher: 'addDesignWatcher',
                    modelUpdater: 'updateDesign',
                    unloader: 'removeDesign'
                },
                atm: {
                    folderMetaName: 'ATMFolder',
                    modelMetaName: 'AVMTestBenchModel',
                    modelWatcher: 'addTestBenchWatcher',
                    modelUpdater: 'updateTestBench',
                    unloader: 'removeTestBench'
                }
            };
        territoryPattern[id] = { children: 1 };
        if (self.removeTerritory(id)) {
            console.warn('Removed folder territory, adding new..');
        }
        territoryId = self.smartClient.client.addUI(null, function (events) {
            var j,
                event;
            for (j = 0; j < events.length; j += 1) {
                event = events[j];
                if (event.eid === id) {
                    // The folder defining the territory is being watched from above.
                } else if (event.etype === 'unload') {
                    self[typeMap[type].unloader](id);
                } else if (self.smartClient.isMetaTypeOf(event.eid, typeMap[type].folderMetaName)) {
                    if (event.etype === 'load') {
                        self.addFolderWatcher(event.eid, type);
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, typeMap[type].modelMetaName)) {
                    if (event.etype === 'load') {
                        self[typeMap[type].modelWatcher](event.eid);
                    } else if (event.etype === 'update') {
                        self[typeMap[type].modelUpdater](event.eid);
                    }
                }
            }
            if (self.territories[id] && self.territories[id].hasLoaded === false) {
                self.territories[id].hasLoaded = true;
                self.territoriesLoaded(id);
            }
        });

        self.territories[id] = { nodeId: id, territoryId: territoryId, hasLoaded: false };
        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    WorkspaceDetailsController.prototype.addComponentWatcher = function (id) {
        var self = this,
            j,
            territoryPattern = {},
            territoryId;

        territoryPattern[id] = {children: 1};
        self.addComponent(id);

        if (self.removeTerritory(id)) {
            console.warn('Removed component territory, adding new..');
        }

        territoryId = self.smartClient.client.addUI(null, function (events) {
            var component = self.$scope.components[id],
                nodeObj,
                newConnector,
                event,
                updateDomains = false;

            for (j = 0; j < events.length; j += 1) {
                event = events[j];
                if (event.eid === id) {
                    // Component is being watch from above
                } else if (event.etype === 'unload') {
                    if (component.interfaces.connectors[event.eid]) {
                        delete component.interfaces.connectors[event.eid];
                    } else if (component.interfaces.properties[event.eid]) {
                        delete component.interfaces.properties[event.eid];
                    } else if (component.domains[event.eid]) {
                        delete component.domains[event.eid];
                        updateDomains = true;
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'Connector')) {
                    nodeObj = self.smartClient.client.getNode(event.eid);
                    if (event.etype === 'load') {
                        newConnector = {
                            name: nodeObj.getAttribute('name'),
                            id: event.eid,
                            domainPorts: {}
                        };
                        component.interfaces.connectors[event.eid] = newConnector;
                    } else if (event.etype === 'update') {
                        if (component.interfaces.connectors[event.eid]) {
                            component.interfaces.connectors[event.eid].name = nodeObj.getAttribute('name');
                        }
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'Property')) {
                    nodeObj = self.smartClient.client.getNode(event.eid);
                    if (event.etype === 'load' || event.etype === 'update') {
                        component.interfaces.properties[event.eid] = {
                            name: nodeObj.getAttribute('name'),
                            id: event.eid,
                            dataType: nodeObj.getAttribute('DataType'),
                            valueType: nodeObj.getAttribute('ValueType')
                        };
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'DomainModel')) {
                    nodeObj = self.smartClient.client.getNode(event.eid);
                    updateDomains = true;
                    if (event.etype === 'load' || event.etype === 'update') {
                        component.domains[event.eid] = {
                            id: event.eid,
                            type: nodeObj.getAttribute('Type')
                        };
                    }
                }
            }
            if (updateDomains) {
                component.domainsInfo = self.getDomainsInfo(component.domains);
            }
            if (self.territories[id] && self.territories[id].hasLoaded === false) {
                self.territories[id].hasLoaded = true;
                self.territoriesLoaded(id);
            }
            self.update();
        });

        self.territories[id] = { nodeId: id, territoryId: territoryId, hasLoaded: false };
        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    WorkspaceDetailsController.prototype.addDesignWatcher = function (id) {
        var self = this,
            territoryPattern = {},
            territoryId;

        territoryPattern[id] = {children: 1};
        self.addDesign(id);

        if (self.removeTerritory(id)) {
            console.warn('Removed design territory, adding new..');
        }

        territoryId = self.smartClient.client.addUI(null, function (events) {
            var design = self.$scope.designs[id],
                nodeObj,
                j,
                event,
                checkInterfaces = false;

            for (j = 0; j < events.length; j += 1) {
                event = events[j];
                if (event.eid === id) {
                    // Design is being watched from above.
                } else if (event.etype === 'unload') {
                    if (design.interfaces.connectors[event.eid]) {
                        delete design.interfaces.connectors[event.eid];
                        if (self.territories[event.eid]) {
                            self.smartClient.removeUI(self.territories[event.eid].territoryId);
                            delete self.territories[event.eid];
                        }
                        checkInterfaces = true;
                    } else if (design.interfaces.properties[event.eid]) {
                        delete design.interfaces.properties[event.eid];
                        checkInterfaces = true;
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'Connector')) {
                    nodeObj = self.smartClient.client.getNode(event.eid);
                    if (event.etype === 'load') {
                        self.addConnectorWatcher(event.eid, id);
                        checkInterfaces = true;
                    } else if (event.etype === 'update') {
                        if (design.interfaces.connectors[event.eid]) {
                            design.interfaces.connectors[event.eid].name = nodeObj.getAttribute('name');
                            checkInterfaces = true;
                        }
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'Property')) {
                    nodeObj = self.smartClient.client.getNode(event.eid);
                    if (event.etype === 'load') {
                        checkInterfaces = true;
                        design.interfaces.properties[event.eid] = {
                            name: nodeObj.getAttribute('name'),
                            id: event.eid,
                            dataType: nodeObj.getAttribute('DataType'),
                            valueType: nodeObj.getAttribute('ValueType')
                        };
                    } else if (event.etype === 'update') {
                        if (design.interfaces.properties[event.eid].name !== nodeObj.getAttribute('name') ||
                                design.interfaces.properties[event.eid].dataType !== nodeObj.getAttribute('DataType') ||
                                design.interfaces.properties[event.eid].valueType !== nodeObj.getAttribute('ValueType')) {
                            checkInterfaces = true;
                            design.interfaces.properties[event.eid] = {
                                name: nodeObj.getAttribute('name'),
                                id: event.eid,
                                dataType: nodeObj.getAttribute('DataType'),
                                valueType: nodeObj.getAttribute('ValueType')
                            };
                        }
                    }
                }
            }
            if (self.territories[id] && self.territories[id].hasLoaded === false) {
                self.territories[id].hasLoaded = true;
                self.territoriesLoaded(id);
            }
            if (checkInterfaces && self.allLoaded) {
                self.matchDesignsAndTestBenches(id);
            }
            self.update();
        });

        self.territories[id] = { nodeId: id, territoryId: territoryId, hasLoaded: false };
        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    WorkspaceDetailsController.prototype.addTestBenchWatcher = function (id) {
        var self = this,
            territoryPattern = {},
            territoryId;

        territoryPattern[id] = {children: 1};
        self.addTestBench(id);

        if (self.removeTerritory(id)) {
            console.log('Removed test-bench territory, adding new..');
        }

        territoryId = self.smartClient.client.addUI(null, function (events) {
            var testBench = self.$scope.testBenches[id],
                j,
                event;

            for (j = 0; j < events.length; j += 1) {
                event = events[j];
                if (event.eid === id) {
                    // The test-bench is being watched from above.
                } else if (event.etype === 'unload') {
                    if (testBench.tlsut.id === event.eid) {
                        testBench.tlsut = null;
                        self.removeTerritory(id);
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'Container')) {
                    if (event.etype === 'load') {
                        self.addTLSUTWatcher(event.eid, id);
                    }
                }
            }
            if (self.territories[id] && self.territories[id].hasLoaded === false) {
                self.territories[id].hasLoaded = true;
                self.territoriesLoaded(id);
            }
            self.update();
        });

        self.territories[id] = { nodeId: id, territoryId: territoryId, hasLoaded: false };
        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    WorkspaceDetailsController.prototype.addTLSUTWatcher = function (id, ownerId) {
        var self = this,
            territoryPattern = {},
            territoryId;

        territoryPattern[id] = {children: 1};

        if (self.removeTerritory(id)) {
            console.warn('Removed tlsut territory, adding new..');
        }

        if (self.addTLSUT(id, ownerId) === false) {
            console.warn('Could not find test-bench for TLSUT. (id, ownerId)', id, ownerId);
            return;
        }

        territoryId = self.smartClient.client.addUI(null, function (events) {
            var event,
                nodeObj,
                j,
                checkInterfaces = false,
                testBench = self.$scope.testBenches[ownerId];
            if (!testBench) {
                console.warn('Could not find test-bench for TLSUT. (id, ownerId)', id, ownerId);
                self.removeTerritory(id);
            }
            for (j = 0; j < events.length; j += 1) {
                event = events[j];
                if (event.eid === id) {
                    // TLSUT is being watched from above.
                } else if (event.etype === 'unload') {
                    if (testBench.tlsut) {
                        if (testBench.tlsut.interfaces.connectors[event.eid]) {
                            delete testBench.tlsut.interfaces.connectors[event.eid];
                            checkInterfaces = true;
                        } else if (testBench.tlsut.interfaces.properties[event.eid]) {
                            delete testBench.tlsut.interfaces.properties[event.eid];
                            checkInterfaces = true;
                        }
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'Connector')) {
                    nodeObj = self.smartClient.client.getNode(event.eid);
                    if (event.etype === 'load') {
                        self.addConnectorWatcher(event.eid, ownerId);
                        checkInterfaces = true;
                    } else if (events[j].etype === 'update') {
                        if (testBench.tlsut.interfaces.connectors[event.eid].name !== nodeObj.getAttribute('name')) {
                            testBench.tlsut.interfaces.connectors[event.eid].name = nodeObj.getAttribute('name');
                            checkInterfaces = true;
                        }
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'Property')) {
                    nodeObj = self.smartClient.client.getNode(event.eid);
                    if (event.etype === 'load') {
                        testBench.tlsut.interfaces.properties[event.eid] = {
                            name: nodeObj.getAttribute('name'),
                            id: event.eid,
                            dataType: nodeObj.getAttribute('DataType'),
                            valueType: nodeObj.getAttribute('ValueType')
                        };
                        checkInterfaces = true;
                    } else if (event.etype === 'update') {
                        if (testBench.tlsut.interfaces.properties[event.eid].name !== nodeObj.getAttribute('name') ||
                                testBench.tlsut.interfaces.properties[event.eid].dataType !== nodeObj.getAttribute('DataType') ||
                                testBench.tlsut.interfaces.properties[event.eid].valueType !== nodeObj.getAttribute('ValueType')) {
                            checkInterfaces = true;
                            testBench.tlsut.interfaces.properties[event.eid] = {
                                name: nodeObj.getAttribute('name'),
                                id: event.eid,
                                dataType: nodeObj.getAttribute('DataType'),
                                valueType: nodeObj.getAttribute('ValueType')
                            };
                        }
                    }
                }
            }
            if (self.territories[id] && self.territories[id].hasLoaded === false) {
                self.territories[id].hasLoaded = true;
                self.territoriesLoaded(id);
            }
            if (checkInterfaces && self.allLoaded) {
                self.matchDesignsAndTestBenches(ownerId);
            }
            self.update();
        });

        self.territories[id] = { nodeId: id, territoryId: territoryId, hasLoaded: false };
        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    WorkspaceDetailsController.prototype.addConnectorWatcher = function (id, ownerId) {
        var self = this,
            territoryPattern = {},
            territoryId;

        territoryPattern[id] = {children: 1};

        if (self.removeTerritory(id)) {
            console.warn('Removed connector territory, adding new. (id, ownerId)', id, ownerId);
        }

        if (self.addOrGetConnector(id, ownerId, true) === false) {
            console.warn('Could not find owner when adding connector. (id, ownerId)', id, ownerId);
            return;
        }

        territoryId = self.smartClient.client.addUI(null, function (events) {
            var j,
                checkInterfaces = false,
                event,
                name,
                type,
                connector = self.addOrGetConnector(id, ownerId, false),
                nodeObj;
            if (!connector) {
                console.warn('Could not find owner or connector. (id, ownerId)', id, ownerId);
                self.removeTerritory(id);
            }
            for (j = 0; j < events.length; j += 1) {
                event = events[j];
                if (event.eid === id) {
                    // Connector is being watched from above
                } else if (event.etype === 'unload') {
                    if (connector.domainPorts[event.eid]) {
                        delete connector.domainPorts[event.eid];
                        checkInterfaces = true;
                    }
                } else if (self.smartClient.isMetaTypeOf(event.eid, 'DomainPort')) {
                    nodeObj = self.smartClient.client.getNode(event.eid);
                    name = nodeObj.getAttribute('name');
                    type = nodeObj.getAttribute('Type');

                    if (event.etype === 'load') {
                        checkInterfaces = true;
                        connector.domainPorts[event.eid] = {
                            name: name,
                            id: event.eid,
                            type: type
                        };
                    } else if (event.etype === 'update') {
                        if (connector.domainPorts[event.eid].name !== name ||
                                connector.domainPorts[event.eid].type !== type) {
                            checkInterfaces = true;
                            connector.domainPorts[event.eid] = {
                                name: name,
                                id: event.eid,
                                type: type
                            };
                        }
                    }
                }
            }
            if (self.territories[id] && self.territories[id].hasLoaded === false) {
                self.territories[id].hasLoaded = true;
                self.territoriesLoaded(id);
            }
            if (checkInterfaces && self.allLoaded) {
                self.matchDesignsAndTestBenches(ownerId);
                self.update();
            }
        });

        self.territories[id] = { nodeId: id, territoryId: territoryId, hasLoaded: false };
        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    // Components
    WorkspaceDetailsController.prototype.addComponent = function (id) {
        var self = this,
            component,
            domainModelId,
            nodeObj;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);
            component = {
                id: nodeObj.getId(),
                avmId: nodeObj.getAttribute('ID'),
                name: nodeObj.getAttribute('name'),
                description: nodeObj.getAttribute('INFO'),
                date: new Date(),
                inDesigns: {},
                domains: {},
                domainsInfo: null,
                acm: '',
                interfaces: { properties: {}, connectors: {} }
            };

            if (nodeObj.getAttribute('Resource')) {
                component.acm = self.smartClient.blobClient.getDownloadURL(nodeObj.getAttribute('Resource'));
            }
        } else {
            component = {
                id: id,
                avmId: 'ec9f0fd9-4dab-42ac-bd19-0ec9bf06ed92',
                name: self.chance.word(),
                description: self.chance.sentence(),
                date: self.chance.date(),
                inDesigns: {},
                domains: {},
                domainsInfo: null,
                acm: '',
                interfaces: {
                    connectors: {},
                    properties: {}
                }
            };
            if (Math.random() > 0.25) {
                domainModelId = self.getRandomId();
                component.domains[domainModelId] = {
                    id: domainModelId,
                    type: 'Modelica'
                };
                if (Math.random() > 0.5) {
                    domainModelId = self.getRandomId();
                    component.domains[domainModelId] = {
                        id: domainModelId,
                        type: 'Modelica'
                    };
                }
            }
            if (Math.random() > 0.25) {
                domainModelId = self.getRandomId();
                component.domains[domainModelId] = {
                    id: domainModelId,
                    type: 'CAD'
                };
                if (Math.random() > 0.5) {
                    domainModelId = self.getRandomId();
                    component.domains[domainModelId] = {
                        id: domainModelId,
                        type: 'CAD'
                    };
                }
            }
            if (Math.random() > 0.25) {
                domainModelId = self.getRandomId();
                component.domains[domainModelId] = {
                    id: domainModelId,
                    type: 'Manufacturing'
                };
            }
            if (Math.random() > 0.5) {
                domainModelId = self.getRandomId();
                component.domains[domainModelId] = {
                    id: domainModelId,
                    type: 'Cyber'
                };
                if (Math.random() > 0.75) {
                    domainModelId = self.getRandomId();
                    component.domains[domainModelId] = {
                        id: domainModelId,
                        type: 'Cyber'
                    };
                }
            }
            component.domainsInfo = self.getDomainsInfo(component.domains);
            component.interfaces = self.getInterfacesForTestData(4);
        }

        if (component) {
            self.$scope.components[id] = component;
            this.update();
        }

    };

    WorkspaceDetailsController.prototype.updateComponent = function (id) {
        var self = this,
            component = self.$scope.components[id],
            nodeObj;
        if (component) {
            nodeObj = self.smartClient.client.getNode(id);
            component.avmId = nodeObj.getAttribute('ID');
            component.name = nodeObj.getAttribute('name');
            component.description = nodeObj.getAttribute('INFO');
            //component.date = new Date();
            if (nodeObj.getAttribute('Resource')) {
                component.acm = self.smartClient.blobClient.getDownloadURL(nodeObj.getAttribute('Resource'));
            }
        } else {
            //console.warn('Trying to update non-existing component.');
        }
    };

    WorkspaceDetailsController.prototype.removeComponent = function (id) {
        var self = this,
            name;
        if (self.territories[id]) {
            self.smartClient.removeUI(self.territories[id].territoryId);
            delete self.territories[id];
        }
        if (self.$scope.components[id]) {
            name = self.$scope.components[id].name;
            delete self.$scope.components[id];
            self.growl.info('Component "' + name + '" was removed from work-space.');
            self.update();
        }
    };

    // Designs
    WorkspaceDetailsController.prototype.addDesign = function (id) {
        var self = this,
            design,
            all,
            nodeObj;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);
            design = {
                id: nodeObj.getId(),
                name: nodeObj.getAttribute('name'),
                description: nodeObj.getAttribute('INFO'),
                date: new Date(),
                size: {
                    all: -1,
                    none: -1
                },
                components: {},
                interfaces: { properties: {}, connectors: {} }
            };
        } else {
            design = {
                id: id,
                name: self.chance.word(),
                description: self.chance.sentence(),
                date: self.chance.date(),
                size: {
                    all: -1,
                    none: -1
                },
                components: {
                    '022166ef-9056-456a-b543-6f9b3c11a64c': {
                        componentId: '022166ef-9056-456a-b543-6f9b3c11a64c',
                        designId: id,
                        cnt: 1
                    }
                },
                interfaces: {
                    properties: {},
                    connectors: {}
                }
            };
            design.interfaces = self.getInterfacesForTestData(4);
            design.components = self.getDesignComponentsForTestData(id);
            all = self.chance.integer({min: 1, max: 10000});
            design.size = {
                all: all,
                none: self.chance.integer({min: all, max: all * 10})
            };
        }

        if (design) {
            self.$scope.designs[id] = design;
            this.update();
        }
    };

    WorkspaceDetailsController.prototype.updateDesign = function (id) {
        var self = this,
            design = self.$scope.designs[id],
            nodeObj;
        if (design) {
            nodeObj = self.smartClient.client.getNode(id);
            design.name = nodeObj.getAttribute('name');
            design.description = nodeObj.getAttribute('INFO');
            //design.date = new Date();
            self.update();
        } else {
            console.error('Trying to update non-existing design.');
        }
    };

    WorkspaceDetailsController.prototype.removeDesign = function (id) {
        var self = this,
            name,
            tbId;
        if (self.territories[id]) {
            self.smartClient.removeUI(self.territories[id].territoryId);
            delete self.territories[id];
        }
        if (self.$scope.designs[id]) {
            name = self.$scope.designs[id].name;
            delete self.$scope.designs[id];
            // Clean-up in matching test-benches.
            for (tbId in self.$scope.testBenches) {
                if (self.$scope.testBenches.hasOwnProperty(tbId)) {
                    if (self.$scope.testBenches[tbId].designs.avaliable[id]) {
                        delete self.$scope.testBenches[tbId].designs.avaliable[id];
                    }
                }
            }
            self.growl.info('Design "' + name + '" was removed from work-space.');
            self.update();
        }
    };

    // TestBenches
    WorkspaceDetailsController.prototype.addTestBench = function (id) {
        var self = this,
            testBench,
            nodeObj,
            tlsut;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);
            tlsut = nodeObj.getPointer('TopLevelSystemUnderTest').to;
            testBench = {
                id: nodeObj.getId(),
                name: nodeObj.getAttribute('name'),
                description: nodeObj.getAttribute('INFO'),
                date: new Date(),
                tlsut: null,
                designs: {
                    avaliable: {},
                    selected: tlsut
                },
                results: nodeObj.getAttribute('Results'),
                resultsUrl: null,
                testBenchFiles: nodeObj.getAttribute('TestBenchFiles'),
                testBenchFilesUrl: null
            };
            if (testBench.results) {
                testBench.resultsUrl = self.smartClient.blobClient.getDownloadURL(testBench.results);
            }
            if (testBench.testBenchFiles) {
                testBench.testBenchFilesUrl = self.smartClient.blobClient.getDownloadURL(testBench.testBenchFiles);
            }
        } else {
            testBench = {
                id: id,
                name: self.chance.word(),
                description: self.chance.sentence(),
                date: self.chance.date(),
                tlsut: {
                    connectors: {},
                    properties: {}
                },
                designs: {
                    avaliable: {},
                    selected: '/' + self.chance.integer({
                        min: self.nbrOfComponets,
                        max: self.nbrOfComponets + self.nbrOfDesigns - 1
                    })
                }
            };
            if (Math.random() > 0.8) {
                testBench.designs.selected = null;
            }
            testBench.tlsut = self.getInterfacesForTestData(3);
        }

        if (testBench) {
            self.$scope.testBenches[id] = testBench;
            this.update();
        }
    };

    WorkspaceDetailsController.prototype.addTLSUT = function (id, ownerId) {
        var self = this,
            testBench;

        testBench = self.$scope.testBenches[ownerId];
        if (!testBench) {
            return false;
        }
        if (testBench.tlsut) {
            self.growl.warning(testBench.name + ' seems to have more than one TopLevelSystemUnderTest container.');
        }
        testBench.tlsut = {
            id: id,
            interfaces: { properties: {}, connectors: {} }
        };

        return true;
    };

    WorkspaceDetailsController.prototype.addOrGetConnector = function (id, ownerId, doAdd) {
        var self = this,
            owner,
            connector,
            interfaces;

        owner = self.$scope.testBenches[ownerId];
        if (owner && owner.tlsut) {
            interfaces = owner.tlsut.interfaces;
        } else if (self.$scope.designs[ownerId]) {
            owner = self.$scope.designs[ownerId];
            interfaces = owner.interfaces;
        } else {
            return null;
        }

        connector = interfaces.connectors[id];
        if (!connector && doAdd) {
            connector = {
                name: self.smartClient.client.getNode(id).getAttribute('name'),
                id: id,
                domainPorts: {}
            };
            interfaces.connectors[id] = connector;
        }

        return connector;
    };

    WorkspaceDetailsController.prototype.removeTestBench = function (id) {
        var self = this,
            name;
        if (self.territories[id]) {
            self.smartClient.removeUI(self.territories[id].territoryId);
            delete self.territories[id];
        }
        if (self.$scope.testBenches[id]) {
            name = self.$scope.testBenches[id].name;
            delete self.$scope.testBenches[id];
            self.growl.info('Test-bench "' + name + '" was removed from work-space.');
            self.update();
        }
    };

    WorkspaceDetailsController.prototype.updateTestBench = function (id) {
        var self = this,
            testBench = self.$scope.testBenches[id],
            nodeObj;
        if (testBench) {
            nodeObj = self.smartClient.client.getNode(id);
            testBench.name = nodeObj.getAttribute('name');
            testBench.description = nodeObj.getAttribute('INFO');
            //testBench.date = new Date();
            testBench.designs.selected = nodeObj.getPointer('TopLevelSystemUnderTest').to;
            testBench.results = nodeObj.getAttribute('Results');
            testBench.resultsUrl = testBench.results ?
                    self.smartClient.blobClient.getDownloadURL(testBench.results) : null;
            testBench.testBenchFilesUrl = testBench.testBenchFiles ?
                    self.smartClient.blobClient.getDownloadURL(testBench.testBenchFiles) : null;
            self.update();
        } else {
            console.error('Trying to update non-existing test-bench.');
        }
    };

    // Requirements
    WorkspaceDetailsController.prototype.addRequirement = function (id) {
        var self = this,
            requirement,
            nodeObj;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);
            requirement = {
                id: nodeObj.getId(),
                name: nodeObj.getAttribute('name'),
                description: nodeObj.getAttribute('INFO'),
                date: new Date(),
                data: nodeObj.getAttribute('JsonText')
            };
        } else {
            requirement = {
                name: self.chance.word(),
                description: self.chance.sentence(),
                date: self.chance.date(),
                data: JSON.stringify({ "name": "Aggregated Score",
                        "category": true,
                        "children": [ { "name": "Design Rules",
                            "children": [ { "name": "Transportability", "weight": 0, "weightNeg": 1, "Priority": 1, "children": [] } ]
                        } ]
                    }, null, 2)
            };
        }

        if (requirement) {
            self.$scope.requirements[id] = requirement;
            this.update();
        }
    };

    WorkspaceDetailsController.prototype.removeRequirement = function (id) {
        if (this.$scope.requirements.hasOwnProperty(id)) {
            delete this.$scope.requirements[id];
        }

        this.update();
    };

    // Function initializers.

    WorkspaceDetailsController.prototype.initExportDesign = function () {
        var self = this;
        if (!self.smartClient) {
            return function (id) {
                self.growl.warning('This would be an error message or a success message with a link to the adm-package.');
            };
        }

        return function (id) {
            var name = self.$scope.designs[id].name;
            self.smartClient.runPlugin('AdmExporter', {activeNode: id, pluginConfig: {'acms': false}}, function (result) {
                self.showPluginMessages(result.messages);
                if (result.success === false) {
                    self.growl.error('Could not export ' + name + ' as an adm!');
                    return;
                }

                if (result.artifacts[0]) {
                    self.growl.success('<a href="' + self.smartClient.blobClient.getDownloadURL(result.artifacts[0]) + '">' +
                        name + '.adm</a> successfully exported.', {ttl: -1});
                }
            });
        };
    };

    WorkspaceDetailsController.prototype.initDeleteObject = function () {
        var self = this;
        if (!self.smartClient) {
            return function (id) {
                if (self.$scope.components[id]) {
                    self.removeComponent(id);
                } else if (self.$scope.designs[id]) {
                    self.removeDesign(id);
                } else if (self.$scope.testBenches[id]) {
                    self.removeTestBench(id);
                }
            };
        }
        return function (id) {
            var name;
            if (self.$scope.components[id]) {
                name = self.$scope.components[id].name;
                self.removeComponent(id);
            } else if (self.$scope.designs[id]) {
                name = self.$scope.designs[id].name;
                self.removeDesign(id);
            } else if (self.$scope.testBenches[id]) {
                name = self.$scope.testBenches[id].name;
                self.removeTestBench(id);
            }
            if (name) {
                self.smartClient.client.delMoreNodes([id], '[WebCyPhy] - ' + name + ' was deleted.');
            } else {
                console.warn('Nothing to delete');
            }
        };
    };

    WorkspaceDetailsController.prototype.initUpdateTLSUT = function () {
        var self = this;
        if (!self.smartClient) {
            return function (tbId, designId) {
                self.$scope.testBenches[tbId].designs.selected = designId;
                self.update();
            };
        }
        return function (tbId, designId) {
            var tbName = self.$scope.testBenches[tbId].name,
                dName = self.$scope.designs[designId].name;
            self.$scope.testBenches[tbId].designs.selected = designId;
            self.smartClient.client.makePointer(tbId, 'TopLevelSystemUnderTest', designId,
                    '[WebCyPhy] - Pointer from ' + tbName + ' was set to ' + dName + '.');
        };
    };

    WorkspaceDetailsController.prototype.initExecuteTestBench = function () {
        var self = this;
        if (!self.smartClient) {
            return function (id) {
                self.growl.warning('Would call test-bench executor.');
            };
        }
        return function (id) {
            self.growl.info('Starting execution of ' + self.$scope.testBenches[id].name);
            self.smartClient.runPlugin('TestBenchRunner', { activeNode: id, pluginConfig: {'run': true}}, function (result) {
                var i,
                    artifactsHtml = '';
                console.log(result);
                self.getPluginArtifactsHtml(result.artifacts, function (artifactsHtml) {
                    if (result.success === false) {
                        self.growl.error('Execution failed.' + artifactsHtml);
                        self.showPluginMessages(result.messages);
                        return;
                    }
                    self.showPluginMessages(result.messages);

                    self.growl.success('Execution succeeded.' + artifactsHtml, {ttl: -1});
                });
            });
        };
    };

    WorkspaceDetailsController.prototype.initGetDashboard = function () {
        var self = this;
        if (!self.smartClient) {
            return function (id) {
                self.growl.warning('Would open Dashboard in new tab.');
            };
        }

        return function (id, openLink) {
            var testBench = self.$scope.testBenches[id],
                hash;
            if (!testBench) {
                self.logger.error('Test-bench with id ' + id + ' does not exist!');
                return;
            }
            hash = testBench.results;
            if (hash) {
                self.smartClient.blobClient.getMetadata(hash, function (err, metadata) {
                    var indexHTML = 'index.html',
                        link;
                    if (err) {
                        self.growl.error('Could not obtain dashboard artifact.');
                        return;
                    }

                    if (metadata.content.hasOwnProperty(indexHTML)) {
                        link = self.smartClient.blobClient.getViewURL(hash, indexHTML);
                        // URL EXAMPLES
                        // http://localhost:8855/rest/blob/view/bc5d7d6c887c8b4531d32e86de7bc021e5c0e65e/index.html
                        // http://localhost:8855/rest/blob/metadata/bc5d7d6c887c8b4531d32e86de7bc021e5c0e65e
                        if (openLink) {
                            window.open(link, '_blank');
                        }
                        return link;
                    } else {
                        self.growl.error('Package does not contain index.html file - execution probably failed.');
                    }
                });
            }
        };
    };


    // Helper functions
    WorkspaceDetailsController.prototype.showPluginMessages = function (messages) {
        var self = this,
            msg,
            nodeUrl,
            maxMessages = 10,
            i;
        for (i = 0; i < messages.length; i += 1) {
            msg = messages[i];
            nodeUrl = '/?project=ADMEditor&activeObject=' + msg.activeNode.id;
            nodeUrl = '<a href="' + nodeUrl + '" target="_blank">' + msg.activeNode.name + '</a> - ';
            if (msg.severity === 'info') {
                self.growl.info(nodeUrl + msg.message);
            } else if (msg.severity === 'warning') {
                self.growl.warning(nodeUrl + msg.message);
            } else if (msg.severity === 'error') {
                self.growl.error(nodeUrl + msg.message);
            } else {
                self.growl.info(nodeUrl + msg.message);
            }
            if (i > maxMessages - 1) {
                self.growl.info("More than 10 messages from one plugin, won't growl any more..", {ttl: -1});
                return;
            }
        }
    };

    WorkspaceDetailsController.prototype.getPluginArtifactsHtml = function (artieHashes, callback) {
        var self = this,
            i,
            counter = artieHashes.length,
            artifactsHtml = '',
            getCounterCallback = function (hash) {
                return function (err, artifact) {
                    counter -= 1;
                    if (err) {
                        console.error(err);
                        if (counter <= 0) {
                            callback(artifactsHtml);
                        }
                    }
                    artifactsHtml += '<br> <a href="' + self.smartClient.blobClient.getDownloadURL(hash) +'">'
                        + artifact.name + '</a>';
                    if (counter <= 0) {
                        callback(artifactsHtml);
                    }
                }
            };
        if (counter === 0) {
            callback('');
        }
        for (i = 0; i < artieHashes.length; i += 1) {
            self.smartClient.blobClient.getArtifact(artieHashes[i], getCounterCallback(artieHashes[i]));
        }
    };

    WorkspaceDetailsController.prototype.matchDesignsAndTestBenches = function (id) {
        var self = this,
            testBench,
            design,
            designId,
            testBenchId;

        if (self.$scope.testBenches[id]) {
            testBench = self.$scope.testBenches[id];
            if (!testBench.tlsut) {
                testBench.designs.avaliable = {};
                console.warn('Reset designs avaliable for test-bench', id);
                return;
            }
            for (designId in self.$scope.designs) {
                if (self.$scope.designs.hasOwnProperty(designId)) {
                    design = self.$scope.designs[designId];
                    if (self.compareInterfaces(testBench.tlsut.interfaces, design.interfaces)) {
                        testBench.designs.avaliable[designId] = {id: designId};
                    } else if (testBench.designs.avaliable[designId]) {
                        delete testBench.designs.avaliable[designId];
                    }
                }
            }
        } else if (self.$scope.designs[id]) {
            design = self.$scope.designs[id];
            for (testBenchId in self.$scope.testBenches) {
                if (self.$scope.testBenches.hasOwnProperty(testBenchId)) {
                    testBench = self.$scope.testBenches[testBenchId];
                    if (testBench.tlsut) {
                        if (self.compareInterfaces(testBench.tlsut.interfaces, design.interfaces)) {
                            testBench.designs.avaliable[id] = {id: id};
                        } else if (testBench.designs.avaliable[id]) {
                            delete testBench.designs.avaliable[id];
                        }
                    } else {
                        testBench.designs.avaliable = {};
                        console.warn('Reset designs avaliable for test-bench ', testBenchId);
                    }
                }
            }
        }
    };

    WorkspaceDetailsController.prototype.compareInterfaces = function (tlsutInterfaces, designInterface) {
        var tId,
            dId,
            tProp,
            dProp,
            tConn,
            dConn,
            match = true;

        this.compares += 1;
        console.log('Number of compares : ' + this.compares);
        for (tId in tlsutInterfaces.properties) {
            if (tlsutInterfaces.properties.hasOwnProperty(tId)) {
                tProp = tlsutInterfaces.properties[tId];
                match = false;
                for (dId in designInterface.properties) {
                    if (designInterface.properties.hasOwnProperty(dId)) {
                        dProp = designInterface.properties[dId];
                        // It only checks the name right now.
                        // TODO: add type check
                        if (tProp.name === dProp.name) {
                            match = true;
                            break;
                        }
                    }
                }
                if (match === false) {
                    break;
                }
            }
        }

        if (match === false) {
            return false;
        }

        for (tId in tlsutInterfaces.connectors) {
            if (tlsutInterfaces.connectors.hasOwnProperty(tId)) {
                tConn = tlsutInterfaces.connectors[tId];
                match = false;
                for (dId in designInterface.connectors) {
                    if (designInterface.connectors.hasOwnProperty(dId)) {
                        dConn = designInterface.connectors[dId];
                        // It only checks the name right now.
                        // TODO: add type check
                        if (tConn.name === dConn.name) {
                            match = true;
                            break;
                        }
                    }
                }
                if (match === false) {
                    break;
                }
            }
        }

        return match;
    };

    WorkspaceDetailsController.prototype.getDomainsInfo = function (domains) {
        var key,
            dType,
            domainsInfo = {},
            labelMap = {
                Modelica: 'cyphy-tag dark-blue', //'label-primary',
                CAD: 'cyphy-tag green', //'label-success',
                Manufacturing: 'cyphy-tag yellow', //'label-warning',
                SPICE: 'cyphy-tag yellow',
                EDA: 'cyphy-tag purple',
                SystemC: 'cyphy-tag green',
                RF: 'cyphy-tag dark-blue',
                Cyber: 'cyphy-tag purple' //'label-info'
            },
            icon;

        for (key in domains) {
            if (domains.hasOwnProperty(key)) {
                dType = domains[key].type;
                if (domainsInfo[dType]) {
                    domainsInfo[dType].cnt += 1;
                } else {
                    icon = labelMap[dType] || 'label-default';
                    domainsInfo[dType] = {
                        cnt: 1,
                        type: dType,
                        icon: icon
                    };
                }
            }
        }

        return domainsInfo;
    };

    WorkspaceDetailsController.prototype.update = function (forceApply) {
        var self = this;
        if (self.allLoaded || forceApply) {
            if (!self.$scope.$$phase) {
                self.$scope.$apply();
            }
        }
    };

    WorkspaceDetailsController.prototype.territoriesLoaded = function (id) {
        var self = this,
            total = 0,
            loaded = 0,
            tbId,
            key;

        for (key in self.territories) {
            if (self.territories.hasOwnProperty(key)) {
                total += 1;
                if (self.territories[key].hasLoaded) {
                    loaded += 1;
                } else {
                    //console.log(key);
                }
            }
        }
        console.log(id, loaded, total);
        if (loaded === total) {
            console.log('components, designs, test-benches',
                Object.keys(self.$scope.components).length,
                Object.keys(self.$scope.designs).length,
                Object.keys(self.$scope.testBenches).length);
        }
        if (self.allLoaded === false && loaded === total) {
            self.allLoaded = true;
            for (tbId in self.$scope.testBenches) {
                if (self.$scope.testBenches.hasOwnProperty(tbId)) {
                    self.matchDesignsAndTestBenches(tbId);
                }
            }
        }
    };

    WorkspaceDetailsController.prototype.removeTerritory = function (id) {
        var self = this;
        if (self.territories.hasOwnProperty(id)) {
            self.smartClient.removeUI(self.territories[id].territoryId);
            delete self.territories[id];
            return true;
        }
        return false;
    };

    WorkspaceDetailsController.prototype.getNavigatorStructure = function () {
        var self = this,
            firstMenu,
            secondMenu;

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
            label: self.$scope.name,
            itemClass: 'workspace',
            menu: [{
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
        return [ firstMenu, secondMenu ];
    };

    // TestData helper functions
    WorkspaceDetailsController.prototype.getRandomId = function () {
        var len = Math.floor((Math.random() * 2) + 3),
            i,
            id = '';
        for (i = 0; i < len; i += 1) {
            id += '/' + Math.floor((Math.random() * 10000) + 1).toString();
        }
        return id;
    };

    WorkspaceDetailsController.prototype.getInterfacesForTestData = function (maxNbr) {
        var self = this,
            interfaces = {
                connectors: {},
                properties: {}
            },
            i,
            newId;
        for (i = 0; i < self.chance.integer({min: 1, max: maxNbr}); i += 1) {
            newId = self.getRandomId();
            interfaces.properties[newId] = {
                id: newId,
                name: 'prop_' + i,
                dataType: 'Real',
                valueType: 'Fixed'
            };
        }
        for (i = 0; i < self.chance.integer({min: 1, max: maxNbr}); i += 1) {
            newId = self.getRandomId();
            interfaces.connectors[newId] = {
                id: newId,
                name: 'conn_' + i
                // TODO: add type information
            };
        }
        return interfaces;
    };

    WorkspaceDetailsController.prototype.getDesignComponentsForTestData = function (id) {
        var self = this,
            designComponents = {},
            i,
            component,
            componentId,
            componentIds = ['ec9f0fd9-4dab-42ac-bd19-0ec9bf06ed92',
                '022166ef-9056-456a-b543-6f9b3c11a64c',
                '7e162776-8d74-4ed1-a067-da4ce07afe46',
                '1c8326bb-94db-4445-80b5-23d837e71c6f',
                'cb5c8b8d-7903-4da9-906f-ecf9bd8d282b',
                '4e5dadee-2b2c-4c21-9670-f08cbf687d3c',
                '93067716-7f7e-45ef-89c2-adc053d28c2a',
                '99b0d8a3-7102-4ce0-9f6a-7b474b184484',
                '1cc42070-79f4-469d-82c0-9120e056e038',
                '567e280a-ad0a-4fa1-b222-bb21217cf567'];
        for (i = 0; i < self.chance.integer({min: 1, max: 10}); i += 1) {
            componentId = componentIds[self.chance.integer({min: 0, max: componentIds.length - 1})];
            component = designComponents[componentId];
            if (component) {
                component.cnt += 1;
            } else {
                component = {
                    componentId: componentId,
                    designId: id,
                    cnt: 1
                };

                designComponents[componentId] = component;
            }
        }
        return designComponents;
    };

    return WorkspaceDetailsController;
});