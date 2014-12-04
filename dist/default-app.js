(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console, window, require*/

var CyPhyApp = angular.module('CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.default.templates'
])
    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';
        // For any unmatched url, redirect to /workspaces
        $urlRouterProvider.otherwise('/workspaces');
        //
        // Now set up the states
        $stateProvider
            .state('index', {
                url: "/index"
            })
            .state('workspaces', {
                url: "/workspaces",
                templateUrl: "/default/templates/Workspaces.html",
                controller: "WorkspacesController"
            })
            .state('workspaceDetails', {
                url: "/workspaceDetails/:workspaceId",
                templateUrl: "/default/templates/WorkspaceDetails.html",
                controller: "WorkspaceDetailsController"
            })
            .state('designSpace', {
                url: "/designSpace/:workspaceId/:designId",
                templateUrl: "/default/templates/DesignSpace.html",
                controller: "DesignSpaceController"
            })
            .state('testBench', {
                url: "/testBench/:workspaceId/:testBenchId",
                templateUrl: "/default/templates/TestBench.html",
                controller: "TestBenchController"
            });
    })
    .controller('MainNavigatorController', function ($rootScope, $scope) {
        'use strict';
        $scope.navigator = {};
        $scope.navigator.items = [{
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root'
        }];
        $rootScope.mainNavigator = $scope.navigator;
    })
    .run(function ($state, growl, dataStoreService, projectService) {
        'use strict';
        var connectionId = 'my-db-connection-id';

        dataStoreService.connectToDatabase(connectionId, {host: window.location.basename})
            .then(function () {
                // select default project and branch (master)
                return projectService.selectProject(connectionId, 'ADMEditor');
            })
            .catch(function (reason) {
                growl.error('ADMEditor does not exist. Create and import it using the <a href="' +
                    window.location.origin + '"> webgme interface</a>.');
                console.error(reason);
            });
    });


require('./views/Workspaces/WorkspacesController');
require('./views/WorkspaceDetails/WorkspaceDetailsController');
require('./views/DesignSpace/DesignSpaceController');
require('./views/TestBench/TestBenchController');
},{"./views/DesignSpace/DesignSpaceController":2,"./views/TestBench/TestBenchController":3,"./views/WorkspaceDetails/WorkspaceDetailsController":4,"./views/Workspaces/WorkspacesController":5}],2:[function(require,module,exports){
/*globals angular, console */

angular.module('CyPhyApp')
    .controller('DesignSpaceController', function ($scope, $state, $timeout, $modal, $location, $q, growl, desertService, designService) {
        'use strict';
        var self = this,
            context,
            meta,
            workspaceId = $state.params.workspaceId.replace(/-/g, '/'),
            designId = $state.params.designId.replace(/-/g, '/'),
            saveConfigurations,
            generateDashboard,
            cleanUpConfigurations = function () {
                var i,
                    config;
                for (i = 0; i < $scope.dataModels.configurations.length; i += 1) {
                    config = $scope.dataModels.configurations[i];
                    if (config.hasOwnProperty('regionId')) {
                        designService.cleanUpRegion(context, config.regionId);
                    }
                }
                $scope.state.resultsAvaliable = false;
                $scope.dataModels.configurations = [];
            };

        console.log('DesignSpaceController');
        $scope.connectionId = 'my-db-connection-id';
        $scope.workspaceId = workspaceId;
        $scope.designId = designId;

        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'DesignSpaceController' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                designService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        $scope.state = {
            designTreeLoaded: false,
            desertInputAvaliable: false,
            configurationStatus: 'Select an action above...',
            hasComponents: true,
            savingConfigurations: false,
            resultsAvaliable: false
        };

        $scope.dataModels = {
            avmIds: {},
            desertInput: {},
            configurations: [],
            setName: null,
            design: {
                name: 'Loading design...'
            }
        };

        $scope.$on('designTreeLoaded', function (event, data) {
            $scope.dataModels.avmIds = data;
            $scope.state.hasComponents = Object.keys(data).length > 0;
            $scope.state.designTreeLoaded = true;
        });

        $scope.$on('selectedInstances', function (event, data) {
            growl.info(data.name + ' has ' + data.ids.length + ' instance(s).');
            $scope.$broadcast('setSelectedNodes', data.ids);
        });

        $scope.$on('configurationClicked', function (event, data) {
            var i,
                ids = [];
            for (i = 0; i < data.alternativeAssignments.length; i += 1) {
                ids.push(data.alternativeAssignments[i].selectedAlternative);
            }
            $scope.$broadcast('setSelectedNodes', ids);
        });

        $scope.$on('desertInputReady', function (event, data) {
            $scope.dataModels.desertInput = data;
            $scope.state.desertInputAvaliable = true;
            console.log(data);
        });

        $scope.$on('configurationsLoaded', function (event, data) {
            cleanUpConfigurations();
            $timeout(function () {
                var i,
                    queueList = [];
                $scope.dataModels.setName = data.setName;
                $scope.dataModels.configurations = data.configurations;
                if (data.configurations.length === 0) {
                    growl.warning('There were no configurations in ' + data.setName);
                    $scope.state.configurationStatus = 'Select an action above...';
                }
                for (i = 0; i < $scope.dataModels.configurations.length; i += 1) {
                    queueList.push(designService.appendWatchResults(context, $scope.dataModels.configurations[i]));
                }
                $q.all(queueList)
                    .then(function (hasResults) {
                        hasResults.map(function (res) {
                            if (res === true) {
                                $scope.state.resultsAvaliable = true;
                            }
                        });
                    });
            });
        });

        $scope.calculateConfigurations = function () {
            growl.info('Calculating configurations. Please wait..');
            $scope.state.configurationStatus = 'Calculating..';
            cleanUpConfigurations();
            desertService.calculateConfigurations($scope.dataModels.desertInput)
                .then(function (configurations) {
                    $scope.dataModels.configurations = configurations;
                    $scope.dataModels.setName = 'calculated';
                    $scope.state.configurationStatus = 'Calculated';
                })
                .catch(function (reason) {
                    console.error(reason);
                    growl.error('Failed to calculate configurations, see console for more info.');
                    $scope.dataModels.configurations = [];
                    $scope.dataModels.setName = '';
                    $scope.state.configurationStatus = 'Failed to calculate.';
                });
        };

        $scope.saveConfigurations = function () {
            $scope.$broadcast('exposeSelection', 'save');
        };

        saveConfigurations = function (configurations) {
            var modalInstance;
            if (configurations.length < 1) {
                growl.warning('No selected configurations!');
                return;
            }
            $scope.state.savingConfigurations = true;
            modalInstance = $modal.open({
                templateUrl: '/default/templates/SaveConfigurationSet.html',
                controller: 'SaveConfigurationSetController',
                //size: size,
                resolve: { data: function () {
                    return {
                        configurations: configurations,
                        meta: meta,
                        context: context,
                        designNode: $scope.dataModels.design.node
                    };
                } }
            });
            modalInstance.result.then(function (result) {
                $scope.state.savingConfigurations = false;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.generateDashboard = function () {
            $scope.$broadcast('exposeSelection', 'dashboard');
        };

        generateDashboard = function (configurations) {
            var i,
                key,
                resultIds = [];
            for (i = 0; i < configurations.length; i += 1) {
                for (key in configurations[i].results) {
                    if (configurations[i].results.hasOwnProperty(key)) {
                        resultIds.push(key);
                    }
                }
            }
            if (resultIds.length > 0) {
                growl.info('Generating dashboard for ' + resultIds.length + ' results.');
                designService.generateDashboard(context, $scope.designId, resultIds)
                    .then(function (resultLight) {
                        var k;
                        if (resultLight.success) {
                            growl.success('Dashboard generated ' + resultLight.artifactsHtml, {ttl: -1});
                        } else {
                            growl.error('Dashboard generation failed.');
                            for (k = 0; k < resultLight.messages.length; k += 1) {
                                if (growl.hasOwnProperty(resultLight.messages[k].severity)) {
                                    growl[resultLight.messages[k].severity](resultLight.messages[k].message);
                                } else {
                                    growl.warning(resultLight.messages[k].message);
                                }
                            }
                        }
                    })
                    .catch(function (reason) {
                        console.error(reason);
                        growl.error('Dashboard generation failed.');
                    });
            } else {
                growl.warning('No results in selected configurations!');
            }
        };

        $scope.$on('selectionExposed', function (event, data, eType) {
            if (eType === 'save') {
                saveConfigurations(data);
            } else if (eType === 'dashboard') {
                generateDashboard(data);
            }
        });

        designService.registerWatcher(context, function (destroyed) {

            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            designService.watchDesignNode(context, $scope.designId, function (updateObject) {
                console.warn(updateObject);
                if (updateObject.type === 'load') {
                    console.warn('Load shouldnt happen');
                } else if (updateObject.type === 'update') {
                    $scope.dataModels.design = updateObject.data;
                } else if (updateObject.type === 'unload') {
                    growl.warning('Design Node was removed!');
                    $location.path('/workspaceDetails/' + workspaceId.replace(/\//g, '-'));
                } else {
                    throw new Error(updateObject);
                }
            })
                .then(function (data) {
                    $scope.dataModels.design = data.design;
                    meta = data.meta;
                });
        });
    })
    .controller('SaveConfigurationSetController', function ($scope, $modalInstance, $timeout, growl, data, designService) {
        'use strict';
        var configurations = data.configurations,
            meta = data.meta,
            designNode = data.designNode,
            context = data.context;
        $scope.data = {
            description: null,
            name: null,
            nbrOfConfigurations: configurations.length
        };

        $scope.ok = function () {
            if (!$scope.data.name) {
                growl.warning('You must provide a name!');
                return;
            }
            growl.info('Saving configuration set ' + $scope.data.name + 'this may take a while...');
            designService.callSaveDesertConfigurations(context, $scope.data.name, $scope.data.description, configurations,
                designNode.getId())
                .then(function () {
                    growl.success('Configurations saved to ' + $scope.data.name);
                    $modalInstance.close($scope.data);
                });
//            designService.saveConfigurationSet($scope.data.name, $scope.data.description, configurations,
//                designNode, meta)
//                .then(function () {
//                    growl.success('Configurations saved to ' + $scope.data.name);
//                    $modalInstance.close($scope.data);
//                });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
},{}],3:[function(require,module,exports){
/*globals angular, console */

angular.module('CyPhyApp')
    .controller('TestBenchController', function ($scope, $state, $timeout, $location, growl, testBenchService) {
        'use strict';
        var self = this,
            context = {
                db: 'my-db-connection-id'
            },
            workspaceId = $state.params.workspaceId.replace(/-/g, '/'),
            testBenchId = $state.params.testBenchId.replace(/-/g, '/');

        console.log('TestBenchController');
        $scope.connectionId = context.db;

        $scope.workspaceId = workspaceId;
        $scope.testBenchId = testBenchId;

        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'TestBenchController' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                testBenchService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        $scope.state = {
            configurationStatus: 'Select a Top Level System Under Test...',
            designId: null
        };

        $scope.dataModels = {
            testBench: {
                name: 'Loading test-bench..'
            },
            configurations: [],
            setName: null
        };

        $scope.$on('configurationsLoaded', function (event, data) {
            $scope.dataModels.configurations = [];
            $timeout(function () {
                $scope.dataModels.configurations = data.configurations;
                $scope.dataModels.setName = data.setName;
                if (data.configurations.length === 0) {
                    growl.warning('There were no configurations in ' + data.setName);
                    $scope.state.configurationStatus = 'Select an action above...';
                }
            });
        });

        $scope.$on('topLevelSystemUnderTestSet', function (event, newListItem, oldListItem) {
            if ($scope.dataModels.testBench.node) {
                if ($scope.dataModels.testBench.tlsutId === newListItem.id) {
                    growl.info('Design space is already set as Top Level System Under Test.');
                } else {
                    $scope.dataModels.testBench.tlsutId = null;
                    $timeout(function () {
                        $scope.dataModels.testBench.tlsutId = newListItem.id;
                        newListItem.cssClass = 'top-level-system-under-test';
                        if (oldListItem) {
                            oldListItem.cssClass = '';
                        }
                        $scope.dataModels.testBench.node.makePointer('TopLevelSystemUnderTest', newListItem.id);
                    });
                }
                //$scope.state.designId = newListItem.id;
                console.log('topLevelSystemUnderTestSet', newListItem, oldListItem);
            } else {
                growl.warning('Can not set TLSUT while test-bench has not been loaded.');
            }
        });

        $scope.$on('selectionExposed', function (event, configurations) {
            var i,
                configuration,
                numCfgs = configurations.length,
                invokeTestBenchRunner = function (configuration) {
                    testBenchService.runTestBench(context, testBenchId, configuration.id)
                        .then(function (resultLight) {
                            var j;
                            if (resultLight.success) {
                                growl.success('TestBench run successfully on ' + configuration.name + '.' +
                                    resultLight.artifactsHtml, {ttl: -1});
                            } else {
                                growl.error('TestBench run failed on ' + configuration.name + '.' +
                                    resultLight.artifactsHtml, {ttl: -1});
                                for (j = 0; j < resultLight.messages.length; j += 1) {
                                    if (growl.hasOwnProperty(resultLight.messages[j].severity)) {
                                        growl[resultLight.messages[j].severity](resultLight.messages[j].message);
                                    } else {
                                        growl.warning(resultLight.messages[j].message);
                                    }
                                }
                            }
                        })
                        .catch(function (reason) {
                            console.error(reason);
                            growl.error('Running test-bench failed.');
                        });
                };
            if (numCfgs < 1) {
                growl.warning('No selected configurations!');
                return;
            }

            for (i = 0; i < numCfgs; i += 1) {
                configuration = configurations[i];
                growl.info('Test-bench started on ' + configuration.name + ' [' + (i + 1).toString() + '/' + numCfgs + ']');
                invokeTestBenchRunner(configuration);
            }
        });

        $scope.runTestBench = function () {
            $scope.$broadcast('exposeSelection');
        };

        testBenchService.registerWatcher(context, function (destroyed) {

            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            testBenchService.watchTestBenchNode(context, $scope.testBenchId, function (updateObject) {
                console.warn(updateObject);
                if (updateObject.type === 'load') {
                    console.warn('Load should not happen');
                } else if (updateObject.type === 'update') {
                    $scope.dataModels.testBench = updateObject.data;
                    if (updateObject.tlsutChanged) {
                        $scope.$broadcast('topLevelSystemUnderTestChanged', $scope.dataModels.testBench.tlsutId);
                    }
                } else if (updateObject.type === 'unload') {
                    growl.warning('Test Bench was removed!');
                    $location.path('/workspaceDetails/' + workspaceId.replace(/\//g, '-'));
                } else {
                    throw new Error(updateObject);
                }
            })
                .then(function (data) {
                    $scope.dataModels.testBench = data.testBench;
                    if (data.testBench.tlsutId) {
                        $scope.$broadcast('topLevelSystemUnderTestChanged', data.testBench.tlsutId);
                    }
                });
        });
    });
},{}],4:[function(require,module,exports){
/*globals angular, console */

angular.module('CyPhyApp')
    .controller('WorkspaceDetailsController', function ($rootScope, $scope, $window, $state) {
        'use strict';
        var workspaceId = $state.params.workspaceId.replace(/-/g, '/');
        console.log('WorkspaceDetailsController', workspaceId);
        $scope.dataModel = {
            workspaceId: workspaceId
        };
        $rootScope.mainNavigator.items = [{
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root',
            menu: [{
                id: 'editor',
                items: [
                    {
                        id: 'open',
                        label: 'Open in editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        action: function () {
                            $window.open('/?project=ADMEditor', '_blank');
                        },
                        actionData: {}
                    }
                ]
            }]
        }];
        $rootScope.mainNavigator.separator = false;
        //debugger;
    });
},{}],5:[function(require,module,exports){
/*globals angular, console */

angular.module('CyPhyApp')
    .controller('WorkspacesController', function ($rootScope, $window) {
        'use strict';
        console.log('WorkspacesController');
        $rootScope.mainNavigator.items = [{
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root',
            menu: [{
                id: 'editor',
                items: [
                    {
                        id: 'open',
                        label: 'Open in editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        action: function () {
                            $window.open('/?project=ADMEditor', '_blank');
                        },
                        actionData: {}
                    }
                ]
            }]
        }];
        $rootScope.mainNavigator.separator = false;
    });
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvZGVmYXVsdC9hcHAuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL3dlYmN5cGh5L3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvRGVzaWduU3BhY2UvRGVzaWduU3BhY2VDb250cm9sbGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy93ZWJjeXBoeS93ZWJnbWUtY3lwaHkvc3JjL2FwcC9kZWZhdWx0L3ZpZXdzL1Rlc3RCZW5jaC9UZXN0QmVuY2hDb250cm9sbGVyLmpzIiwiL1VzZXJzL2xhc3psb2p1cmFjei9Qcm9qZWN0cy93ZWJjeXBoeS93ZWJnbWUtY3lwaHkvc3JjL2FwcC9kZWZhdWx0L3ZpZXdzL1dvcmtzcGFjZURldGFpbHMvV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXIuanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL3dlYmN5cGh5L3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIHdpbmRvdywgcmVxdWlyZSovXG5cbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcbiAgICAndWkucm91dGVyJyxcblxuICAgICdnbWUuc2VydmljZXMnLFxuXG4gICAgJ2lzaXMudWkuY29tcG9uZW50cycsXG5cbiAgICAnY3lwaHkuY29tcG9uZW50cycsXG5cbiAgICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXG4gICAgJ2N5cGh5LmRlZmF1bHQudGVtcGxhdGVzJ1xuXSlcbiAgICAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgLy8gRm9yIGFueSB1bm1hdGNoZWQgdXJsLCByZWRpcmVjdCB0byAvd29ya3NwYWNlc1xuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvd29ya3NwYWNlcycpO1xuICAgICAgICAvL1xuICAgICAgICAvLyBOb3cgc2V0IHVwIHRoZSBzdGF0ZXNcbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgICAgIC5zdGF0ZSgnaW5kZXgnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiBcIi9pbmRleFwiXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd3b3Jrc3BhY2VzJywge1xuICAgICAgICAgICAgICAgIHVybDogXCIvd29ya3NwYWNlc1wiLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9Xb3Jrc3BhY2VzLmh0bWxcIixcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIldvcmtzcGFjZXNDb250cm9sbGVyXCJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ3dvcmtzcGFjZURldGFpbHMnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiBcIi93b3Jrc3BhY2VEZXRhaWxzLzp3b3Jrc3BhY2VJZFwiLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9Xb3Jrc3BhY2VEZXRhaWxzLmh0bWxcIixcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIldvcmtzcGFjZURldGFpbHNDb250cm9sbGVyXCJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ2Rlc2lnblNwYWNlJywge1xuICAgICAgICAgICAgICAgIHVybDogXCIvZGVzaWduU3BhY2UvOndvcmtzcGFjZUlkLzpkZXNpZ25JZFwiLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9EZXNpZ25TcGFjZS5odG1sXCIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJEZXNpZ25TcGFjZUNvbnRyb2xsZXJcIlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgndGVzdEJlbmNoJywge1xuICAgICAgICAgICAgICAgIHVybDogXCIvdGVzdEJlbmNoLzp3b3Jrc3BhY2VJZC86dGVzdEJlbmNoSWRcIixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvVGVzdEJlbmNoLmh0bWxcIixcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIlRlc3RCZW5jaENvbnRyb2xsZXJcIlxuICAgICAgICAgICAgfSk7XG4gICAgfSlcbiAgICAuY29udHJvbGxlcignTWFpbk5hdmlnYXRvckNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgJHNjb3BlLm5hdmlnYXRvciA9IHt9O1xuICAgICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gW3tcbiAgICAgICAgICAgIGlkOiAncm9vdCcsXG4gICAgICAgICAgICBsYWJlbDogJ0FETUVkaXRvcicsXG4gICAgICAgICAgICBpdGVtQ2xhc3M6ICdjeXBoeS1yb290J1xuICAgICAgICB9XTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yID0gJHNjb3BlLm5hdmlnYXRvcjtcbiAgICB9KVxuICAgIC5ydW4oZnVuY3Rpb24gKCRzdGF0ZSwgZ3Jvd2wsIGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbm5lY3Rpb25JZCA9ICdteS1kYi1jb25uZWN0aW9uLWlkJztcblxuICAgICAgICBkYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKGNvbm5lY3Rpb25JZCwge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gc2VsZWN0IGRlZmF1bHQgcHJvamVjdCBhbmQgYnJhbmNoIChtYXN0ZXIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoY29ubmVjdGlvbklkLCAnQURNRWRpdG9yJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICBncm93bC5lcnJvcignQURNRWRpdG9yIGRvZXMgbm90IGV4aXN0LiBDcmVhdGUgYW5kIGltcG9ydCBpdCB1c2luZyB0aGUgPGEgaHJlZj1cIicgK1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJ1wiPiB3ZWJnbWUgaW50ZXJmYWNlPC9hPi4nKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcblxuXG5yZXF1aXJlKCcuL3ZpZXdzL1dvcmtzcGFjZXMvV29ya3NwYWNlc0NvbnRyb2xsZXInKTtcbnJlcXVpcmUoJy4vdmlld3MvV29ya3NwYWNlRGV0YWlscy9Xb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicpO1xucmVxdWlyZSgnLi92aWV3cy9EZXNpZ25TcGFjZS9EZXNpZ25TcGFjZUNvbnRyb2xsZXInKTtcbnJlcXVpcmUoJy4vdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXInKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxuICAgIC5jb250cm9sbGVyKCdEZXNpZ25TcGFjZUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICR0aW1lb3V0LCAkbW9kYWwsICRsb2NhdGlvbiwgJHEsIGdyb3dsLCBkZXNlcnRTZXJ2aWNlLCBkZXNpZ25TZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIG1ldGEsXG4gICAgICAgICAgICB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSgvLS9nLCAnLycpLFxuICAgICAgICAgICAgZGVzaWduSWQgPSAkc3RhdGUucGFyYW1zLmRlc2lnbklkLnJlcGxhY2UoLy0vZywgJy8nKSxcbiAgICAgICAgICAgIHNhdmVDb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgIGdlbmVyYXRlRGFzaGJvYXJkLFxuICAgICAgICAgICAgY2xlYW5VcENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICBjb25maWc7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8ICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9ICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmhhc093blByb3BlcnR5KCdyZWdpb25JZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29uZmlnLnJlZ2lvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUucmVzdWx0c0F2YWxpYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gW107XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXNpZ25TcGFjZUNvbnRyb2xsZXInKTtcbiAgICAgICAgJHNjb3BlLmNvbm5lY3Rpb25JZCA9ICdteS1kYi1jb25uZWN0aW9uLWlkJztcbiAgICAgICAgJHNjb3BlLndvcmtzcGFjZUlkID0gd29ya3NwYWNlSWQ7XG4gICAgICAgICRzY29wZS5kZXNpZ25JZCA9IGRlc2lnbklkO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25TcGFjZUNvbnRyb2xsZXInICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGRlc2lnblRyZWVMb2FkZWQ6IGZhbHNlLFxuICAgICAgICAgICAgZGVzZXJ0SW5wdXRBdmFsaWFibGU6IGZhbHNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvblN0YXR1czogJ1NlbGVjdCBhbiBhY3Rpb24gYWJvdmUuLi4nLFxuICAgICAgICAgICAgaGFzQ29tcG9uZW50czogdHJ1ZSxcbiAgICAgICAgICAgIHNhdmluZ0NvbmZpZ3VyYXRpb25zOiBmYWxzZSxcbiAgICAgICAgICAgIHJlc3VsdHNBdmFsaWFibGU6IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMgPSB7XG4gICAgICAgICAgICBhdm1JZHM6IHt9LFxuICAgICAgICAgICAgZGVzZXJ0SW5wdXQ6IHt9LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgc2V0TmFtZTogbnVsbCxcbiAgICAgICAgICAgIGRlc2lnbjoge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdMb2FkaW5nIGRlc2lnbi4uLidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuJG9uKCdkZXNpZ25UcmVlTG9hZGVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5hdm1JZHMgPSBkYXRhO1xuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmhhc0NvbXBvbmVudHMgPSBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPiAwO1xuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmRlc2lnblRyZWVMb2FkZWQgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuJG9uKCdzZWxlY3RlZEluc3RhbmNlcycsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgZ3Jvd2wuaW5mbyhkYXRhLm5hbWUgKyAnIGhhcyAnICsgZGF0YS5pZHMubGVuZ3RoICsgJyBpbnN0YW5jZShzKS4nKTtcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzZXRTZWxlY3RlZE5vZGVzJywgZGF0YS5pZHMpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuJG9uKCdjb25maWd1cmF0aW9uQ2xpY2tlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgaWRzID0gW107XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgaWRzLnB1c2goZGF0YS5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzW2ldLnNlbGVjdGVkQWx0ZXJuYXRpdmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3NldFNlbGVjdGVkTm9kZXMnLCBpZHMpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuJG9uKCdkZXNlcnRJbnB1dFJlYWR5JywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5kZXNlcnRJbnB1dCA9IGRhdGE7XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuZGVzZXJ0SW5wdXRBdmFsaWFibGUgPSB0cnVlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS4kb24oJ2NvbmZpZ3VyYXRpb25zTG9hZGVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICBjbGVhblVwQ29uZmlndXJhdGlvbnMoKTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9IGRhdGEuc2V0TmFtZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IGRhdGEuY29uZmlndXJhdGlvbnM7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuY29uZmlndXJhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ1RoZXJlIHdlcmUgbm8gY29uZmlndXJhdGlvbnMgaW4gJyArIGRhdGEuc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ1NlbGVjdCBhbiBhY3Rpb24gYWJvdmUuLi4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2goZGVzaWduU2VydmljZS5hcHBlbmRXYXRjaFJlc3VsdHMoY29udGV4dCwgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGhhc1Jlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc1Jlc3VsdHMubWFwKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5yZXN1bHRzQXZhbGlhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmNhbGN1bGF0ZUNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3Jvd2wuaW5mbygnQ2FsY3VsYXRpbmcgY29uZmlndXJhdGlvbnMuIFBsZWFzZSB3YWl0Li4nKTtcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ0NhbGN1bGF0aW5nLi4nO1xuICAgICAgICAgICAgY2xlYW5VcENvbmZpZ3VyYXRpb25zKCk7XG4gICAgICAgICAgICBkZXNlcnRTZXJ2aWNlLmNhbGN1bGF0ZUNvbmZpZ3VyYXRpb25zKCRzY29wZS5kYXRhTW9kZWxzLmRlc2VydElucHV0KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb25maWd1cmF0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IGNvbmZpZ3VyYXRpb25zO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gJ2NhbGN1bGF0ZWQnO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuY29uZmlndXJhdGlvblN0YXR1cyA9ICdDYWxjdWxhdGVkJztcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ0ZhaWxlZCB0byBjYWxjdWxhdGUgY29uZmlndXJhdGlvbnMsIHNlZSBjb25zb2xlIGZvciBtb3JlIGluZm8uJyk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gW107XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnNldE5hbWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnRmFpbGVkIHRvIGNhbGN1bGF0ZS4nO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zYXZlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnZXhwb3NlU2VsZWN0aW9uJywgJ3NhdmUnKTtcbiAgICAgICAgfTtcblxuICAgICAgICBzYXZlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoY29uZmlndXJhdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb25zLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdObyBzZWxlY3RlZCBjb25maWd1cmF0aW9ucyEnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuc2F2aW5nQ29uZmlndXJhdGlvbnMgPSB0cnVlO1xuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9kZWZhdWx0L3RlbXBsYXRlcy9TYXZlQ29uZmlndXJhdGlvblNldC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2F2ZUNvbmZpZ3VyYXRpb25TZXRDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICAvL3NpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogeyBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uczogY29uZmlndXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRhOiBtZXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGU6ICRzY29wZS5kYXRhTW9kZWxzLmRlc2lnbi5ub2RlXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5zYXZpbmdDb25maWd1cmF0aW9ucyA9IGZhbHNlO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5nZW5lcmF0ZURhc2hib2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdleHBvc2VTZWxlY3Rpb24nLCAnZGFzaGJvYXJkJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZ2VuZXJhdGVEYXNoYm9hcmQgPSBmdW5jdGlvbiAoY29uZmlndXJhdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICByZXN1bHRJZHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb25maWd1cmF0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGNvbmZpZ3VyYXRpb25zW2ldLnJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb25zW2ldLnJlc3VsdHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0SWRzLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHRJZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGdyb3dsLmluZm8oJ0dlbmVyYXRpbmcgZGFzaGJvYXJkIGZvciAnICsgcmVzdWx0SWRzLmxlbmd0aCArICcgcmVzdWx0cy4nKTtcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmdlbmVyYXRlRGFzaGJvYXJkKGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgcmVzdWx0SWRzKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0TGlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdExpZ2h0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdEYXNoYm9hcmQgZ2VuZXJhdGVkICcgKyByZXN1bHRMaWdodC5hcnRpZmFjdHNIdG1sLCB7dHRsOiAtMX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignRGFzaGJvYXJkIGdlbmVyYXRpb24gZmFpbGVkLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCByZXN1bHRMaWdodC5tZXNzYWdlcy5sZW5ndGg7IGsgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3Jvd2wuaGFzT3duUHJvcGVydHkocmVzdWx0TGlnaHQubWVzc2FnZXNba10uc2V2ZXJpdHkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bFtyZXN1bHRMaWdodC5tZXNzYWdlc1trXS5zZXZlcml0eV0ocmVzdWx0TGlnaHQubWVzc2FnZXNba10ubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKHJlc3VsdExpZ2h0Lm1lc3NhZ2VzW2tdLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ0Rhc2hib2FyZCBnZW5lcmF0aW9uIGZhaWxlZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ05vIHJlc3VsdHMgaW4gc2VsZWN0ZWQgY29uZmlndXJhdGlvbnMhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLiRvbignc2VsZWN0aW9uRXhwb3NlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSwgZVR5cGUpIHtcbiAgICAgICAgICAgIGlmIChlVHlwZSA9PT0gJ3NhdmUnKSB7XG4gICAgICAgICAgICAgICAgc2F2ZUNvbmZpZ3VyYXRpb25zKGRhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlVHlwZSA9PT0gJ2Rhc2hib2FyZCcpIHtcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZURhc2hib2FyZChkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVzaWduU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xuXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xuXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWduTm9kZShjb250ZXh0LCAkc2NvcGUuZGVzaWduSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0xvYWQgc2hvdWxkbnQgaGFwcGVuJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuZGVzaWduID0gdXBkYXRlT2JqZWN0LmRhdGE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnRGVzaWduIE5vZGUgd2FzIHJlbW92ZWQhJyk7XG4gICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvd29ya3NwYWNlRGV0YWlscy8nICsgd29ya3NwYWNlSWQucmVwbGFjZSgvXFwvL2csICctJykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuZGVzaWduID0gZGF0YS5kZXNpZ247XG4gICAgICAgICAgICAgICAgICAgIG1ldGEgPSBkYXRhLm1ldGE7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLmNvbnRyb2xsZXIoJ1NhdmVDb25maWd1cmF0aW9uU2V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCAkdGltZW91dCwgZ3Jvd2wsIGRhdGEsIGRlc2lnblNlcnZpY2UpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgY29uZmlndXJhdGlvbnMgPSBkYXRhLmNvbmZpZ3VyYXRpb25zLFxuICAgICAgICAgICAgbWV0YSA9IGRhdGEubWV0YSxcbiAgICAgICAgICAgIGRlc2lnbk5vZGUgPSBkYXRhLmRlc2lnbk5vZGUsXG4gICAgICAgICAgICBjb250ZXh0ID0gZGF0YS5jb250ZXh0O1xuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBudWxsLFxuICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgIG5ick9mQ29uZmlndXJhdGlvbnM6IGNvbmZpZ3VyYXRpb25zLmxlbmd0aFxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghJHNjb3BlLmRhdGEubmFtZSkge1xuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ1lvdSBtdXN0IHByb3ZpZGUgYSBuYW1lIScpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdyb3dsLmluZm8oJ1NhdmluZyBjb25maWd1cmF0aW9uIHNldCAnICsgJHNjb3BlLmRhdGEubmFtZSArICd0aGlzIG1heSB0YWtlIGEgd2hpbGUuLi4nKTtcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2FsbFNhdmVEZXNlcnRDb25maWd1cmF0aW9ucyhjb250ZXh0LCAkc2NvcGUuZGF0YS5uYW1lLCAkc2NvcGUuZGF0YS5kZXNjcmlwdGlvbiwgY29uZmlndXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgZGVzaWduTm9kZS5nZXRJZCgpKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnQ29uZmlndXJhdGlvbnMgc2F2ZWQgdG8gJyArICRzY29wZS5kYXRhLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgkc2NvcGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4vLyAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uuc2F2ZUNvbmZpZ3VyYXRpb25TZXQoJHNjb3BlLmRhdGEubmFtZSwgJHNjb3BlLmRhdGEuZGVzY3JpcHRpb24sIGNvbmZpZ3VyYXRpb25zLFxuLy8gICAgICAgICAgICAgICAgZGVzaWduTm9kZSwgbWV0YSlcbi8vICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbi8vICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdDb25maWd1cmF0aW9ucyBzYXZlZCB0byAnICsgJHNjb3BlLmRhdGEubmFtZSk7XG4vLyAgICAgICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoJHNjb3BlLmRhdGEpO1xuLy8gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xuICAgICAgICB9O1xuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXG5cbmFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ1Rlc3RCZW5jaENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICR0aW1lb3V0LCAkbG9jYXRpb24sIGdyb3dsLCB0ZXN0QmVuY2hTZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBkYjogJ215LWRiLWNvbm5lY3Rpb24taWQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd29ya3NwYWNlSWQgPSAkc3RhdGUucGFyYW1zLndvcmtzcGFjZUlkLnJlcGxhY2UoLy0vZywgJy8nKSxcbiAgICAgICAgICAgIHRlc3RCZW5jaElkID0gJHN0YXRlLnBhcmFtcy50ZXN0QmVuY2hJZC5yZXBsYWNlKC8tL2csICcvJyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1Rlc3RCZW5jaENvbnRyb2xsZXInKTtcbiAgICAgICAgJHNjb3BlLmNvbm5lY3Rpb25JZCA9IGNvbnRleHQuZGI7XG5cbiAgICAgICAgJHNjb3BlLndvcmtzcGFjZUlkID0gd29ya3NwYWNlSWQ7XG4gICAgICAgICRzY29wZS50ZXN0QmVuY2hJZCA9IHRlc3RCZW5jaElkO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0QmVuY2hDb250cm9sbGVyJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uU3RhdHVzOiAnU2VsZWN0IGEgVG9wIExldmVsIFN5c3RlbSBVbmRlciBUZXN0Li4uJyxcbiAgICAgICAgICAgIGRlc2lnbklkOiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMgPSB7XG4gICAgICAgICAgICB0ZXN0QmVuY2g6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnTG9hZGluZyB0ZXN0LWJlbmNoLi4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgc2V0TmFtZTogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS4kb24oJ2NvbmZpZ3VyYXRpb25zTG9hZGVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucztcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gZGF0YS5zZXROYW1lO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbmZpZ3VyYXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdUaGVyZSB3ZXJlIG5vIGNvbmZpZ3VyYXRpb25zIGluICcgKyBkYXRhLnNldE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuY29uZmlndXJhdGlvblN0YXR1cyA9ICdTZWxlY3QgYW4gYWN0aW9uIGFib3ZlLi4uJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLiRvbigndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RTZXQnLCBmdW5jdGlvbiAoZXZlbnQsIG5ld0xpc3RJdGVtLCBvbGRMaXN0SXRlbSkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC5ub2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC50bHN1dElkID09PSBuZXdMaXN0SXRlbS5pZCkge1xuICAgICAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdEZXNpZ24gc3BhY2UgaXMgYWxyZWFkeSBzZXQgYXMgVG9wIExldmVsIFN5c3RlbSBVbmRlciBUZXN0LicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC50bHN1dElkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLnRsc3V0SWQgPSBuZXdMaXN0SXRlbS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0xpc3RJdGVtLmNzc0NsYXNzID0gJ3RvcC1sZXZlbC1zeXN0ZW0tdW5kZXItdGVzdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkTGlzdEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRMaXN0SXRlbS5jc3NDbGFzcyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLm5vZGUubWFrZVBvaW50ZXIoJ1RvcExldmVsU3lzdGVtVW5kZXJUZXN0JywgbmV3TGlzdEl0ZW0uaWQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8kc2NvcGUuc3RhdGUuZGVzaWduSWQgPSBuZXdMaXN0SXRlbS5pZDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RTZXQnLCBuZXdMaXN0SXRlbSwgb2xkTGlzdEl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdDYW4gbm90IHNldCBUTFNVVCB3aGlsZSB0ZXN0LWJlbmNoIGhhcyBub3QgYmVlbiBsb2FkZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS4kb24oJ3NlbGVjdGlvbkV4cG9zZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGNvbmZpZ3VyYXRpb25zKSB7XG4gICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICAgIG51bUNmZ3MgPSBjb25maWd1cmF0aW9ucy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgaW52b2tlVGVzdEJlbmNoUnVubmVyID0gZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5ydW5UZXN0QmVuY2goY29udGV4dCwgdGVzdEJlbmNoSWQsIGNvbmZpZ3VyYXRpb24uaWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0TGlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0TGlnaHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdUZXN0QmVuY2ggcnVuIHN1Y2Nlc3NmdWxseSBvbiAnICsgY29uZmlndXJhdGlvbi5uYW1lICsgJy4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdExpZ2h0LmFydGlmYWN0c0h0bWwsIHt0dGw6IC0xfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ1Rlc3RCZW5jaCBydW4gZmFpbGVkIG9uICcgKyBjb25maWd1cmF0aW9uLm5hbWUgKyAnLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCwge3R0bDogLTF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHJlc3VsdExpZ2h0Lm1lc3NhZ2VzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3Jvd2wuaGFzT3duUHJvcGVydHkocmVzdWx0TGlnaHQubWVzc2FnZXNbal0uc2V2ZXJpdHkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2xbcmVzdWx0TGlnaHQubWVzc2FnZXNbal0uc2V2ZXJpdHldKHJlc3VsdExpZ2h0Lm1lc3NhZ2VzW2pdLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKHJlc3VsdExpZ2h0Lm1lc3NhZ2VzW2pdLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdSdW5uaW5nIHRlc3QtYmVuY2ggZmFpbGVkLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChudW1DZmdzIDwgMSkge1xuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ05vIHNlbGVjdGVkIGNvbmZpZ3VyYXRpb25zIScpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG51bUNmZ3M7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24gPSBjb25maWd1cmF0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdUZXN0LWJlbmNoIHN0YXJ0ZWQgb24gJyArIGNvbmZpZ3VyYXRpb24ubmFtZSArICcgWycgKyAoaSArIDEpLnRvU3RyaW5nKCkgKyAnLycgKyBudW1DZmdzICsgJ10nKTtcbiAgICAgICAgICAgICAgICBpbnZva2VUZXN0QmVuY2hSdW5uZXIoY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5ydW5UZXN0QmVuY2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnZXhwb3NlU2VsZWN0aW9uJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGVzdEJlbmNoU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xuXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xuXG4gICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLndhdGNoVGVzdEJlbmNoTm9kZShjb250ZXh0LCAkc2NvcGUudGVzdEJlbmNoSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0xvYWQgc2hvdWxkIG5vdCBoYXBwZW4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2ggPSB1cGRhdGVPYmplY3QuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50bHN1dENoYW5nZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdENoYW5nZWQnLCAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJykge1xuICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdUZXN0IEJlbmNoIHdhcyByZW1vdmVkIScpO1xuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3dvcmtzcGFjZURldGFpbHMvJyArIHdvcmtzcGFjZUlkLnJlcGxhY2UoL1xcLy9nLCAnLScpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaCA9IGRhdGEudGVzdEJlbmNoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS50ZXN0QmVuY2gudGxzdXRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0Q2hhbmdlZCcsIGRhdGEudGVzdEJlbmNoLnRsc3V0SWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXG5cbmFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgJHdpbmRvdywgJHN0YXRlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIHdvcmtzcGFjZUlkID0gJHN0YXRlLnBhcmFtcy53b3Jrc3BhY2VJZC5yZXBsYWNlKC8tL2csICcvJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIHdvcmtzcGFjZUlkKTtcbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbCA9IHtcbiAgICAgICAgICAgIHdvcmtzcGFjZUlkOiB3b3Jrc3BhY2VJZFxuICAgICAgICB9O1xuICAgICAgICAkcm9vdFNjb3BlLm1haW5OYXZpZ2F0b3IuaXRlbXMgPSBbe1xuICAgICAgICAgICAgaWQ6ICdyb290JyxcbiAgICAgICAgICAgIGxhYmVsOiAnQURNRWRpdG9yJyxcbiAgICAgICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnLFxuICAgICAgICAgICAgbWVudTogW3tcbiAgICAgICAgICAgICAgICBpZDogJ2VkaXRvcicsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBlZGl0b3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PUFETUVkaXRvcicsICdfYmxhbmsnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7fVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV07XG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvci5zZXBhcmF0b3IgPSBmYWxzZTtcbiAgICAgICAgLy9kZWJ1Z2dlcjtcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkd2luZG93KSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgY29uc29sZS5sb2coJ1dvcmtzcGFjZXNDb250cm9sbGVyJyk7XG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvci5pdGVtcyA9IFt7XG4gICAgICAgICAgICBpZDogJ3Jvb3QnLFxuICAgICAgICAgICAgbGFiZWw6ICdBRE1FZGl0b3InLFxuICAgICAgICAgICAgaXRlbUNsYXNzOiAnY3lwaHktcm9vdCcsXG4gICAgICAgICAgICBtZW51OiBbe1xuICAgICAgICAgICAgICAgIGlkOiAnZWRpdG9yJyxcbiAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIGVkaXRvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJywgJ19ibGFuaycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHt9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yLnNlcGFyYXRvciA9IGZhbHNlO1xuICAgIH0pOyJdfQ==
