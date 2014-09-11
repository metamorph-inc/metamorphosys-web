/*globals define, console, window*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

define(['../../js/DesertFrontEnd',
        'xmljsonconverter'], function (DesertFrontEnd, Converter) {
    'use strict';

    var configurationSetController,
        TestBenchController = function ($scope, $rootScope, $routeParams, growl, NodeService, DesertCfgSetService) {
            var self = this,
                nodeId = $routeParams.id,
                context = {
                    db: 'my-db-connection-id', // TODO: this needs to be unique for this instance
                    projectId: 'ADMEditor',
                    branchId: 'master',
                    territoryId: 'TestBenchController'
                };

            self.$scope = $scope;
            self.DCSS = DesertCfgSetService;
            self.testBench = {};
            self.NS = NodeService;
            self.context = context;
            self.meta = null;
            console.log('Registering "initialize" event for NS.');
            self.NS.on(self.context, 'initialize', function (currentContext) {
                self.context = currentContext;
                self.context.territoryId = 'TestBenchController';
                console.log('NS initialized...', self.context);
                self.NS.getMetaNodes(self.context)
                    .then(function (metaNodes) {
                        self.meta = metaNodes;
                        self.NS.loadNode2(self.context, nodeId)
                            .then(function (node) {
                                self.initialize(node);
                            });
                    }).catch(function (reason) {
                        console.error(reason);
                    });
            });
        };

    TestBenchController.prototype.initialize = function (testBenchNode) {
        var self = this;
        console.log('test-bench node loaded.');
        //console.log('metaNodes', self.meta);
        self.testBench = {
            id: testBenchNode.getId(),
            name: testBenchNode.getAttribute('name'),
            description: testBenchNode.getAttribute('INFO'),
            parameters: { },
            properties: { },
            metrics: { },
            tlsutId: testBenchNode.getPointer('TopLevelSystemUnderTest').to
        };
        self.tlsut = {
            name: 'N/A',
            cfgSets: { }
        };
        self.$scope.testBench = self.testBench;
        self.$scope.tlsut = self.tlsut;
        testBenchNode.onUpdate(function (id) {
            // this refers to the NodeObj.
            var newName = this.getAttribute('name'),
                newDescr = this.getAttribute('INFO'),
                newTLSUT = this.getPointer('TopLevelSystemUnderTest').to;
            if (newName !== self.testBench.name || newDescr !== self.testBench.description ||
                    newTLSUT !== self.testBench.tlsutId) {
                self.testBench.name = newName;
                self.testBench.description = newDescr;
                if (newTLSUT && newTLSUT !== self.testBench.tlsutId) {
                    self.testBench.tlsutId = newTLSUT;
                    self.DCSS.addCfgSetsWatcher(self.context, self.testBench.tlsutId, self.getUpdateFn(self))
                        .then(function (cfgSets) {
                            self.testBench.cfgSets = cfgSets;
                            self.update();
                        });
                }
                self.update();
            }
        });

        self.update();
        testBenchNode.loadChildren(self.context)
            .then(function (childNodes) {
                var i;
                for (i = 0; i < childNodes.length; i += 1) {
                    self.onImmediateChild(childNodes[i]);
                }
                self.update();
                testBenchNode.onNewChildLoaded(self.context, function (newNode) {
                    self.onImmediateChild(newNode);
                    self.update();
                });
                //self.DCSS.logNodeServiceStatus(self.context);
                if (self.testBench.tlsutId) {
                    self.DCSS.addCfgSetsWatcher(self.context, self.testBench.tlsutId, self.getUpdateFn(self))
                        .then(function (cfgSets) {
                            self.tlsut.cfgSets = cfgSets;
                            console.log('cfgSetsInController', cfgSets);
                            self.update();
                        });
                }
            }).catch(function (reason) {
                console.error(reason);
            });
    };

    TestBenchController.prototype.onImmediateChild = function (node) {
        var self = this;
        if (node.isMetaTypeOf(self.meta.Metric)) {
            self.addMetric(node);
            node.onUnload(self.removeMetric(self));
            node.onUpdate(self.updateMetric(self));
        } else if (node.isMetaTypeOf(self.meta.Property)) {
            // Can be a parameter or a property.
            self.addPropertyType(node);
            node.onUnload(self.removePropertyType(self));
            node.onUpdate(self.updatePropertyType(self));
        }
    };

    /**
     * Adds the metric to the scope-data-model based on data from the node.
     * @param node - Metric node.
     */
    TestBenchController.prototype.addMetric = function (node) {
        var self = this,
            id;
        id = node.getId();
        self.testBench.metrics[id] = {
            id: id,
            name: node.getAttribute('name'),
            description: node.getAttribute('INFO')
        };
    };

    /**
     * Returns a function with access to TestBenchController used on update events.
     * @param self - should be this controller.
     * @returns {Function} - Updates the metric in the scope-data-model.
     */
    TestBenchController.prototype.updateMetric = function (self) {
        return function (id) {
            var metric,
                newName,
                newDesc;
            if (self.testBench.metrics[id]) {
                metric = self.testBench.metrics[id];
                newName = this.getAttribute('name');
                newDesc = this.getAttribute('INFO');
                if (newName !== metric.name || newDesc !== metric.description) {
                    metric.name = newName;
                    metric.description = newDesc;
                    self.update();
                }
            }
        };
    };

    /**
     * Returns a function with access to TestBenchController used on unload event.
     * @param self - should be this controller.
     * @returns {Function} - Removes the metric from the scope-data-model.
     */
    TestBenchController.prototype.removeMetric = function (self) {
        return function (id) {
            if (self.testBench.metrics[id]) {
                delete self.testBench.metrics[id];
                self.update();
            }
        };
    };

    /**
     * Adds either a property or parameter to the scope-data-model based on data from the node.
     * @param node - Property node.
     */
    TestBenchController.prototype.addPropertyType = function (node) {
        var self = this,
            id;
        id = node.getId();
        if (node.getAttribute('ValueType') === 'Parametric') {
            self.testBench.parameters[id] = {
                id: id,
                name: node.getAttribute('name'),
                description: node.getAttribute('INFO'),
                value: node.getAttribute('Value'),
                dataType: node.getAttribute('DataType')
            };
        } else {
            self.testBench.properties[id] = {
                id: id,
                name: node.getAttribute('name'),
                description: node.getAttribute('INFO'),
                value: node.getAttribute('Value'),
                dataType: node.getAttribute('DataType')
            };
        }
    };

    /**
     * Returns a function with access to TestBenchController used on update events.
     * @param self - should be this controller.
     * @returns {Function} - Updates the property/parameter in the scope-data-model.
     */
    TestBenchController.prototype.updatePropertyType = function (self) {
        return function (id) {
            var p,
                typeChanged = false,
                newName,
                newDesc,
                newValue,
                newDataType;

            if (self.testBench.parameters[id]) {
                if (this.getAttribute('ValueType') === 'Parametric') {
                    p = self.testBench.parameters[id];
                } else {
                    typeChanged = true;
                }
            } else if (self.testBench.properties[id]) {
                if (this.getAttribute('ValueType') === 'Fixed') {
                    p = self.testBench.properties[id];
                } else {
                    typeChanged = true;
                }
            }
            // If the ValueType changed, remove the property type and insert it.
            if (typeChanged) {
                self.removePropertyType(self)(id);
                self.addPropertyType(this);
                return;
            }
            newName = this.getAttribute('name');
            newDesc = this.getAttribute('INFO');
            newValue = this.getAttribute('Value');
            newDataType = this.getAttribute('DataType');
            if (newName !== p.name || newDesc !== p.description || newValue !== p.value || newDataType !== p.dataType) {
                p.name = newName;
                p.description = newDesc;
                p.value = newValue;
                p.dataType = newDataType;
                self.update();
            }
        };
    };

    /**
     * Returns a function with access to TestBenchController used on unload event.
     * @param self - should be this controller.
     * @returns {Function} - Removes the property/parameter from the scope-data-model.
     */
    TestBenchController.prototype.removePropertyType = function (self) {
        return function (id) {
            if (self.testBench.parameters[id]) {
                delete self.testBench.parameters[id];
                self.update();
            } else if (self.testBench.properties[id]) {
                delete self.testBench.properties[id];
                self.update();
            }
        };
    };

    TestBenchController.prototype.getUpdateFn = function (self) {
        return function () {
            if (!self.$scope.$$phase) {
                self.$scope.$apply();
            }
        };
    };

    TestBenchController.prototype.update = function () {
        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
    };

    return TestBenchController;
});

