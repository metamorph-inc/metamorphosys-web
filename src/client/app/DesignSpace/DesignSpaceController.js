/*globals define, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

define([], function () {
    "use strict";

    var DesignSpaceController = function ($scope, $moment, $routeParams, smartClient, Chance, growl) {
        var self = this;

        self.$scope = $scope;
        self.$moment = $moment;
        self.$routeParams = $routeParams;
        self.smartClient = smartClient;
        self.growl = growl;

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

        territoryPattern[self.$scope.id] = {children: 0};

        territoryId = self.smartClient.client.addUI(null, function (events) {
            var i,
                event,
                nodeObj;
            //self.growl.info('events.length : ' + events.length);
            for (i = 0; i < events.length; i += 1) {
                event = events[i];
                nodeObj = self.smartClient.client.getNode(event.eid);

                if (event.eid === self.$scope.id) {
                    if (event.etype === 'load' || event.etype === 'update') {
                        self.$scope.name = nodeObj.getAttribute('name');
                        self.$scope.description = nodeObj.getAttribute('INFO');

                        if (self.territories.hasOwnProperty(nodeObj.getId())) {

                        } else {
                            self.territories[nodeObj.getId()] = self.smartClient.addUI(nodeObj.getId(), ['Container', 'AVMComponentModel'], function (events) {
                                var j;

                                for (j = 0; j < events.length; j += 1) {

                                    if (self.smartClient.isMetaTypeOf(events[j].eid, 'Container')) {
                                        if (events[j].etype === 'load') {
                                            self.addContainer(events[j].eid);

                                        } else if (events[j].etype === 'update') {
                                            //TODO: Something fitting..
                                        }
                                    }

                                    if (self.smartClient.isMetaTypeOf(events[j].eid, 'AVMComponentModel')) {
                                        if (events[j].etype === 'load') {
                                            self.addComponent(events[j].eid);
                                        } else if (events[j].etype === 'update') {
                                            //TODO: Something fitting, e.g. decrease componentsCount for container.
                                        }
                                    }

                                    if (events[j].etype === 'unload') {
                                        self.removeContainer(events[j].eid);
                                    }
                                }
                            });
                        }
                    } else if (event.etype === 'unload') {
                        console.error('TODO: not implemented yet.');
                    }
                } else {
                    self.growl.error('Object with different id than root-container raised event.');
                }

                self.update();
            }
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
            if (self.$scope.containers[parentId]) {
                self.$scope.containers[parentId].containersCount += 1;
            }
            container = {
                id: nodeObj.getId(),
                name: nodeObj.getAttribute('name'),
                description: nodeObj.getAttribute('INFO'),
                date: new Date(),
                type: nodeObj.getAttribute('Type'),
                componentsCount: 0,
                containersCount: 0
            };
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
            this.update();
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
            parentId;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);
            parentId = nodeObj.getParentId();
            if (self.$scope.containers[parentId]) {
                self.$scope.containers[parentId].componentsCount += 1;
            }
            this.update();
        }
    };

    return DesignSpaceController;
});

