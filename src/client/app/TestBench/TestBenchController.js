/*globals define, console, window*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

define(['../../js/DesertFrontEnd',
        'xmljsonconverter'], function (DesertFrontEnd, Converter) {
    'use strict';

    var TestBenchController = function ($scope, $rootScope, $q, $routeParams, $location, smartClient, Chance, growl, DataStoreService, NodeService) {
        var self = this,
            nodeId = $routeParams.id,
            context = {
                db: 'my-db-connection-id', // TODO: this needs to be unique for this instance
                projectId: 'ADMEditor',
                branchId: 'master',
                territoryId: 'TestBenchController'
            };

        self.$scope = $scope;
        self.testBench = {};
        self.NS = NodeService;
        self.$q = $q;
        self.context = context;
        self.metaNodes = null;
        console.log('Registering "initialize" event for NS.');
        self.NS.on(self.context, 'initialize', function (currentContext) {
            self.context = currentContext;
            self.context.territoryId = 'TestBenchController';
            console.log('NS initialized...', self.context);
            self.NS.getMetaNodes(self.context).then(function (metaNodes) {
                self.metaNodes = metaNodes;
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
        console.log('testbench node loaded.');
        console.log('metaNodes', self.metaNodes);
        self.testBench = {
            id: testBenchNode.getId(),
            name: testBenchNode.getAttribute('name'),
            description: testBenchNode.getAttribute('INFO'),
            properties: { },
            metrics: { },
            tlsut: {}
        };

        self.$scope.testBench = self.testBench;

        testBenchNode.onUpdate(function (id) {
            console.log(self.testBench.name, testBenchNode.getAttribute('name'));
            self.testBench.name = testBenchNode.getAttribute('name');
            console.log(self.testBench.description, testBenchNode.getAttribute('INFO'));
            self.testBench.description = testBenchNode.getAttribute('INFO');
            self.update();
        });

        self.update();
        testBenchNode.loadChildren(self.context).then(function (childNodes) {
            var i;
            for (i = 0; i < childNodes.length; i += 1) {
                self.addMetric(childNodes[i]);
                childNodes[i].onUnload(self.removeMetric(self));
            }
            self.update();
            testBenchNode.onNewChildLoaded(self.context, function (newNode) {
                self.addMetric(newNode);
                newNode.onUnload(self.removeMetric(self));
                self.update();
            });
        }).catch(function (reason) {
            console.error(reason);
        });

    };

    TestBenchController.prototype.addMetric = function (node) {
        var self = this,
            id,
            name;
        name = node.getAttribute('name');
        id = node.getId();
        //console.log(name, id);
        self.testBench.metrics[id] = {
            name: name,
            id: id
        };
    };

    TestBenchController.prototype.removeMetric = function (self) {
        return function (id) {
            delete self.testBench.metrics[id];
            self.update();
        };
    };

    TestBenchController.prototype.update = function () {
        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
    };

    return TestBenchController;
});

