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
    .run(function ($state, dataStoreService, projectService) {
        'use strict';
        var connectionId = 'my-db-connection-id';

        dataStoreService.connectToDatabase(connectionId, {host: window.location.basename})
            .then(function () {
                // select default project and branch (master)
                return projectService.selectProject(connectionId, 'ADMEditor');
            })
            .catch(function (reason) {
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
                    return {configurations: configurations, meta: meta, designNode: $scope.dataModels.design.node};
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
            designNode = data.designNode;
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
            designService.saveConfigurationSetNodes($scope.data.name, $scope.data.description, configurations,
                designNode, meta)
                .then(function () {
                    growl.success('Configurations saved to ' + $scope.data.name);
                    $modalInstance.close($scope.data);
                });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL2RlZmF1bHQvYXBwLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvRGVzaWduU3BhY2UvRGVzaWduU3BhY2VDb250cm9sbGVyLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXIuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9hcHAvZGVmYXVsdC92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgd2luZG93LCByZXF1aXJlKi9cclxuXHJcbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcclxuICAgICd1aS5yb3V0ZXInLFxyXG5cclxuICAgICdnbWUuc2VydmljZXMnLFxyXG5cclxuICAgICdpc2lzLnVpLmNvbXBvbmVudHMnLFxyXG5cclxuICAgICdjeXBoeS5jb21wb25lbnRzJyxcclxuXHJcbiAgICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXHJcbiAgICAnY3lwaHkuZGVmYXVsdC50ZW1wbGF0ZXMnXHJcbl0pXHJcbiAgICAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIC8vIEZvciBhbnkgdW5tYXRjaGVkIHVybCwgcmVkaXJlY3QgdG8gL3dvcmtzcGFjZXNcclxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvd29ya3NwYWNlcycpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gTm93IHNldCB1cCB0aGUgc3RhdGVzXHJcbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAgICAgLnN0YXRlKCdpbmRleCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvaW5kZXhcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ3dvcmtzcGFjZXMnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3dvcmtzcGFjZXNcIixcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9Xb3Jrc3BhY2VzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiV29ya3NwYWNlc0NvbnRyb2xsZXJcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ3dvcmtzcGFjZURldGFpbHMnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3dvcmtzcGFjZURldGFpbHMvOndvcmtzcGFjZUlkXCIsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvV29ya3NwYWNlRGV0YWlscy5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIldvcmtzcGFjZURldGFpbHNDb250cm9sbGVyXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkZXNpZ25TcGFjZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvZGVzaWduU3BhY2UvOndvcmtzcGFjZUlkLzpkZXNpZ25JZFwiLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL2RlZmF1bHQvdGVtcGxhdGVzL0Rlc2lnblNwYWNlLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiRGVzaWduU3BhY2VDb250cm9sbGVyXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCd0ZXN0QmVuY2gnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3Rlc3RCZW5jaC86d29ya3NwYWNlSWQvOnRlc3RCZW5jaElkXCIsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvVGVzdEJlbmNoLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiVGVzdEJlbmNoQ29udHJvbGxlclwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jb250cm9sbGVyKCdNYWluTmF2aWdhdG9yQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc2NvcGUpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgJHNjb3BlLm5hdmlnYXRvciA9IHt9O1xyXG4gICAgICAgICRzY29wZS5uYXZpZ2F0b3IuaXRlbXMgPSBbe1xyXG4gICAgICAgICAgICBpZDogJ3Jvb3QnLFxyXG4gICAgICAgICAgICBsYWJlbDogJ0FETUVkaXRvcicsXHJcbiAgICAgICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnXHJcbiAgICAgICAgfV07XHJcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yID0gJHNjb3BlLm5hdmlnYXRvcjtcclxuICAgIH0pXHJcbiAgICAucnVuKGZ1bmN0aW9uICgkc3RhdGUsIGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSAnbXktZGItY29ubmVjdGlvbi1pZCc7XHJcblxyXG4gICAgICAgIGRhdGFTdG9yZVNlcnZpY2UuY29ubmVjdFRvRGF0YWJhc2UoY29ubmVjdGlvbklkLCB7aG9zdDogd2luZG93LmxvY2F0aW9uLmJhc2VuYW1lfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gc2VsZWN0IGRlZmF1bHQgcHJvamVjdCBhbmQgYnJhbmNoIChtYXN0ZXIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdChjb25uZWN0aW9uSWQsICdBRE1FZGl0b3InKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcblxyXG5yZXF1aXJlKCcuL3ZpZXdzL1dvcmtzcGFjZXMvV29ya3NwYWNlc0NvbnRyb2xsZXInKTtcclxucmVxdWlyZSgnLi92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJyk7XHJcbnJlcXVpcmUoJy4vdmlld3MvRGVzaWduU3BhY2UvRGVzaWduU3BhY2VDb250cm9sbGVyJyk7XHJcbnJlcXVpcmUoJy4vdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXInKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJylcclxuICAgIC5jb250cm9sbGVyKCdEZXNpZ25TcGFjZUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICR0aW1lb3V0LCAkbW9kYWwsICRsb2NhdGlvbiwgJHEsIGdyb3dsLCBkZXNlcnRTZXJ2aWNlLCBkZXNpZ25TZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgY29udGV4dCxcclxuICAgICAgICAgICAgbWV0YSxcclxuICAgICAgICAgICAgd29ya3NwYWNlSWQgPSAkc3RhdGUucGFyYW1zLndvcmtzcGFjZUlkLnJlcGxhY2UoLy0vZywgJy8nKSxcclxuICAgICAgICAgICAgZGVzaWduSWQgPSAkc3RhdGUucGFyYW1zLmRlc2lnbklkLnJlcGxhY2UoLy0vZywgJy8nKSxcclxuICAgICAgICAgICAgc2F2ZUNvbmZpZ3VyYXRpb25zLFxyXG4gICAgICAgICAgICBnZW5lcmF0ZURhc2hib2FyZCxcclxuICAgICAgICAgICAgY2xlYW5VcENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8ICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgncmVnaW9uSWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29uZmlnLnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUucmVzdWx0c0F2YWxpYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Rlc2lnblNwYWNlQ29udHJvbGxlcicpO1xyXG4gICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSAnbXktZGItY29ubmVjdGlvbi1pZCc7XHJcbiAgICAgICAgJHNjb3BlLndvcmtzcGFjZUlkID0gd29ya3NwYWNlSWQ7XHJcbiAgICAgICAgJHNjb3BlLmRlc2lnbklkID0gZGVzaWduSWQ7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0Rlc2lnblNwYWNlQ29udHJvbGxlcicgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLnN0YXRlID0ge1xyXG4gICAgICAgICAgICBkZXNpZ25UcmVlTG9hZGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgZGVzZXJ0SW5wdXRBdmFsaWFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uU3RhdHVzOiAnU2VsZWN0IGFuIGFjdGlvbiBhYm92ZS4uLicsXHJcbiAgICAgICAgICAgIGhhc0NvbXBvbmVudHM6IHRydWUsXHJcbiAgICAgICAgICAgIHNhdmluZ0NvbmZpZ3VyYXRpb25zOiBmYWxzZSxcclxuICAgICAgICAgICAgcmVzdWx0c0F2YWxpYWJsZTogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVscyA9IHtcclxuICAgICAgICAgICAgYXZtSWRzOiB7fSxcclxuICAgICAgICAgICAgZGVzZXJ0SW5wdXQ6IHt9LFxyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uczogW10sXHJcbiAgICAgICAgICAgIHNldE5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgIGRlc2lnbjoge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0xvYWRpbmcgZGVzaWduLi4uJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZGVzaWduVHJlZUxvYWRlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5hdm1JZHMgPSBkYXRhO1xyXG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuaGFzQ29tcG9uZW50cyA9IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5kZXNpZ25UcmVlTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignc2VsZWN0ZWRJbnN0YW5jZXMnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgZ3Jvd2wuaW5mbyhkYXRhLm5hbWUgKyAnIGhhcyAnICsgZGF0YS5pZHMubGVuZ3RoICsgJyBpbnN0YW5jZShzKS4nKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3NldFNlbGVjdGVkTm9kZXMnLCBkYXRhLmlkcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2NvbmZpZ3VyYXRpb25DbGlja2VkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgaWRzID0gW107XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBkYXRhLmFsdGVybmF0aXZlQXNzaWdubWVudHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGlkcy5wdXNoKGRhdGEuYWx0ZXJuYXRpdmVBc3NpZ25tZW50c1tpXS5zZWxlY3RlZEFsdGVybmF0aXZlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2V0U2VsZWN0ZWROb2RlcycsIGlkcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2Rlc2VydElucHV0UmVhZHknLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuZGVzZXJ0SW5wdXQgPSBkYXRhO1xyXG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuZGVzZXJ0SW5wdXRBdmFsaWFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignY29uZmlndXJhdGlvbnNMb2FkZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgY2xlYW5VcENvbmZpZ3VyYXRpb25zKCk7XHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9IGRhdGEuc2V0TmFtZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucztcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbmZpZ3VyYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ1RoZXJlIHdlcmUgbm8gY29uZmlndXJhdGlvbnMgaW4gJyArIGRhdGEuc2V0TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnU2VsZWN0IGFuIGFjdGlvbiBhYm92ZS4uLic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaChkZXNpZ25TZXJ2aWNlLmFwcGVuZFdhdGNoUmVzdWx0cyhjb250ZXh0LCAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9uc1tpXSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaGFzUmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNSZXN1bHRzLm1hcChmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLnJlc3VsdHNBdmFsaWFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS5jYWxjdWxhdGVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZ3Jvd2wuaW5mbygnQ2FsY3VsYXRpbmcgY29uZmlndXJhdGlvbnMuIFBsZWFzZSB3YWl0Li4nKTtcclxuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnQ2FsY3VsYXRpbmcuLic7XHJcbiAgICAgICAgICAgIGNsZWFuVXBDb25maWd1cmF0aW9ucygpO1xyXG4gICAgICAgICAgICBkZXNlcnRTZXJ2aWNlLmNhbGN1bGF0ZUNvbmZpZ3VyYXRpb25zKCRzY29wZS5kYXRhTW9kZWxzLmRlc2VydElucHV0KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBjb25maWd1cmF0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gJ2NhbGN1bGF0ZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ0NhbGN1bGF0ZWQnO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdGYWlsZWQgdG8gY2FsY3VsYXRlIGNvbmZpZ3VyYXRpb25zLCBzZWUgY29uc29sZSBmb3IgbW9yZSBpbmZvLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ0ZhaWxlZCB0byBjYWxjdWxhdGUuJztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5zYXZlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdleHBvc2VTZWxlY3Rpb24nLCAnc2F2ZScpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNhdmVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChjb25maWd1cmF0aW9ucykge1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZTtcclxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb25zLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ05vIHNlbGVjdGVkIGNvbmZpZ3VyYXRpb25zIScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5zYXZpbmdDb25maWd1cmF0aW9ucyA9IHRydWU7XHJcbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9kZWZhdWx0L3RlbXBsYXRlcy9TYXZlQ29uZmlndXJhdGlvblNldC5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTYXZlQ29uZmlndXJhdGlvblNldENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgLy9zaXplOiBzaXplLFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogeyBkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtjb25maWd1cmF0aW9uczogY29uZmlndXJhdGlvbnMsIG1ldGE6IG1ldGEsIGRlc2lnbk5vZGU6ICRzY29wZS5kYXRhTW9kZWxzLmRlc2lnbi5ub2RlfTtcclxuICAgICAgICAgICAgICAgIH0gfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuc2F2aW5nQ29uZmlndXJhdGlvbnMgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuZ2VuZXJhdGVEYXNoYm9hcmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdleHBvc2VTZWxlY3Rpb24nLCAnZGFzaGJvYXJkJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ2VuZXJhdGVEYXNoYm9hcmQgPSBmdW5jdGlvbiAoY29uZmlndXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICBrZXksXHJcbiAgICAgICAgICAgICAgICByZXN1bHRJZHMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbmZpZ3VyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBjb25maWd1cmF0aW9uc1tpXS5yZXN1bHRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb25zW2ldLnJlc3VsdHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRJZHMucHVzaChrZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVzdWx0SWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGdyb3dsLmluZm8oJ0dlbmVyYXRpbmcgZGFzaGJvYXJkIGZvciAnICsgcmVzdWx0SWRzLmxlbmd0aCArICcgcmVzdWx0cy4nKTtcclxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuZ2VuZXJhdGVEYXNoYm9hcmQoY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCByZXN1bHRJZHMpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdExpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0TGlnaHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnRGFzaGJvYXJkIGdlbmVyYXRlZCAnICsgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCwge3R0bDogLTF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdEYXNoYm9hcmQgZ2VuZXJhdGlvbiBmYWlsZWQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgcmVzdWx0TGlnaHQubWVzc2FnZXMubGVuZ3RoOyBrICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3Jvd2wuaGFzT3duUHJvcGVydHkocmVzdWx0TGlnaHQubWVzc2FnZXNba10uc2V2ZXJpdHkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsW3Jlc3VsdExpZ2h0Lm1lc3NhZ2VzW2tdLnNldmVyaXR5XShyZXN1bHRMaWdodC5tZXNzYWdlc1trXS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKHJlc3VsdExpZ2h0Lm1lc3NhZ2VzW2tdLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignRGFzaGJvYXJkIGdlbmVyYXRpb24gZmFpbGVkLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnTm8gcmVzdWx0cyBpbiBzZWxlY3RlZCBjb25maWd1cmF0aW9ucyEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3NlbGVjdGlvbkV4cG9zZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEsIGVUeXBlKSB7XHJcbiAgICAgICAgICAgIGlmIChlVHlwZSA9PT0gJ3NhdmUnKSB7XHJcbiAgICAgICAgICAgICAgICBzYXZlQ29uZmlndXJhdGlvbnMoZGF0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZVR5cGUgPT09ICdkYXNoYm9hcmQnKSB7XHJcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZURhc2hib2FyZChkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnbk5vZGUoY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdMb2FkIHNob3VsZG50IGhhcHBlbicpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5kZXNpZ24gPSB1cGRhdGVPYmplY3QuZGF0YTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnRGVzaWduIE5vZGUgd2FzIHJlbW92ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy93b3Jrc3BhY2VEZXRhaWxzLycgKyB3b3Jrc3BhY2VJZC5yZXBsYWNlKC9cXC8vZywgJy0nKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5kZXNpZ24gPSBkYXRhLmRlc2lnbjtcclxuICAgICAgICAgICAgICAgICAgICBtZXRhID0gZGF0YS5tZXRhO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLmNvbnRyb2xsZXIoJ1NhdmVDb25maWd1cmF0aW9uU2V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCAkdGltZW91dCwgZ3Jvd2wsIGRhdGEsIGRlc2lnblNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucyxcclxuICAgICAgICAgICAgbWV0YSA9IGRhdGEubWV0YSxcclxuICAgICAgICAgICAgZGVzaWduTm9kZSA9IGRhdGEuZGVzaWduTm9kZTtcclxuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG51bGwsXHJcbiAgICAgICAgICAgIG5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgIG5ick9mQ29uZmlndXJhdGlvbnM6IGNvbmZpZ3VyYXRpb25zLmxlbmd0aFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCEkc2NvcGUuZGF0YS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdZb3UgbXVzdCBwcm92aWRlIGEgbmFtZSEnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBncm93bC5pbmZvKCdTYXZpbmcgY29uZmlndXJhdGlvbiBzZXQgJyArICRzY29wZS5kYXRhLm5hbWUgKyAndGhpcyBtYXkgdGFrZSBhIHdoaWxlLi4uJyk7XHJcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uuc2F2ZUNvbmZpZ3VyYXRpb25TZXROb2Rlcygkc2NvcGUuZGF0YS5uYW1lLCAkc2NvcGUuZGF0YS5kZXNjcmlwdGlvbiwgY29uZmlndXJhdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLCBtZXRhKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoJ0NvbmZpZ3VyYXRpb25zIHNhdmVkIHRvICcgKyAkc2NvcGUuZGF0YS5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgkc2NvcGUuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcpXHJcbiAgICAuY29udHJvbGxlcignVGVzdEJlbmNoQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJHRpbWVvdXQsICRsb2NhdGlvbiwgZ3Jvd2wsIHRlc3RCZW5jaFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICdteS1kYi1jb25uZWN0aW9uLWlkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSgvLS9nLCAnLycpLFxyXG4gICAgICAgICAgICB0ZXN0QmVuY2hJZCA9ICRzdGF0ZS5wYXJhbXMudGVzdEJlbmNoSWQucmVwbGFjZSgvLS9nLCAnLycpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnVGVzdEJlbmNoQ29udHJvbGxlcicpO1xyXG4gICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb250ZXh0LmRiO1xyXG5cclxuICAgICAgICAkc2NvcGUud29ya3NwYWNlSWQgPSB3b3Jrc3BhY2VJZDtcclxuICAgICAgICAkc2NvcGUudGVzdEJlbmNoSWQgPSB0ZXN0QmVuY2hJZDtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnVGVzdEJlbmNoQ29udHJvbGxlcicgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLnN0YXRlID0ge1xyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uU3RhdHVzOiAnU2VsZWN0IGEgVG9wIExldmVsIFN5c3RlbSBVbmRlciBUZXN0Li4uJyxcclxuICAgICAgICAgICAgZGVzaWduSWQ6IG51bGxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVscyA9IHtcclxuICAgICAgICAgICAgdGVzdEJlbmNoOiB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnTG9hZGluZyB0ZXN0LWJlbmNoLi4nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiBbXSxcclxuICAgICAgICAgICAgc2V0TmFtZTogbnVsbFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2NvbmZpZ3VyYXRpb25zTG9hZGVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gW107XHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucztcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnNldE5hbWUgPSBkYXRhLnNldE5hbWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb25maWd1cmF0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdUaGVyZSB3ZXJlIG5vIGNvbmZpZ3VyYXRpb25zIGluICcgKyBkYXRhLnNldE5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ1NlbGVjdCBhbiBhY3Rpb24gYWJvdmUuLi4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbigndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RTZXQnLCBmdW5jdGlvbiAoZXZlbnQsIG5ld0xpc3RJdGVtLCBvbGRMaXN0SXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLm5vZGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9PT0gbmV3TGlzdEl0ZW0uaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdEZXNpZ24gc3BhY2UgaXMgYWxyZWFkeSBzZXQgYXMgVG9wIExldmVsIFN5c3RlbSBVbmRlciBUZXN0LicpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9IG5ld0xpc3RJdGVtLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdMaXN0SXRlbS5jc3NDbGFzcyA9ICd0b3AtbGV2ZWwtc3lzdGVtLXVuZGVyLXRlc3QnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkTGlzdEl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZExpc3RJdGVtLmNzc0NsYXNzID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLm5vZGUubWFrZVBvaW50ZXIoJ1RvcExldmVsU3lzdGVtVW5kZXJUZXN0JywgbmV3TGlzdEl0ZW0uaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8kc2NvcGUuc3RhdGUuZGVzaWduSWQgPSBuZXdMaXN0SXRlbS5pZDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdFNldCcsIG5ld0xpc3RJdGVtLCBvbGRMaXN0SXRlbSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdDYW4gbm90IHNldCBUTFNVVCB3aGlsZSB0ZXN0LWJlbmNoIGhhcyBub3QgYmVlbiBsb2FkZWQuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignc2VsZWN0aW9uRXhwb3NlZCcsIGZ1bmN0aW9uIChldmVudCwgY29uZmlndXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgbnVtQ2ZncyA9IGNvbmZpZ3VyYXRpb25zLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIGludm9rZVRlc3RCZW5jaFJ1bm5lciA9IGZ1bmN0aW9uIChjb25maWd1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5ydW5UZXN0QmVuY2goY29udGV4dCwgdGVzdEJlbmNoSWQsIGNvbmZpZ3VyYXRpb24uaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHRMaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGo7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0TGlnaHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoJ1Rlc3RCZW5jaCBydW4gc3VjY2Vzc2Z1bGx5IG9uICcgKyBjb25maWd1cmF0aW9uLm5hbWUgKyAnLicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRMaWdodC5hcnRpZmFjdHNIdG1sLCB7dHRsOiAtMX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignVGVzdEJlbmNoIHJ1biBmYWlsZWQgb24gJyArIGNvbmZpZ3VyYXRpb24ubmFtZSArICcuJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdExpZ2h0LmFydGlmYWN0c0h0bWwsIHt0dGw6IC0xfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHJlc3VsdExpZ2h0Lm1lc3NhZ2VzLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncm93bC5oYXNPd25Qcm9wZXJ0eShyZXN1bHRMaWdodC5tZXNzYWdlc1tqXS5zZXZlcml0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsW3Jlc3VsdExpZ2h0Lm1lc3NhZ2VzW2pdLnNldmVyaXR5XShyZXN1bHRMaWdodC5tZXNzYWdlc1tqXS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcocmVzdWx0TGlnaHQubWVzc2FnZXNbal0ubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignUnVubmluZyB0ZXN0LWJlbmNoIGZhaWxlZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAobnVtQ2ZncyA8IDEpIHtcclxuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ05vIHNlbGVjdGVkIGNvbmZpZ3VyYXRpb25zIScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2ZnczsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbnNbaV07XHJcbiAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdUZXN0LWJlbmNoIHN0YXJ0ZWQgb24gJyArIGNvbmZpZ3VyYXRpb24ubmFtZSArICcgWycgKyAoaSArIDEpLnRvU3RyaW5nKCkgKyAnLycgKyBudW1DZmdzICsgJ10nKTtcclxuICAgICAgICAgICAgICAgIGludm9rZVRlc3RCZW5jaFJ1bm5lcihjb25maWd1cmF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2NvcGUucnVuVGVzdEJlbmNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnZXhwb3NlU2VsZWN0aW9uJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGVzdEJlbmNoU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hOb2RlKGNvbnRleHQsICRzY29wZS50ZXN0QmVuY2hJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTG9hZCBzaG91bGQgbm90IGhhcHBlbicpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2ggPSB1cGRhdGVPYmplY3QuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnRsc3V0Q2hhbmdlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RDaGFuZ2VkJywgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLnRsc3V0SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnVGVzdCBCZW5jaCB3YXMgcmVtb3ZlZCEnKTtcclxuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3dvcmtzcGFjZURldGFpbHMvJyArIHdvcmtzcGFjZUlkLnJlcGxhY2UoL1xcLy9nLCAnLScpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaCA9IGRhdGEudGVzdEJlbmNoO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnRlc3RCZW5jaC50bHN1dElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdENoYW5nZWQnLCBkYXRhLnRlc3RCZW5jaC50bHN1dElkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgJHdpbmRvdywgJHN0YXRlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSgvLS9nLCAnLycpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIHdvcmtzcGFjZUlkKTtcclxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVsID0ge1xyXG4gICAgICAgICAgICB3b3Jrc3BhY2VJZDogd29ya3NwYWNlSWRcclxuICAgICAgICB9O1xyXG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvci5pdGVtcyA9IFt7XHJcbiAgICAgICAgICAgIGlkOiAncm9vdCcsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnQURNRWRpdG9yJyxcclxuICAgICAgICAgICAgaXRlbUNsYXNzOiAnY3lwaHktcm9vdCcsXHJcbiAgICAgICAgICAgIG1lbnU6IFt7XHJcbiAgICAgICAgICAgICAgICBpZDogJ2VkaXRvcicsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIGVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3InLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH1dO1xyXG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvci5zZXBhcmF0b3IgPSBmYWxzZTtcclxuICAgICAgICAvL2RlYnVnZ2VyO1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcpXHJcbiAgICAuY29udHJvbGxlcignV29ya3NwYWNlc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHdpbmRvdykge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICBjb25zb2xlLmxvZygnV29ya3NwYWNlc0NvbnRyb2xsZXInKTtcclxuICAgICAgICAkcm9vdFNjb3BlLm1haW5OYXZpZ2F0b3IuaXRlbXMgPSBbe1xyXG4gICAgICAgICAgICBpZDogJ3Jvb3QnLFxyXG4gICAgICAgICAgICBsYWJlbDogJ0FETUVkaXRvcicsXHJcbiAgICAgICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnLFxyXG4gICAgICAgICAgICBtZW51OiBbe1xyXG4gICAgICAgICAgICAgICAgaWQ6ICdlZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBlZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJywgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9XTtcclxuICAgICAgICAkcm9vdFNjb3BlLm1haW5OYXZpZ2F0b3Iuc2VwYXJhdG9yID0gZmFsc2U7XHJcbiAgICB9KTsiXX0=
