/*globals define, console, window*/

/**
 * @author lattmann / https://github.com/lattmann
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
        self.$scope.getDomainIcon = function (domain) {
            var labelMap = {
                Modelica: 'label-primary',
                CAD: 'label-success',
                Manufacturing: 'label-warning',
                Cyber: 'label-info'
            };
            if (labelMap[domain]) {
                return labelMap[domain];
            }
            return 'label-default';
        };

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
        self.$scope.getComponentInterfaces = self.initGetComponentInterfaces();
        self.$scope.getDesignInterfaces = self.initGetDesignInterfaces();
        self.$scope.getDesignComponents = self.initGetDesignComponents();
        self.$scope.getDesignSize = self.initGetDesignSize();
        self.$scope.getTLSUT = self.initGetTLSUT();
        self.$scope.getMatchingDesigns = self.initGetMatchingDesigns();
        self.$scope.exportDesign = self.initExportDesign();
        // Populate components, designs and test-benches.
        for (i = 0; i < self.nbrOfComponets; i += 1) {
            id = '/' + i;
            self.addComponent(id);
            self.$scope.getComponentInterfaces(id);
        }
        for (i = 0; i < self.nbrOfDesigns; i += 1) {
            id = '/' + (i + self.nbrOfComponets);
            self.addDesign(id);
            self.$scope.getDesignComponents(id);
            self.$scope.getDesignInterfaces(id);
            self.$scope.getDesignSize(id);
        }
        for (i = 0; i < self.nbrOfTestBenches; i += 1) {
            id = '/' + (i + self.nbrOfComponets + self.nbrOfDesigns);
            self.addTestBench(id);
            self.$scope.getTLSUT(id);
            self.$scope.getMatchingDesigns(id);
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
                        self.$scope.getTLSUT = self.initGetTLSUT();
                        if (self.territories.hasOwnProperty(nodeObj.getId())) {

                        } else {
                            self.territories[nodeObj.getId()] = self.smartClient.addUI(
                                nodeObj.getId(),
                                ['ACMFolder', 'ADMFolder', 'Container', 'ATMFolder', 'Connector', 'Property',
                                    'AVMComponentModel', 'DomainModel', 'RequirementsFolder'],
                                self.getWorkspaceEventCallback()
                            );
                        }
                    } else if (event.etype === 'unload') {
                        console.error('TODO: not implemented yet.');
                    }
                }

                self.update();
            }
        });

        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    WorkspaceDetailsController.prototype.getWorkspaceEventCallback = function () {
        var self = this;
        return function (events) {
            var j;

            for (j = 0; j < events.length; j += 1) {
                if (self.smartClient.isMetaTypeOf(events[j].eid, 'AVMComponentModel')) {
                    if (events[j].etype === 'load') {
                        self.addComponent(events[j].eid);
                    } else if (events[j].etype === 'update') {
                        self.addComponent(events[j].eid);
                    } else if (events[j].etype === 'unload') {
                        self.removeComponent(events[j].eid);
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Container')) {
                    if (events[j].etype === 'load') {
                        self.addDesign(events[j].eid);
                    } else if (events[j].etype === 'update') {
                        self.addDesign(events[j].eid);
                    } else if (events[j].etype === 'unload') {
                        self.removeDesign(events[j].eid);
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'AVMTestBenchModel')) {
                    if (events[j].etype === 'load') {
                        self.addTestBench(events[j].eid);
                    } else if (events[j].etype === 'update') {
                        self.addTestBench(events[j].eid);
                    } else if (events[j].etype === 'unload') {
                        self.removeTestBench(events[j].eid);
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'RequirementCategory')) {
                    if (events[j].etype === 'load') {
                        self.addRequirement(events[j].eid);
                    } else if (events[j].etype === 'update') {
                        self.addRequirement(events[j].eid);
                    } else if (events[j].etype === 'unload') {
                        self.removeRequirement(events[j].eid);
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'DomainModel')) {
                    if (events[j].etype === 'load') {
                        self.addDomainModel(events[j].eid);
                    } else if (events[j].etype === 'update') {
                        self.addDomainModel(events[j].eid);
                    } else if (events[j].etype === 'unload') {
                        self.removeDomainModel(events[j].eid);
                    }
                }

                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Connector')) {
                    if (events[j].etype === 'load') {
                        self.addConnector(events[j].eid);
                    } else if (events[j].etype === 'update') {
                        self.addConnector(events[j].eid);
                    }
                }
            }
        };
    };

    // Components
    WorkspaceDetailsController.prototype.addComponent = function (id) {
        var self = this,
            component,
            parentId,
            domainModelId,
            nodeObj;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);
            parentId = nodeObj.getParentId();
            if (self.smartClient.isMetaTypeOf(parentId, 'ACMFolder') === false) {
                return;
            }
            component = {
                id: nodeObj.getId(),
                name: nodeObj.getAttribute('name'),
                description: nodeObj.getAttribute('INFO'),
                date: new Date(),
                inDesigns: {},
                domains: {},
                acm: '',
                interfaces: {
                    properties: {},
                    connectors: {}
                }
            };

            if (nodeObj.getAttribute('Resource')) {
                component.acm = self.smartClient.blobClient.getDownloadURL(nodeObj.getAttribute('Resource'));
            }
        } else {
            component = {
                id: id,
                name: self.chance.word(),
                description: self.chance.sentence(),
                date: self.chance.date(),
                inDesigns: {},
                domains: {},
                acm: '',
                interfaces: {}
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
        }

        if (component) {
            self.$scope.components[id] = component;
            this.update();
        }

    };

    WorkspaceDetailsController.prototype.addDomainModel = function (id) {
        var self = this,
            component,
            parentId,
            domainType,
            nodeObj;

        nodeObj = self.smartClient.client.getNode(id);
        parentId = nodeObj.getParentId();
        component = self.$scope.components[parentId];
        if (component) {
            domainType = nodeObj.getAttribute('Type');
            component.domains[id] = {
                id: id,
                type: domainType
            };
            this.update();
        } else {
            // console.warn('Domain-model did not have component (it is probably in a design). Component ID: ' + parentId);
        }
    };

    WorkspaceDetailsController.prototype.removeDomainModel = function (id) {
        var self = this,
            nodeObj,
            component,
            parentId;

        nodeObj = self.smartClient.client.getNode(id);
        parentId = nodeObj.getParentId();
        component = self.$scope.components[parentId];
        if (component && component.domains.hasOwnProperty(id)) {
            delete component.domains[id];
        }

        this.update();
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
            parentId,
            nodeObj;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);
            parentId = nodeObj.getParentId();
            if (self.smartClient.isMetaTypeOf(parentId, 'ADMFolder')) {
                // root container
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
                    interfaces: {
                        properties: {},
                        connectors: {}
                    }
                };
            } else if (self.$scope.testBenches[parentId]) {
                self.$scope.getTLSUT(parentId);
            }
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
                components: {},
                interfaces: {
                    properties: {},
                    connectors: {}
                }
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

    WorkspaceDetailsController.prototype.addConnector = function (id) {
        var self = this,
            parentNode,
            nodeObj,
            parentId,
            name;

        nodeObj = self.smartClient.client.getNode(id);
        name = nodeObj.getAttribute('name');
        parentId = nodeObj.getParentId();
        parentNode = self.smartClient.client.getNode(parentId);

        if (self.smartClient.isMetaTypeOf(parentId, 'AVMComponentModel')) {
            if (self.$scope.components[parentId]) {
                self.$scope.components[parentId].interfaces.connectors[name] = {
                    name: name,
                    id: id
                };
            }
            self.update();
        } else if (self.$scope.testBenches[parentNode.getParentId()]) {
            // This is a Top Level System Under Test
            // FIXME: This is never triggered
            self.$scope.testBenches[parentNode.getParentId()].tlsut.connectors[name] = {
                name: name,
                id: id
            };
            self.update();
        }
    };

    WorkspaceDetailsController.prototype.addProperty = function (id) {
        var self = this,
            parentNode,
            nodeObj,
            parentId,
            name;

        nodeObj = self.smartClient.client.getNode(id);
        name = nodeObj.getAttribute('name');
        parentId = nodeObj.getParentId();
        parentNode = self.smartClient.client.getNode(parentId);

        if (self.smartClient.isMetaTypeOf(parentId, 'AVMComponentModel')) {
            if (self.$scope.components[parentId]) {
                self.$scope.components[parentId].interfaces.properties[name] = {
                    name: name,
                    id: id
                };
            }
            self.update();
        } else if (self.$scope.testBenches[parentNode.getParentId()]) {
            // This is a Top Level System Under Test
            self.$scope.testBenches[parentNode.getParentId()].tlsut.properties[name] = {
                name: name,
                id: id
            };
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
                }
            };
        } else {
            testBench = {
                id: id,
                name: self.chance.word(),
                description: self.chance.sentence(),
                date: self.chance.date(),
                tlsut: {},
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
    WorkspaceDetailsController.prototype.initGetComponentInterfaces = function () {
        var self = this;
        if (!self.smartClient) {
            return function (id) {
                var interfaces = self.$scope.components[id].interfaces,
                    i,
                    newId;
                interfaces.properties = {};
                interfaces.connectors = {};
                for (i = 0; i < self.chance.integer({min: 1, max: 4}); i += 1) {
                    newId = self.getRandomId();
                    interfaces.properties['prop_' + i] = {
                        id: newId,
                        name: 'prop_' + i
                    };
                }
                for (i = 0; i < self.chance.integer({min: 1, max: 4}); i += 1) {
                    interfaces.connectors['conn_' + i] = {
                        id: newId,
                        name: 'conn_' + i
                    };
                }
                return interfaces;
            };
        }

        return function (id) {
            console.log.error('TODO: Implement this..');
            return {};
        };
    };

    WorkspaceDetailsController.prototype.initGetTLSUT = function () {
        var self = this;
        if (!self.smartClient) {
            return function (id) {
                var tlsut = self.$scope.testBenches[id].tlsut,
                    i,
                    newId;
                tlsut.properties = {};
                tlsut.connectors = {};
                for (i = 0; i < self.chance.integer({min: 1, max: 4}); i += 1) {
                    newId = self.getRandomId();
                    tlsut.properties['prop_' + i] = {
                        id: newId,
                        name: 'prop_' + i
                    };
                }
                for (i = 0; i < self.chance.integer({min: 1, max: 4}); i += 1) {
                    newId = self.getRandomId();
                    tlsut.connectors['conn_' + i] = {
                        id: newId,
                        name: 'conn_' + i
                    };
                }
                return tlsut;
            };
        }

        return function (id) {
            var tlsut = self.$scope.testBenches[id].tlsut;
            if (tlsut) {
                // It could still be incomplete at this stage..
                return tlsut;
            }
            self.$scope.testBenches[id].tlsut = {
                properties: {},
                connectors: {}
            };
            return {};
        };
    };

    WorkspaceDetailsController.prototype.initGetDesignInterfaces = function () {
        var self = this;
        if (!self.smartClient) {
            return function (id) {
                var interfaces = self.$scope.designs[id].interfaces,
                    i,
                    newId;
                interfaces.properties = {};
                interfaces.connectors = {};
                for (i = 0; i < self.chance.integer({min: 1, max: 4}); i += 1) {
                    newId = self.getRandomId();
                    interfaces.properties['prop_' + i] = {
                        id: newId,
                        name: 'prop_' + i
                    };
                }
                for (i = 0; i < self.chance.integer({min: 1, max: 4}); i += 1) {
                    interfaces.connectors['conn_' + i] = {
                        id: newId,
                        name: 'conn_' + i
                    };
                }
                return interfaces;
            };
        }

        return function (id) {
            console.log.error('TODO: Implement this..');
            return {};
        };
    };

    WorkspaceDetailsController.prototype.initGetDesignComponents = function () {
        var self = this;
        if (!self.smartClient) {
            return function (id) {
                var designComponents = self.$scope.designs[id].components,
                    i,
                    component,
                    componentId;
                for (i = 0; i < self.chance.integer({min: 1, max: 10}); i += 1) {
                    componentId = '/' + self.chance.integer({min: 0, max: self.nbrOfComponets - 1});
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
                        self.$scope.components[componentId].inDesigns[id] = component;
                    }
                }
                return designComponents;
            };
        }

        return function (id) {
            console.log.error('TODO: Implement this..');
            return {};
        };
    };

    WorkspaceDetailsController.prototype.initGetDesignSize = function () {
        var self = this;
        if (!self.smartClient) {
            return function (id) {
                var size = self.$scope.designs[id].size,
                    all = self.chance.integer({min: 1, max: 10000});

                size.all = all;
                size.none = self.chance.integer({min: all, max: all * 10});

                return size;
            };
        }

        return function (id) {
            console.log.error('TODO: Implement this..');
            return {};
        };
    };

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
        var name,
            tProp,
            dProp,
            tConn,
            dConn,
            match = false;

        for (name in tlsut.properties) {
            if (tlsut.properties.hasOwnProperty(name)) {
                match = false;
                if (designInterface.properties[name]) {
                    // It only checks the name right now.
                    tProp = tlsut.properties[name];
                    dProp = designInterface.properties[name];
                    // Here it can be elaborated.
                    if (tProp.name === dProp.name) {
                        match = true;
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

        for (name in tlsut.connectors) {
            if (tlsut.connectors.hasOwnProperty(name)) {
                match = false;
                if (designInterface.connectors[name]) {
                    // It only checks the name right now.
                    tConn = tlsut.connectors[name];
                    dConn = designInterface.connectors[name];
                    // Here it can be elaborated.
                    if (tConn.name === dConn.name) {
                        match = true;
                    }
                }
                if (match === false) {
                    break;
                }
            }
        }

        return match;
    };

    WorkspaceDetailsController.prototype.update = function () {
        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
    };

    WorkspaceDetailsController.prototype.getRandomId = function () {
        var len = Math.floor((Math.random() * 2) + 3),
            i,
            id = '';
        for (i = 0; i < len; i += 1) {
            id += '/' + Math.floor((Math.random() * 10000) + 1).toString();
        }
        return id;
    };

    return WorkspaceDetailsController;
});

