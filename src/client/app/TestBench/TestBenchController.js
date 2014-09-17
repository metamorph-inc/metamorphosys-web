/*globals define, console, window*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

define(['../../js/DesertFrontEnd',
        'xmljsonconverter',
       '../DesertConfigurations/DesertConfigurations'], function (DesertFrontEnd, Converter) {
    'use strict';

//    angular.module('cyphy.ui.testBench', ['cyphy.ui.desertConfigurations']);

    var TestBenchController = function ($scope, $rootScope, $routeParams, growl, NodeService, NodeUtilities, DesertConfigurationServices, smartClient, Chance) {
        var self = this,
            nodeId = $routeParams.id,
            context = {
                db: 'my-db-connection-id',
                projectId: 'ADMEditor',
                branchId: 'master'
            };

        self.$scope = $scope;
        self.DesertConfigurationServices = DesertConfigurationServices;
        self.NS = NodeService;
        self.NodeUtilities = NodeUtilities;
        self.growl = growl;

        self.testBench = {};
        self.context = context;
        self.meta = null;
        self.initListItems();
        if (Chance !== null) {
            self.getTestData(Chance);
            return;
        }
        self.smartClient = smartClient; //TODO: Remove me and use services instead
        self.$scope.$on('$destroy', function () {
            // Clean up spawned regions
            self.DesertConfigurationServices.cleanUp(context);
            // Clean up 'TestBenchController' region.
            self.NS.cleanUpRegion(context);
            self.NS.logContext(context);
        });
        self.NS.on(self.context, 'initialize', function (currentContext) {
            self.context = currentContext;
            console.log('NodeService initialized for context: ', self.context);
            self.context.regionId = (new Date()).toISOString() + 'TestBenchController';
            self.NS.getMetaNodes(self.context)
                .then(function (metaNodes) {
                    self.meta = metaNodes;
                    self.NS.loadNode(self.context, nodeId)
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
            name: 'N/A'
        };
        if (self.testBench.tlsutId) {
            self.addTlsutWatcher(self.testBench.tlsutId);
        }
        self.$scope.testBench = self.testBench;
        self.$scope.tlsut = self.tlsut;

        self.$scope.runTestBench = function (cfgId) {
            self.growl.info('Started executing :', cfgId);
            self.smartClient.runPlugin('TestBenchRunner', { activeNode: self.testBench.id, pluginConfig: {
                'run': true,
                'save': true,
                'configurationPath': cfgId
            }}, function (result) {
                self.growl.info('Execution done!');
                console.log(result);
            });
        };

        testBenchNode.onUpdate(function (id) {
            // this refers to the NodeObj.
            var newName = this.getAttribute('name'),
                newDescr = this.getAttribute('INFO'),
                newTLSUT = this.getPointer('TopLevelSystemUnderTest').to;
            if (newName !== self.testBench.name || newDescr !== self.testBench.description ||
                    newTLSUT !== self.testBench.tlsutId) {
                self.testBench.name = newName;
                self.testBench.description = newDescr;
                if (newTLSUT !== self.testBench.tlsutId) {
                    if (newTLSUT) {
                        self.testBench.tlsutId = newTLSUT;
                        self.DesertConfigurationServices.cleanUp(self.context);
                        self.addTlsutWatcher(self.testBench.tlsutId);
                    } else {
                        self.DesertConfigurationServices.cleanUp(self.context);
                        self.tlsut = { name: 'N/A'};
                        self.NS.logContext(self.context);
                    }
                }
                self.update();
            }
        });

        self.NodeUtilities.getFirstParentOfType(testBenchNode, self.meta.WorkSpace)
            .then(function (workspaceNode) {
                self.$scope.mainNavigator.items = self.getNavigatorStructure(workspaceNode);
                self.$scope.mainNavigator.separator = true;
                self.update();
            })
            .catch(function (reason) {
                console.error(reason);
            });

        testBenchNode.loadChildren(self.context)
            .then(function (childNodes) {
                var i;
                for (i = 0; i < childNodes.length; i += 1) {
                    self.onImmediateChild(childNodes[i]);
                }
                self.update();
                testBenchNode.onNewChildLoaded(function (newNode) {
                    self.onImmediateChild(newNode);
                    self.update();
                });
                self.NS.logContext(self.context);
            })
            .catch(function (reason) {
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

    TestBenchController.prototype.addTlsutWatcher = function (id) {
        var self = this,
            update = function (destroy) {
                if (destroy) {
                    self.DesertConfigurationServices.cleanUp(self.context);
                    populateListDataItems();
                }
            },
            populateListDataItems = function () {
                self.$scope.listData.items = [];
                self.selectedConfigurations = {};
                self.DesertConfigurationServices.addCfgSetsWatcher(self.context, id, update)
                    .then(function (data) {
                        var cfgSetId,
                            getNewItem;
                        self.tlsut.name = data.name;
                        getNewItem = function (id) {
                            return {
                                id         : id,
                                title      : data.cfgSets[id].name,
                                toolTip    : 'Open item',
                                description: data.cfgSets[id].description,
//                        lastUpdated: {
//                            time: self.chance.date({year: (new Date()).getFullYear()}),
//                            user: self.chance.name()
//                        },
//                        stats      : [
//                            {
//                                value    : self.chance.integer({min: 0, max: 5000}),
//                                toolTip  : 'Configuration',
//                                iconClass: 'fa fa-puzzle-piece'
//                            }
//                        ],
                                details    : 'Configurations',
                                detailsTemplateUrl: 'details.html',
                                selectedConfigurations: {}
                            };
                        };
                        for (cfgSetId in data.cfgSets) {
                            if (data.cfgSets.hasOwnProperty(cfgSetId)) {
                                self.$scope.listData.items.push(getNewItem(cfgSetId));
                            }
                        }
                        self.update();
                    });
            };
        populateListDataItems();
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

    TestBenchController.prototype.update = function () {
        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
    };

    TestBenchController.prototype.initListItems = function () {
        var self = this;
        self.$scope.config = {

            sortable          : false,
            secondaryItemMenu : true,
            detailsCollapsible: true,
            showDetailsLabel  : 'Show Configurations',
            hideDetailsLabel  : 'Hide Configurations',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                console.log('Clicked: ' + item);
                //document.location.hash = '/workspaceDetails//' + item.id;
            },

            itemContextmenuRenderer: function (e, item) {
                console.log('Contextmenu was triggered for node:', item);

                return [
                    {
                        items: [
                            {
                                id: 'runSelectedConfigurations',
                                label: 'Run selected configurations',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-expand',
                                actionData: {},
                                action: function () {
                                    var key,
                                        cfgIds = [];
                                    if (item.selectedConfigurations) {
                                        for (key in item.selectedConfigurations) {
                                            if (item.selectedConfigurations === true) {
                                                cfgIds.push(key);
                                            }
                                        }
                                        if (cfgIds.length > 0) {
                                            self.growl.info(cfgIds.toString());
                                        } else {
                                            self.growl.error('No configurations selected!');
                                        }
                                    } else {
                                        self.growl.error('No configurations selected!');
                                    }
                                }
                            }
                        ]
                    }
//                            },
//                            {
//                                //label: 'Extra',
//                                items: [
//
//                                    {
//                                        id       : 'delete',
//                                        label    : 'Delete',
//                                        disabled : false,
//                                        iconClass: 'fa fa-plus'
//                                    }
//                                ]
//                            }
                ];
            },

            detailsRenderer: function (item) {
                item.details = 'My details are here now!';
            },

            filter: {
            }
        };

        self.$scope.listData = {
            items: []
        };
    };

    TestBenchController.prototype.getTestData = function (Chance) {
        var self = this,
            i,
            chance,
            itemGenerator;

        chance = Chance ? new Chance() : null;

        itemGenerator = function (id) {
            return {
                id         : id,
                title      : chance.name(),
                toolTip    : 'Open item',
                description: chance.sentence(),
                lastUpdated: {
                    time: chance.date({year: (new Date()).getFullYear()}),
                    user: chance.name()

                },
                stats      : [
                    {
                        value    : chance.integer({min: 0, max: 5000}),
                        toolTip  : 'Configuration',
                        iconClass: 'fa fa-puzzle-piece'
                    }
                ],
                details    : 'Some detailed text. Lorem ipsum ama fea rin the poc ketofmyja cket.',
                detailsTemplateUrl: 'details.html'

            };
        };

        for (i = 0; i < chance.integer({min: 0, max: 30}); i += 1) {
            self.$scope.listData.items.push(itemGenerator(i));
        }

        self.update();
    };

    TestBenchController.prototype.getNavigatorStructure = function (workspaceNode) {
        var self = this,
            firstMenu,
            secondMenu,
            thirdMenu;

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
            label: workspaceNode.getAttribute('name'),
            itemClass: 'workspace',
            action: function () {
                window.location.href = '#/workspaceDetails/' + workspaceNode.getId();
            },
            actionData: {},
            menu: []
        };

        thirdMenu = {
            id: 'designSpace',
            label: self.testBench.name,
            itemClass: 'designSpace',
            menu: [{
                id: 'editor',
                items: [
                    {
                        id: 'open',
                        label: 'Open in editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        action: function () {
                            window.open('/?project=ADMEditor&activeObject=' + self.testBench.id, '_blank');
                        },
                        actionData: {}
                    }
                ]
            }]
        };

        return [ firstMenu, secondMenu, thirdMenu];
    };

    return TestBenchController;
});

