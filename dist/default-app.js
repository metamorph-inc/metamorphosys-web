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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvZGVmYXVsdC9hcHAuanMiLCIvVm9sdW1lcy9Qcm9qZWN0cy9jeXBoeS93ZWJnbWUtY3lwaHkvc3JjL2FwcC9kZWZhdWx0L3ZpZXdzL0Rlc2lnblNwYWNlL0Rlc2lnblNwYWNlQ29udHJvbGxlci5qcyIsIi9Wb2x1bWVzL1Byb2plY3RzL2N5cGh5L3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXIuanMiLCIvVm9sdW1lcy9Qcm9qZWN0cy9jeXBoeS93ZWJnbWUtY3lwaHkvc3JjL2FwcC9kZWZhdWx0L3ZpZXdzL1dvcmtzcGFjZURldGFpbHMvV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXIuanMiLCIvVm9sdW1lcy9Qcm9qZWN0cy9jeXBoeS93ZWJnbWUtY3lwaHkvc3JjL2FwcC9kZWZhdWx0L3ZpZXdzL1dvcmtzcGFjZXMvV29ya3NwYWNlc0NvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCB3aW5kb3csIHJlcXVpcmUqL1xuXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG5cbiAgICAnZ21lLnNlcnZpY2VzJyxcblxuICAgICdpc2lzLnVpLmNvbXBvbmVudHMnLFxuXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnLFxuXG4gICAgLy8gYXBwIHNwZWNpZmljIHRlbXBsYXRlc1xuICAgICdjeXBoeS5kZWZhdWx0LnRlbXBsYXRlcydcbl0pXG4gICAgLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIC8vIEZvciBhbnkgdW5tYXRjaGVkIHVybCwgcmVkaXJlY3QgdG8gL3dvcmtzcGFjZXNcbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3dvcmtzcGFjZXMnKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gTm93IHNldCB1cCB0aGUgc3RhdGVzXG4gICAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xuICAgICAgICAgICAgICAgIHVybDogXCIvaW5kZXhcIlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnd29ya3NwYWNlcycsIHtcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3dvcmtzcGFjZXNcIixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvV29ya3NwYWNlcy5odG1sXCIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJXb3Jrc3BhY2VzQ29udHJvbGxlclwiXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd3b3Jrc3BhY2VEZXRhaWxzJywge1xuICAgICAgICAgICAgICAgIHVybDogXCIvd29ya3NwYWNlRGV0YWlscy86d29ya3NwYWNlSWRcIixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvV29ya3NwYWNlRGV0YWlscy5odG1sXCIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlclwiXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCdkZXNpZ25TcGFjZScsIHtcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2Rlc2lnblNwYWNlLzp3b3Jrc3BhY2VJZC86ZGVzaWduSWRcIixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvRGVzaWduU3BhY2UuaHRtbFwiLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiRGVzaWduU3BhY2VDb250cm9sbGVyXCJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ3Rlc3RCZW5jaCcsIHtcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3Rlc3RCZW5jaC86d29ya3NwYWNlSWQvOnRlc3RCZW5jaElkXCIsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL2RlZmF1bHQvdGVtcGxhdGVzL1Rlc3RCZW5jaC5odG1sXCIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJUZXN0QmVuY2hDb250cm9sbGVyXCJcbiAgICAgICAgICAgIH0pO1xuICAgIH0pXG4gICAgLmNvbnRyb2xsZXIoJ01haW5OYXZpZ2F0b3JDb250cm9sbGVyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgICRzY29wZS5uYXZpZ2F0b3IgPSB7fTtcbiAgICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IFt7XG4gICAgICAgICAgICBpZDogJ3Jvb3QnLFxuICAgICAgICAgICAgbGFiZWw6ICdBRE1FZGl0b3InLFxuICAgICAgICAgICAgaXRlbUNsYXNzOiAnY3lwaHktcm9vdCdcbiAgICAgICAgfV07XG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvciA9ICRzY29wZS5uYXZpZ2F0b3I7XG4gICAgfSlcbiAgICAucnVuKGZ1bmN0aW9uICgkc3RhdGUsIGdyb3dsLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSAnbXktZGItY29ubmVjdGlvbi1pZCc7XG5cbiAgICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZShjb25uZWN0aW9uSWQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIHNlbGVjdCBkZWZhdWx0IHByb2plY3QgYW5kIGJyYW5jaCAobWFzdGVyKVxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9qZWN0U2VydmljZS5zZWxlY3RQcm9qZWN0KGNvbm5lY3Rpb25JZCwgJ0FETUVkaXRvcicpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ0FETUVkaXRvciBkb2VzIG5vdCBleGlzdC4gQ3JlYXRlIGFuZCBpbXBvcnQgaXQgdXNpbmcgdGhlIDxhIGhyZWY9XCInICtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArICdcIj4gd2ViZ21lIGludGVyZmFjZTwvYT4uJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cblxucmVxdWlyZSgnLi92aWV3cy9Xb3Jrc3BhY2VzL1dvcmtzcGFjZXNDb250cm9sbGVyJyk7XG5yZXF1aXJlKCcuL3ZpZXdzL1dvcmtzcGFjZURldGFpbHMvV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInKTtcbnJlcXVpcmUoJy4vdmlld3MvRGVzaWduU3BhY2UvRGVzaWduU3BhY2VDb250cm9sbGVyJyk7XG5yZXF1aXJlKCcuL3ZpZXdzL1Rlc3RCZW5jaC9UZXN0QmVuY2hDb250cm9sbGVyJyk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cblxuYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJylcbiAgICAuY29udHJvbGxlcignRGVzaWduU3BhY2VDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkdGltZW91dCwgJG1vZGFsLCAkbG9jYXRpb24sICRxLCBncm93bCwgZGVzZXJ0U2VydmljZSwgZGVzaWduU2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICBtZXRhLFxuICAgICAgICAgICAgd29ya3NwYWNlSWQgPSAkc3RhdGUucGFyYW1zLndvcmtzcGFjZUlkLnJlcGxhY2UoLy0vZywgJy8nKSxcbiAgICAgICAgICAgIGRlc2lnbklkID0gJHN0YXRlLnBhcmFtcy5kZXNpZ25JZC5yZXBsYWNlKC8tL2csICcvJyksXG4gICAgICAgICAgICBzYXZlQ29uZmlndXJhdGlvbnMsXG4gICAgICAgICAgICBnZW5lcmF0ZURhc2hib2FyZCxcbiAgICAgICAgICAgIGNsZWFuVXBDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcgPSAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgncmVnaW9uSWQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbmZpZy5yZWdpb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLnJlc3VsdHNBdmFsaWFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBjb25zb2xlLmxvZygnRGVzaWduU3BhY2VDb250cm9sbGVyJyk7XG4gICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSAnbXktZGItY29ubmVjdGlvbi1pZCc7XG4gICAgICAgICRzY29wZS53b3Jrc3BhY2VJZCA9IHdvcmtzcGFjZUlkO1xuICAgICAgICAkc2NvcGUuZGVzaWduSWQgPSBkZXNpZ25JZDtcblxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnRGVzaWduU3BhY2VDb250cm9sbGVyJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgICAgICBkZXNpZ25UcmVlTG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2VydElucHV0QXZhbGlhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25TdGF0dXM6ICdTZWxlY3QgYW4gYWN0aW9uIGFib3ZlLi4uJyxcbiAgICAgICAgICAgIGhhc0NvbXBvbmVudHM6IHRydWUsXG4gICAgICAgICAgICBzYXZpbmdDb25maWd1cmF0aW9uczogZmFsc2UsXG4gICAgICAgICAgICByZXN1bHRzQXZhbGlhYmxlOiBmYWxzZVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5kYXRhTW9kZWxzID0ge1xuICAgICAgICAgICAgYXZtSWRzOiB7fSxcbiAgICAgICAgICAgIGRlc2VydElucHV0OiB7fSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiBbXSxcbiAgICAgICAgICAgIHNldE5hbWU6IG51bGwsXG4gICAgICAgICAgICBkZXNpZ246IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnTG9hZGluZyBkZXNpZ24uLi4nXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLiRvbignZGVzaWduVHJlZUxvYWRlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuYXZtSWRzID0gZGF0YTtcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5oYXNDb21wb25lbnRzID0gT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID4gMDtcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5kZXNpZ25UcmVlTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLiRvbignc2VsZWN0ZWRJbnN0YW5jZXMnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIGdyb3dsLmluZm8oZGF0YS5uYW1lICsgJyBoYXMgJyArIGRhdGEuaWRzLmxlbmd0aCArICcgaW5zdGFuY2UocykuJyk7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2V0U2VsZWN0ZWROb2RlcycsIGRhdGEuaWRzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLiRvbignY29uZmlndXJhdGlvbkNsaWNrZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgIGlkcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGRhdGEuYWx0ZXJuYXRpdmVBc3NpZ25tZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGlkcy5wdXNoKGRhdGEuYWx0ZXJuYXRpdmVBc3NpZ25tZW50c1tpXS5zZWxlY3RlZEFsdGVybmF0aXZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzZXRTZWxlY3RlZE5vZGVzJywgaWRzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLiRvbignZGVzZXJ0SW5wdXRSZWFkeScsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuZGVzZXJ0SW5wdXQgPSBkYXRhO1xuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmRlc2VydElucHV0QXZhbGlhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuJG9uKCdjb25maWd1cmF0aW9uc0xvYWRlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgY2xlYW5VcENvbmZpZ3VyYXRpb25zKCk7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnNldE5hbWUgPSBkYXRhLnNldE5hbWU7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBkYXRhLmNvbmZpZ3VyYXRpb25zO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbmZpZ3VyYXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdUaGVyZSB3ZXJlIG5vIGNvbmZpZ3VyYXRpb25zIGluICcgKyBkYXRhLnNldE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuY29uZmlndXJhdGlvblN0YXR1cyA9ICdTZWxlY3QgYW4gYWN0aW9uIGFib3ZlLi4uJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8ICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKGRlc2lnblNlcnZpY2UuYXBwZW5kV2F0Y2hSZXN1bHRzKGNvbnRleHQsICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zW2ldKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChoYXNSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNSZXN1bHRzLm1hcChmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUucmVzdWx0c0F2YWxpYWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5jYWxjdWxhdGVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdyb3dsLmluZm8oJ0NhbGN1bGF0aW5nIGNvbmZpZ3VyYXRpb25zLiBQbGVhc2Ugd2FpdC4uJyk7XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuY29uZmlndXJhdGlvblN0YXR1cyA9ICdDYWxjdWxhdGluZy4uJztcbiAgICAgICAgICAgIGNsZWFuVXBDb25maWd1cmF0aW9ucygpO1xuICAgICAgICAgICAgZGVzZXJ0U2VydmljZS5jYWxjdWxhdGVDb25maWd1cmF0aW9ucygkc2NvcGUuZGF0YU1vZGVscy5kZXNlcnRJbnB1dClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29uZmlndXJhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBjb25maWd1cmF0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9ICdjYWxjdWxhdGVkJztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnQ2FsY3VsYXRlZCc7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdGYWlsZWQgdG8gY2FsY3VsYXRlIGNvbmZpZ3VyYXRpb25zLCBzZWUgY29uc29sZSBmb3IgbW9yZSBpbmZvLicpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ0ZhaWxlZCB0byBjYWxjdWxhdGUuJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2F2ZUNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ2V4cG9zZVNlbGVjdGlvbicsICdzYXZlJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2F2ZUNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb25zKSB7XG4gICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZTtcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9ucy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnTm8gc2VsZWN0ZWQgY29uZmlndXJhdGlvbnMhJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLnNhdmluZ0NvbmZpZ3VyYXRpb25zID0gdHJ1ZTtcbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvZGVmYXVsdC90ZW1wbGF0ZXMvU2F2ZUNvbmZpZ3VyYXRpb25TZXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NhdmVDb25maWd1cmF0aW9uU2V0Q29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgLy9zaXplOiBzaXplLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHsgZGF0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IGNvbmZpZ3VyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YTogbWV0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlOiAkc2NvcGUuZGF0YU1vZGVscy5kZXNpZ24ubm9kZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuc2F2aW5nQ29uZmlndXJhdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZ2VuZXJhdGVEYXNoYm9hcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnZXhwb3NlU2VsZWN0aW9uJywgJ2Rhc2hib2FyZCcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGdlbmVyYXRlRGFzaGJvYXJkID0gZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb25zKSB7XG4gICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgcmVzdWx0SWRzID0gW107XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29uZmlndXJhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBjb25maWd1cmF0aW9uc1tpXS5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uc1tpXS5yZXN1bHRzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdElkcy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0SWRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdHZW5lcmF0aW5nIGRhc2hib2FyZCBmb3IgJyArIHJlc3VsdElkcy5sZW5ndGggKyAnIHJlc3VsdHMuJyk7XG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5nZW5lcmF0ZURhc2hib2FyZChjb250ZXh0LCAkc2NvcGUuZGVzaWduSWQsIHJlc3VsdElkcylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdExpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHRMaWdodC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnRGFzaGJvYXJkIGdlbmVyYXRlZCAnICsgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCwge3R0bDogLTF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ0Rhc2hib2FyZCBnZW5lcmF0aW9uIGZhaWxlZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgcmVzdWx0TGlnaHQubWVzc2FnZXMubGVuZ3RoOyBrICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3dsLmhhc093blByb3BlcnR5KHJlc3VsdExpZ2h0Lm1lc3NhZ2VzW2tdLnNldmVyaXR5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2xbcmVzdWx0TGlnaHQubWVzc2FnZXNba10uc2V2ZXJpdHldKHJlc3VsdExpZ2h0Lm1lc3NhZ2VzW2tdLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyhyZXN1bHRMaWdodC5tZXNzYWdlc1trXS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdEYXNoYm9hcmQgZ2VuZXJhdGlvbiBmYWlsZWQuJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdObyByZXN1bHRzIGluIHNlbGVjdGVkIGNvbmZpZ3VyYXRpb25zIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS4kb24oJ3NlbGVjdGlvbkV4cG9zZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEsIGVUeXBlKSB7XG4gICAgICAgICAgICBpZiAoZVR5cGUgPT09ICdzYXZlJykge1xuICAgICAgICAgICAgICAgIHNhdmVDb25maWd1cmF0aW9ucyhkYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZVR5cGUgPT09ICdkYXNoYm9hcmQnKSB7XG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVEYXNoYm9hcmQoZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlc2lnblNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcblxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZGVzdHJveSBldmVudCByYWlzZWQnKTtcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcblxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnbk5vZGUoY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdMb2FkIHNob3VsZG50IGhhcHBlbicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmRlc2lnbiA9IHVwZGF0ZU9iamVjdC5kYXRhO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ0Rlc2lnbiBOb2RlIHdhcyByZW1vdmVkIScpO1xuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3dvcmtzcGFjZURldGFpbHMvJyArIHdvcmtzcGFjZUlkLnJlcGxhY2UoL1xcLy9nLCAnLScpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmRlc2lnbiA9IGRhdGEuZGVzaWduO1xuICAgICAgICAgICAgICAgICAgICBtZXRhID0gZGF0YS5tZXRhO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KVxuICAgIC5jb250cm9sbGVyKCdTYXZlQ29uZmlndXJhdGlvblNldENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgJHRpbWVvdXQsIGdyb3dsLCBkYXRhLCBkZXNpZ25TZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgIG1ldGEgPSBkYXRhLm1ldGEsXG4gICAgICAgICAgICBkZXNpZ25Ob2RlID0gZGF0YS5kZXNpZ25Ob2RlLFxuICAgICAgICAgICAgY29udGV4dCA9IGRhdGEuY29udGV4dDtcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbnVsbCxcbiAgICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgICBuYnJPZkNvbmZpZ3VyYXRpb25zOiBjb25maWd1cmF0aW9ucy5sZW5ndGhcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoISRzY29wZS5kYXRhLm5hbWUpIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdZb3UgbXVzdCBwcm92aWRlIGEgbmFtZSEnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBncm93bC5pbmZvKCdTYXZpbmcgY29uZmlndXJhdGlvbiBzZXQgJyArICRzY29wZS5kYXRhLm5hbWUgKyAndGhpcyBtYXkgdGFrZSBhIHdoaWxlLi4uJyk7XG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNhbGxTYXZlRGVzZXJ0Q29uZmlndXJhdGlvbnMoY29udGV4dCwgJHNjb3BlLmRhdGEubmFtZSwgJHNjb3BlLmRhdGEuZGVzY3JpcHRpb24sIGNvbmZpZ3VyYXRpb25zLFxuICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUuZ2V0SWQoKSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoJ0NvbmZpZ3VyYXRpb25zIHNhdmVkIHRvICcgKyAkc2NvcGUuZGF0YS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoJHNjb3BlLmRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuLy8gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLnNhdmVDb25maWd1cmF0aW9uU2V0KCRzY29wZS5kYXRhLm5hbWUsICRzY29wZS5kYXRhLmRlc2NyaXB0aW9uLCBjb25maWd1cmF0aW9ucyxcbi8vICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUsIG1ldGEpXG4vLyAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnQ29uZmlndXJhdGlvbnMgc2F2ZWQgdG8gJyArICRzY29wZS5kYXRhLm5hbWUpO1xuLy8gICAgICAgICAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5kYXRhKTtcbi8vICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcbiAgICAgICAgfTtcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxuICAgIC5jb250cm9sbGVyKCdUZXN0QmVuY2hDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkdGltZW91dCwgJGxvY2F0aW9uLCBncm93bCwgdGVzdEJlbmNoU2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICdteS1kYi1jb25uZWN0aW9uLWlkJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdvcmtzcGFjZUlkID0gJHN0YXRlLnBhcmFtcy53b3Jrc3BhY2VJZC5yZXBsYWNlKC8tL2csICcvJyksXG4gICAgICAgICAgICB0ZXN0QmVuY2hJZCA9ICRzdGF0ZS5wYXJhbXMudGVzdEJlbmNoSWQucmVwbGFjZSgvLS9nLCAnLycpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdUZXN0QmVuY2hDb250cm9sbGVyJyk7XG4gICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb250ZXh0LmRiO1xuXG4gICAgICAgICRzY29wZS53b3Jrc3BhY2VJZCA9IHdvcmtzcGFjZUlkO1xuICAgICAgICAkc2NvcGUudGVzdEJlbmNoSWQgPSB0ZXN0QmVuY2hJZDtcblxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnVGVzdEJlbmNoQ29udHJvbGxlcicgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnN0YXRlID0ge1xuICAgICAgICAgICAgY29uZmlndXJhdGlvblN0YXR1czogJ1NlbGVjdCBhIFRvcCBMZXZlbCBTeXN0ZW0gVW5kZXIgVGVzdC4uLicsXG4gICAgICAgICAgICBkZXNpZ25JZDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5kYXRhTW9kZWxzID0ge1xuICAgICAgICAgICAgdGVzdEJlbmNoOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ0xvYWRpbmcgdGVzdC1iZW5jaC4uJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiBbXSxcbiAgICAgICAgICAgIHNldE5hbWU6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuJG9uKCdjb25maWd1cmF0aW9uc0xvYWRlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IGRhdGEuY29uZmlndXJhdGlvbnM7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9IGRhdGEuc2V0TmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb25maWd1cmF0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnVGhlcmUgd2VyZSBubyBjb25maWd1cmF0aW9ucyBpbiAnICsgZGF0YS5zZXROYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnU2VsZWN0IGFuIGFjdGlvbiBhYm92ZS4uLic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS4kb24oJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0U2V0JywgZnVuY3Rpb24gKGV2ZW50LCBuZXdMaXN0SXRlbSwgb2xkTGlzdEl0ZW0pIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gubm9kZSkge1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9PT0gbmV3TGlzdEl0ZW0uaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbygnRGVzaWduIHNwYWNlIGlzIGFscmVhZHkgc2V0IGFzIFRvcCBMZXZlbCBTeXN0ZW0gVW5kZXIgVGVzdC4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC50bHN1dElkID0gbmV3TGlzdEl0ZW0uaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdMaXN0SXRlbS5jc3NDbGFzcyA9ICd0b3AtbGV2ZWwtc3lzdGVtLXVuZGVyLXRlc3QnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9sZExpc3RJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkTGlzdEl0ZW0uY3NzQ2xhc3MgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC5ub2RlLm1ha2VQb2ludGVyKCdUb3BMZXZlbFN5c3RlbVVuZGVyVGVzdCcsIG5ld0xpc3RJdGVtLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vJHNjb3BlLnN0YXRlLmRlc2lnbklkID0gbmV3TGlzdEl0ZW0uaWQ7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0U2V0JywgbmV3TGlzdEl0ZW0sIG9sZExpc3RJdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnQ2FuIG5vdCBzZXQgVExTVVQgd2hpbGUgdGVzdC1iZW5jaCBoYXMgbm90IGJlZW4gbG9hZGVkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuJG9uKCdzZWxlY3Rpb25FeHBvc2VkJywgZnVuY3Rpb24gKGV2ZW50LCBjb25maWd1cmF0aW9ucykge1xuICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgICBudW1DZmdzID0gY29uZmlndXJhdGlvbnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGludm9rZVRlc3RCZW5jaFJ1bm5lciA9IGZ1bmN0aW9uIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucnVuVGVzdEJlbmNoKGNvbnRleHQsIHRlc3RCZW5jaElkLCBjb25maWd1cmF0aW9uLmlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdExpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGo7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdExpZ2h0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnVGVzdEJlbmNoIHJ1biBzdWNjZXNzZnVsbHkgb24gJyArIGNvbmZpZ3VyYXRpb24ubmFtZSArICcuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRMaWdodC5hcnRpZmFjdHNIdG1sLCB7dHRsOiAtMX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdUZXN0QmVuY2ggcnVuIGZhaWxlZCBvbiAnICsgY29uZmlndXJhdGlvbi5uYW1lICsgJy4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdExpZ2h0LmFydGlmYWN0c0h0bWwsIHt0dGw6IC0xfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCByZXN1bHRMaWdodC5tZXNzYWdlcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3dsLmhhc093blByb3BlcnR5KHJlc3VsdExpZ2h0Lm1lc3NhZ2VzW2pdLnNldmVyaXR5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsW3Jlc3VsdExpZ2h0Lm1lc3NhZ2VzW2pdLnNldmVyaXR5XShyZXN1bHRMaWdodC5tZXNzYWdlc1tqXS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyhyZXN1bHRMaWdodC5tZXNzYWdlc1tqXS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignUnVubmluZyB0ZXN0LWJlbmNoIGZhaWxlZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobnVtQ2ZncyA8IDEpIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdObyBzZWxlY3RlZCBjb25maWd1cmF0aW9ucyEnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1DZmdzOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbnNbaV07XG4gICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbygnVGVzdC1iZW5jaCBzdGFydGVkIG9uICcgKyBjb25maWd1cmF0aW9uLm5hbWUgKyAnIFsnICsgKGkgKyAxKS50b1N0cmluZygpICsgJy8nICsgbnVtQ2ZncyArICddJyk7XG4gICAgICAgICAgICAgICAgaW52b2tlVGVzdEJlbmNoUnVubmVyKGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUucnVuVGVzdEJlbmNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ2V4cG9zZVNlbGVjdGlvbicpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcblxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZGVzdHJveSBldmVudCByYWlzZWQnKTtcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcblxuICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS53YXRjaFRlc3RCZW5jaE5vZGUoY29udGV4dCwgJHNjb3BlLnRlc3RCZW5jaElkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdMb2FkIHNob3VsZCBub3QgaGFwcGVuJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoID0gdXBkYXRlT2JqZWN0LmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudGxzdXRDaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RDaGFuZ2VkJywgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLnRsc3V0SWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnVGVzdCBCZW5jaCB3YXMgcmVtb3ZlZCEnKTtcbiAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy93b3Jrc3BhY2VEZXRhaWxzLycgKyB3b3Jrc3BhY2VJZC5yZXBsYWNlKC9cXC8vZywgJy0nKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2ggPSBkYXRhLnRlc3RCZW5jaDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEudGVzdEJlbmNoLnRsc3V0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdENoYW5nZWQnLCBkYXRhLnRlc3RCZW5jaC50bHN1dElkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc2NvcGUsICR3aW5kb3csICRzdGF0ZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSgvLS9nLCAnLycpO1xuICAgICAgICBjb25zb2xlLmxvZygnV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInLCB3b3Jrc3BhY2VJZCk7XG4gICAgICAgICRzY29wZS5kYXRhTW9kZWwgPSB7XG4gICAgICAgICAgICB3b3Jrc3BhY2VJZDogd29ya3NwYWNlSWRcbiAgICAgICAgfTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yLml0ZW1zID0gW3tcbiAgICAgICAgICAgIGlkOiAncm9vdCcsXG4gICAgICAgICAgICBsYWJlbDogJ0FETUVkaXRvcicsXG4gICAgICAgICAgICBpdGVtQ2xhc3M6ICdjeXBoeS1yb290JyxcbiAgICAgICAgICAgIG1lbnU6IFt7XG4gICAgICAgICAgICAgICAgaWQ6ICdlZGl0b3InLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gZWRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3InLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge31cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dO1xuICAgICAgICAkcm9vdFNjb3BlLm1haW5OYXZpZ2F0b3Iuc2VwYXJhdG9yID0gZmFsc2U7XG4gICAgICAgIC8vZGVidWdnZXI7XG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cblxuYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJylcbiAgICAuY29udHJvbGxlcignV29ya3NwYWNlc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHdpbmRvdykge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VzQ29udHJvbGxlcicpO1xuICAgICAgICAkcm9vdFNjb3BlLm1haW5OYXZpZ2F0b3IuaXRlbXMgPSBbe1xuICAgICAgICAgICAgaWQ6ICdyb290JyxcbiAgICAgICAgICAgIGxhYmVsOiAnQURNRWRpdG9yJyxcbiAgICAgICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnLFxuICAgICAgICAgICAgbWVudTogW3tcbiAgICAgICAgICAgICAgICBpZDogJ2VkaXRvcicsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBlZGl0b3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PUFETUVkaXRvcicsICdfYmxhbmsnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7fVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV07XG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvci5zZXBhcmF0b3IgPSBmYWxzZTtcbiAgICB9KTsiXX0=
