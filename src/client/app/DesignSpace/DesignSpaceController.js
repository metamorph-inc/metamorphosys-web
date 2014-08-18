/*globals define, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

define(['../../js/DesertFrontEnd'], function (DesertFrontEnd) {
    "use strict";

    var DesignSpaceController = function ($scope, $moment, $routeParams, smartClient, Chance, growl) {
        var self = this;

        self.$scope = $scope;
        self.$moment = $moment;
        self.$routeParams = $routeParams;
        self.smartClient = smartClient;
        self.desertFrontEnd = new DesertFrontEnd(smartClient);
        self.growl = growl;
        self.avmIdToId = {};

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
                        self.$scope.desertInfo = {status: 'INITIALIZED'};
                        self.desertFrontEnd.addSimpleListener(self.$routeParams.id, function (status) {
                            self.$scope.desertInfo = status;
                            //self.growl.info(JSON.stringify(status, null, 2));
                            self.update();
                        });
                        self.desertFrontEnd.calculateNbrOfCfgs(self.$scope.id);
                    } else if (event.etype === 'unload') {
                        console.error('TODO: not implemented yet.');
                    }
                } else if (self.smartClient.isMetaTypeOf(events[i].eid, 'Container')) {
                    if (events[i].etype === 'load') {
                        self.addContainer(events[i].eid);
                    } else if (events[i].etype === 'update') {
                        //TODO: Something fitting..
                    }
                } else if (self.smartClient.isMetaTypeOf(events[i].eid, 'AVMComponentModel')) {
                    if (events[i].etype === 'load') {
                        self.addComponent(events[i].eid);
                    } else if (events[i].etype === 'update') {
                        //TODO: Something fitting, e.g. decrease componentsCount for container.
                    }
                }
            }
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
            if (self.$scope.containers[parentId]) {
                self.$scope.containers[parentId].containersCount += 1;
            }
            container = {
                id: id,
                parentId: parentId,
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
            parentId;

        if (self.smartClient) {
            nodeObj = self.smartClient.client.getNode(id);
            parentId = nodeObj.getParentId();
            if (self.$scope.containers[parentId]) {
                self.$scope.containers[parentId].componentsCount += 1;
            }
            self.$scope.components[id] = {
                id: id,
                parentId: parentId,
                name: nodeObj.getAttribute('name'),
                description: nodeObj.getAttribute('INFO'),
                avmId: nodeObj.getAttribute('ID'),
                date: new Date()
            };
        }
    };

    return DesignSpaceController;
});

