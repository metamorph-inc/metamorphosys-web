/*globals define, console, window*/

/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */

define([], function () {
    "use strict";

    var WorkspaceDetailsController = function ($scope, $moment, $routeParams, smartClient, Chance, growl) {
        var self = this;

        self.$scope = $scope;
        self.$moment = $moment;
        self.$routeParams = $routeParams;
        self.smartClient = smartClient;
        self.growl = growl;

        // For test-data
        self.chance = Chance ? new Chance() : null;
        self.nbrOfComponets = 15;
        self.nbrOfDesigns = 3;
        self.nbrOfTestBenches = 10;
        self.initialize();
    };

    WorkspaceDetailsController.prototype.initialize = function () {
        var self = this;

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
        self.$scope.description = self.chance.sentence();
        self.$scope.lastUpdated = {
            time: self.chance.date(),
            user: self.chance.name(),
            hash: self.chance.hash(),
            message: 'something happened'
        };

        // Initialize functions
        self.$scope.exportDesign = self.initExportDesign();
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
        }
        self.addRequirement(self.getRandomId());
    };

    WorkspaceDetailsController.prototype.initWithSmartClient = function () {
        var self = this,
            territoryPattern = {},
            territoryId;

        self.territories = {};
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
                        self.$scope.description = nodeObj.getAttribute('INFO');
                        self.$scope.exportDesign = self.initExportDesign();
                        if (self.territories.hasOwnProperty(event.eid)) {

                        } else {
                            self.territories[event.eid] = self.smartClient.addUI(
                                event.eid,
                                ['ACMFolder', 'ADMFolder', 'ATMFolder', 'RequirementsFolder'],
                                self.getWorkspaceEventCallback()
                            );
                        }
                    } else if (event.etype === 'unload') {
                        if (self.territories.hasOwnProperty(event.eid)) {
                            self.smartClient.removeUI(self.territories[event.eid]);
                        }
                        self.growl.warning('Workspace "' + self.$scope.name + '" was deleted!');
                        window.location.href = '#workspace';
                    }
                }
            }
            self.update();
        });

        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    WorkspaceDetailsController.prototype.getWorkspaceEventCallback = function () {
        var self = this;
        return function (events) {
            var j;

            for (j = 0; j < events.length; j += 1) {
                if (self.smartClient.isMetaTypeOf(events[j].eid, 'AVMComponentModel')) {
                    if (events[j].etype === 'load' || events[j].etype === 'update') {
                        self.addComponentWatcher(events[j].eid);
                    } else if (events[j].etype === 'unload') {
                        if (self.territories.hasOwnProperty(events[j].eid)) {
                            self.smartClient.removeUI(self.territories[events[j].eid]);
                        }
                        self.removeComponent(events[j].eid);
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Container')) {
                    if (events[j].etype === 'load' || events[j].etype === 'update') {
                        self.addDesignWatcher(events[j].eid);
                    } else if (events[j].etype === 'unload') {
                        if (self.territories.hasOwnProperty(events[j].eid)) {
                            self.smartClient.removeUI(self.territories[events[j].eid]);
                        }
                        self.removeDesign(events[j].eid);
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'AVMTestBenchModel')) {
                    if (events[j].etype === 'load' || events[j].etype === 'update') {
                        self.addTestBenchWatcher(events[j].eid);
                    } else if (events[j].etype === 'unload') {
                        if (self.territories.hasOwnProperty(events[j].eid)) {
                            self.smartClient.removeUI(self.territories[events[j].eid]);
                        }
                        self.removeTestBench(events[j].eid);
                    }
                }
//
//                if (self.smartClient.isMetaTypeOf(events[j].eid, 'RequirementCategory')) {
//                    if (events[j].etype === 'load') {
//                        self.addRequirement(events[j].eid);
//                    } else if (events[j].etype === 'update') {
//                        self.addRequirement(events[j].eid);
//                    } else if (events[j].etype === 'unload') {
//                        self.removeRequirement(events[j].eid);
//                    }
//                }
            }
        };
    };

    WorkspaceDetailsController.prototype.addComponentWatcher = function (id) {
        var self = this,
            j;

        self.addComponent(id);

        if (self.territories.hasOwnProperty(id)) {
            self.smartClient.removeUI(self.territories[id]);
        }

        self.territories[id] = self.smartClient.addUI(id, [], function (events) {
            var component = self.$scope.components[id],
                nodeObj,
                updateDomains = false;
            if (!component) {
                return;
            }
            if (!component.interfaces) {
                component.interfaces = { properties: {}, connectors: {} };
            }
            for (j = 0; j < events.length; j += 1) {
                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Connector')) {
                    nodeObj = self.smartClient.client.getNode(events[j].eid);
                    if (events[j].etype === 'load' || events[j].etype === 'update') {
                        component.interfaces.connectors[events[j].eid] = {
                            name: nodeObj.getAttribute('name'),
                            id: events[j].eid
                        };
                    } else if (events[j].etype === 'unload') {
                        if (component.interfaces.connectors.hasOwnProperty(events[j].eid)) {
                            delete component.interfaces.connectors[events[j].eid];
                        }
                    } else {
                        throw 'Unexpected event type' + events[j].etype;
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Property')) {
                    nodeObj = self.smartClient.client.getNode(events[j].eid);
                    if (events[j].etype === 'load' || events[j].etype === 'update') {
                        component.interfaces.properties[events[j].eid] = {
                            name: nodeObj.getAttribute('name'),
                            id: events[j].eid
                        };
                    } else if (events[j].etype === 'unload') {
                        if (component.interfaces.properties.hasOwnProperty(events[j].eid)) {
                            delete component.interfaces.properties[events[j].eid];
                        }
                    } else {
                        throw 'Unexpected event type' + events[j].etype;
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'DomainModel')) {
                    nodeObj = self.smartClient.client.getNode(events[j].eid);
                    updateDomains = true;
                    if (events[j].etype === 'load' || events[j].etype === 'update') {
                        component.domains[events[j].eid] = {
                            id: events[j].eid,
                            type: nodeObj.getAttribute('Type')
                        };
                    } else if (events[j].etype === 'unload') {
                        if (component.domains[events[j].eid]) {
                            delete component.domains[events[j].eid];
                        }
                    } else {
                        throw 'Unexpected event type' + events[j].etype;
                    }
                }
            }
            if (updateDomains) {
                component.domainsInfo = self.getDomainsInfo(component.domains);
            }
            self.update();
        });
    };

    WorkspaceDetailsController.prototype.addTestBenchWatcher = function (id) {
        var self = this,
            j;

        self.addTestBench(id);

        if (self.territories.hasOwnProperty(id)) {
            self.smartClient.removeUI(self.territories[id]);
        }

        self.territories[id] = self.smartClient.addUI(id, ['Container'], function (events) {
            var testBench = self.$scope.testBenches[id],
                nodeObj;
            if (!testBench) {
                return;
            }
            if (!testBench.tlsut) {
                testBench.tlsut = { properties: {}, connectors: {} };
            }
            for (j = 0; j < events.length; j += 1) {

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Connector')) {
                    nodeObj = self.smartClient.client.getNode(events[j].eid);
                    if (self.smartClient.isMetaTypeOf(nodeObj.getParentId(), 'Container')) {
                        if (events[j].etype === 'load' || events[j].etype === 'update') {
                            testBench.tlsut.connectors[events[j].eid] = {
                                name: nodeObj.getAttribute('name'),
                                id: events[j].eid
                            };
                        } else if (events[j].etype === 'unload') {
                            if (testBench.tlsut.connectors.hasOwnProperty(events[j].eid)) {
                                delete testBench.tlsut.connectors[events[j].eid];
                            }
                        } else {
                            throw 'Unexpected event type' + events[j].etype;
                        }
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Property')) {
                    nodeObj = self.smartClient.client.getNode(events[j].eid);
                    if (self.smartClient.isMetaTypeOf(nodeObj.getParentId(), 'Container')) {
                        if (events[j].etype === 'load' || events[j].etype === 'update') {
                            testBench.tlsut.properties[events[j].eid] = {
                                name: nodeObj.getAttribute('name'),
                                id: events[j].eid
                            };
                        } else if (events[j].etype === 'unload') {
                            if (testBench.tlsut.properties.hasOwnProperty(events[j].eid)) {
                                delete testBench.tlsut.properties[events[j].eid];
                            }
                        } else {
                            throw 'Unexpected event type' + events[j].etype;
                        }
                    }
                }
            }
            self.update();
        });
    };

    WorkspaceDetailsController.prototype.addDesignWatcher = function (id) {
        var self = this,
            j;
        // This only watches the interfaces
        self.addDesign(id);

        if (self.territories.hasOwnProperty(id)) {
            self.smartClient.removeUI(self.territories[id]);
        }

        self.territories[id] = self.smartClient.addUI(id, ['Container'], function (events) {
            var design = self.$scope.designs[id],
                nodeObj,
                componentId;
            if (!design) {
                return;
            }
            if (!design.interfaces) {
                design.interfaces = { properties: {}, connectors: {} };
            }
            if (!design.components) {
                design.components = {};
            }
            for (j = 0; j < events.length; j += 1) {

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'AVMComponentModel')) {
                    nodeObj = self.smartClient.client.getNode(events[j].eid);
                    componentId = nodeObj.getAttribute('ID');
                    if (events[j].etype === 'load') {
                        //self.growl.warning('load ' + events[j].eid);
                        if (design.components[componentId]) {
                            design.components[componentId].cnt += 1;
                        } else {
                            design.components[componentId] = {
                                componentId: componentId,
                                designId: id,
                                cnt: 1
                            };
                        }
                    } else if (events[j].etype === 'unload') {
                        //self.growl.warning('unload ' + events[j].eid);
                        if (design.components[componentId]) {
                            if (design.components[componentId].cnt === 1) {
                                delete design.components[componentId];
                            } else {
                                design.components[componentId].cnt -= 1;
                            }
                        }
                    } else if (events[j].etype === 'update') {
                        //self.growl.warning('update ' + events[j].eid);
                        // TODO: The only update that matters is the change of component ID.
                    } else {
                        throw 'Unexpected event type' + events[j].etype;
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Connector')) {
                    nodeObj = self.smartClient.client.getNode(events[j].eid);
                    if (nodeObj.getParentId() === id) {
                        if (events[j].etype === 'load' || events[j].etype === 'update') {
                            design.interfaces.connectors[events[j].eid] = {
                                name: nodeObj.getAttribute('name'),
                                id: events[j].eid
                            };
                        } else if (events[j].etype === 'unload') {
                            if (design.interfaces.connectors.hasOwnProperty(events[j].eid)) {
                                delete design.interfaces.connectors[events[j].eid];
                            }
                        } else {
                            throw 'Unexpected event type' + events[j].etype;
                        }
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Property')) {
                    nodeObj = self.smartClient.client.getNode(events[j].eid);
                    if (nodeObj.getParentId() === id) {
                        if (events[j].etype === 'load' || events[j].etype === 'update') {
                            design.interfaces.properties[events[j].eid] = {
                                name: nodeObj.getAttribute('name'),
                                id: events[j].eid
                            };
                        } else if (events[j].etype === 'unload') {
                            if (design.interfaces.properties.hasOwnProperty(events[j].eid)) {
                                delete design.interfaces.properties[events[j].eid];
                            }
                        } else {
                            throw 'Unexpected event type' + events[j].etype;
                        }
                    }
                }
            }
            self.update();
        });
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
                interfaces: null
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

    WorkspaceDetailsController.prototype.removeComponent = function (id) {
        if (this.$scope.components.hasOwnProperty(id)) {
            delete this.$scope.components[id];
        }

        this.update();
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
                components: null,
                interfaces: null
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

    WorkspaceDetailsController.prototype.removeDesign = function (id) {
        if (this.$scope.designs.hasOwnProperty(id)) {
            delete this.$scope.designs[id];
        }

        this.update();
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
                }
            };
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

    WorkspaceDetailsController.prototype.removeTestBench = function (id) {
        if (this.$scope.testBenches.hasOwnProperty(id)) {
            delete this.$scope.testBenches[id];
        }

        this.update();
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

    WorkspaceDetailsController.prototype.initGetMatchingDesigns = function () {
        var self = this;
        if (!self.smartClient) {
            return function (id) {
                var tbDesigns = self.$scope.testBenches[id].designs,
                    designId,
                    tlsut = self.$scope.testBenches[id].tlsut,
                    designInterface;

                for (designId in self.$scope.designs) {
                    if (self.$scope.designs.hasOwnProperty(designId)) {
                        designInterface = self.$scope.designs[designId].interfaces;
                        if (self.compareInterfaces(tlsut, designInterface)) {
                            tbDesigns.avaliable[designId] = {id: designId};
                        }
                    }
                }
                return tbDesigns.avaliable;
            };
        }

        return function (id) {
            console.log.error('TODO: Implement this..');
            return {};
        };
    };

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

    // Helper functions
    WorkspaceDetailsController.prototype.showPluginMessages = function (messages) {
        var self = this,
            msg,
            nodeUrl,
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
        }
    };

    WorkspaceDetailsController.prototype.compareInterfaces = function (tlsut, designInterface) {
        var tId,
            dId,
            tProp,
            dProp,
            tConn,
            dConn,
            match = true;

        for (tId in tlsut.properties) {
            if (tlsut.properties.hasOwnProperty(tId)) {
                tProp = tlsut.properties[tId];
                match = false;
                for (dId in designInterface.properties) {
                    if (designInterface.properties.hasOwnProperty(dId)) {
                        dProp = designInterface.properties[dId];
                        // It only checks the name right now.
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

        for (tId in tlsut.connectors) {
            if (tlsut.connectors.hasOwnProperty(tId)) {
                tConn = tlsut.connectors[tId];
                match = false;
                for (dId in designInterface.connectors) {
                    if (designInterface.connectors.hasOwnProperty(dId)) {
                        dConn = designInterface.connectors[dId];
                        // It only checks the name right now.
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
                Modelica: 'label-primary',
                CAD: 'label-success',
                Manufacturing: 'label-warning',
                Cyber: 'label-info'
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

    WorkspaceDetailsController.prototype.update = function () {
        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
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
                name: 'prop_' + i
            };
        }
        for (i = 0; i < self.chance.integer({min: 1, max: maxNbr}); i += 1) {
            newId = self.getRandomId();
            interfaces.connectors[newId] = {
                id: newId,
                name: 'conn_' + i
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

