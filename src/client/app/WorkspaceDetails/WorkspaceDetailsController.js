/*globals define, console, window*/

/**
 * @author lattmann / https://github.com/lattmann
 */

define([], function () {
    "use strict";

    var WorkspaceDetailsController = function ($scope, $moment, $routeParams, smartClient, Chance) {
        var self = this;

        self.$scope = $scope;
        self.$moment = $moment;
        self.$routeParams = $routeParams;
        self.smartClient = smartClient;

        self.chance = Chance ? new Chance() : null;
        self.$scope.exportDesign = function (id) {
            // FIXME: this should probably not be here.
            self.smartClient.runPlugin('AdmExporter', {activeNode: id, pluginConfig: {'acms': false}}, function (result) {
                if (result.error) {
                    console.error(result.error);
                    return;
                }
                // FIXME: is this the right approach?
                if (result.artifacts[0]) {
                    window.location.assign(self.smartClient.blobClient.getDownloadURL(result.artifacts[0]));
                }
            });
        };
        self.initialize();
    };

    WorkspaceDetailsController.prototype.update = function () {
        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
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


        // initialization of methods
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
            id,
            nbrOfComponets = 15,
            nbrOfDesigns = 3,
            nbrOfTestBenches = 2;

        self.$scope.name = self.chance.word();
        self.$scope.description = self.chance.sentence();
        self.$scope.lastUpdated = {
            time: self.chance.date(),
            user: self.chance.name(),
            hash: self.chance.hash(),
            message: 'something happened'
        };
        for (i = 0; i < nbrOfComponets; i += 1) {
            id = '/' + i;
            self.addComponent(id);
        }
        for (i = 0; i < nbrOfDesigns; i += 1) {
            id = '/' + (i + nbrOfComponets);
            self.addDesign(id);
        }
        for (i = 0; i < nbrOfTestBenches; i += 1) {
            id = '/' + (i + nbrOfComponets + nbrOfDesigns);
            self.addTestBench(id);
        }
        self.addRequirement(self.getRandomId());
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

                        if (self.territories.hasOwnProperty(nodeObj.getId())) {

                        } else {
                            self.territories[nodeObj.getId()] = self.smartClient.addUI(
                                nodeObj.getId(),
                                ['ACMFolder', 'ADMFolder', 'Container', 'ATMFolder',
                                    'AVMComponentModel', 'DomainModel', 'RequirementsFolder'], function (events) {
                                    var j;

                                    for (j = 0; j < events.length; j += 1) {
                                        //console.log(events[j]);

                                        // component
                                        if (self.smartClient.isMetaTypeOf(events[j].eid, 'AVMComponentModel')) {
                                            if (events[j].etype === 'load') {
                                                self.addComponent(events[j].eid);

                                            } else if (events[j].etype === 'update') {
                                                self.addComponent(events[j].eid);

                                            }
                                        }

                                        if (self.smartClient.isMetaTypeOf(events[j].eid, 'Container')) {
                                            if (events[j].etype === 'load') {
                                                self.addDesign(events[j].eid);

                                            } else if (events[j].etype === 'update') {
                                                self.addDesign(events[j].eid);

                                            }
                                        }

                                        if (self.smartClient.isMetaTypeOf(events[j].eid, 'AVMTestBenchModel')) {
                                            if (events[j].etype === 'load') {
                                                self.addTestBench(events[j].eid);

                                            } else if (events[j].etype === 'update') {
                                                self.addTestBench(events[j].eid);

                                            }
                                        }

                                        if (self.smartClient.isMetaTypeOf(events[j].eid, 'DomainModel')) {
                                            if (events[j].etype === 'load') {
                                                self.addDomainModel(events[j].eid);

                                            } else if (events[j].etype === 'update') {
                                                self.addDomainModel(events[j].eid);

                                            }
                                        }

                                        if (self.smartClient.isMetaTypeOf(events[j].eid, 'Requirement')) {
                                            if (events[j].etype === 'load') {
                                                self.addRequirement(events[j].eid);

                                            } else if (events[j].etype === 'update') {
                                                self.addRequirement(events[j].eid);

                                            }
                                        }

                                        if (events[j].etype === 'unload') {
                                            self.removeComponent(events[j].eid);
                                            self.removeDesign(events[j].eid);
                                            self.removeTestBench(events[j].eid);
                                            self.removeDomainModel(events[j].eid);
                                            self.removeRequirement(events[j].eid);
                                        }
                                    }
                                });
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
                domains: {}
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
                domains: {},
                acm: '#' // TODO: we need a random valid url here and sometimes null or empty string
            };
            if (Math.random() > 0.25) {
                domainModelId = self.getRandomId();
                component.domains[domainModelId] = {
                    id: domainModelId,
                    type: 'Modelica'
                };
            }
            if (Math.random() > 0.25) {
                domainModelId = self.getRandomId();
                component.domains[domainModelId] = {
                    id: domainModelId,
                    type: 'CAD'
                };
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
            all,
            design,
            nodeObj;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);

            if (self.smartClient.isMetaTypeOf(nodeObj.getParentId(), 'ADMFolder')) {
                // root container
                design = {
                    id: nodeObj.getId(),
                    name: nodeObj.getAttribute('name'),
                    description: nodeObj.getAttribute('INFO'),
                    date: new Date()
                };

            }
        } else {
            all = self.chance.integer({min: 1, max: 10000});
            design = {
                id: id,
                name: self.chance.word(),
                description: self.chance.sentence(),
                date: self.chance.date(),
                size: {
                    All: all,
                    None: self.chance.integer({min: all, max: all * 10})
                },
                results: self.chance.hash()
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
                tlsuts: {
                    avaliable: self.$scope.designs,
                    selected: tlsut
                }
            };
        } else {
            testBench = {
                id: id,
                name: self.chance.word(),
                description: self.chance.sentence(),
                date: self.chance.date(),
                tlsuts: {
                    avaliable: self.$scope.designs,
                    selected: '/1'
                }
            };
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

    WorkspaceDetailsController.prototype.removeTestBench = function (id) {
        if (this.$scope.requirements.hasOwnProperty(id)) {
            delete this.$scope.requirements[id];
        }

        this.update();
    };

    return WorkspaceDetailsController;
});

