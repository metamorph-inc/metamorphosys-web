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
    .controller('DesignSpaceController', function ($scope, $state, $timeout, $modal, $location, growl, desertService, designService) {
        'use strict';
        var self = this,
            context,
            meta,
            workspaceId = $state.params.workspaceId.replace(/-/g, '/'),
            designId = $state.params.designId.replace(/-/g, '/');

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
            savingConfigurations: false
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
            $scope.dataModels.configurations = [];
            $timeout(function () {
                $scope.dataModels.setName = data.setName;
                $scope.dataModels.configurations = data.configurations;
                if (data.configurations.length === 0) {
                    growl.warning('There were no configurations in ' + data.setName);
                    $scope.state.configurationStatus = 'Select an action above...';
                }
            });
        });

        $scope.calculateConfigurations = function () {
            growl.info('Calculating configurations. Please wait..');
            $scope.state.configurationStatus = 'Calculating..';
            $scope.dataModels.configurations = [];
            desertService.calculateConfigurations($scope.dataModels.desertInput)
                .then(function (configurations) {
                    console.log(configurations);
                    $scope.dataModels.configurations = configurations;
                    $scope.dataModels.setName = 'calculated';
                });
        };

        $scope.saveConfigurations = function () {
            $scope.$broadcast('exposeSelection');
        };

        $scope.$on('selectionExposed', function (event, data) {
            var modalInstance;
            if (data.length < 1) {
                growl.warning('No selected configurations!');
                return;
            }
            $scope.state.savingConfigurations = true;
            modalInstance = $modal.open({
                templateUrl: '/default/templates/SaveConfigurationSet.html',
                controller: 'SaveConfigurationSetController',
                //size: size,
                resolve: { data: function () {
                    return {configurations: data, meta: meta, designNode: $scope.dataModels.design.node};
                } }
            });
            modalInstance.result.then(function (result) {
                $scope.state.savingConfigurations = false;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
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
                runTestBench = function (configuration) {
                    testBenchService.runTestBench(context, testBenchId, configuration.id)
                        .then(function (result) {
                            growl.success('TestBench run successfully on ' + configuration.name + '.');
                        })
                        .catch(function (reason) {
                            console.error(reason);
                            growl.error("Running test-bench failed.");
                        });
                };
            if (numCfgs < 1) {
                growl.warning('No selected configurations!');
                return;
            }

            for (i = 0; i < numCfgs; i += 1) {
                configuration = configurations[i];
                growl.info('Test-bench started on ' + configuration.name + ' [' + (i + 1).toString() + '/' + numCfgs + ']');
                runTestBench(configuration);
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
    .controller('WorkspaceDetailsController', function ($scope, $state) {
        'use strict';
        var workspaceId = $state.params.workspaceId.replace(/-/g, '/');
        console.log('WorkspaceDetailsController', workspaceId);
        $scope.dataModel = {
            workspaceId: workspaceId
        };
        //debugger;
    });
},{}],5:[function(require,module,exports){
/*globals angular, console */

angular.module('CyPhyApp')
    .controller('WorkspacesController', function ($scope) {
        'use strict';

        console.log('WorkspacesController');
    });
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL2RlZmF1bHQvYXBwLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvRGVzaWduU3BhY2UvRGVzaWduU3BhY2VDb250cm9sbGVyLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXIuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9hcHAvZGVmYXVsdC92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCB3aW5kb3csIHJlcXVpcmUqL1xyXG5cclxudmFyIEN5UGh5QXBwID0gYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJywgW1xyXG4gICAgJ3VpLnJvdXRlcicsXHJcblxyXG4gICAgJ2dtZS5zZXJ2aWNlcycsXHJcblxyXG4gICAgJ2lzaXMudWkuY29tcG9uZW50cycsXHJcblxyXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnLFxyXG5cclxuICAgIC8vIGFwcCBzcGVjaWZpYyB0ZW1wbGF0ZXNcclxuICAgICdjeXBoeS5kZWZhdWx0LnRlbXBsYXRlcydcclxuXSlcclxuICAgIC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgLy8gRm9yIGFueSB1bm1hdGNoZWQgdXJsLCByZWRpcmVjdCB0byAvd29ya3NwYWNlc1xyXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy93b3Jrc3BhY2VzJyk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBOb3cgc2V0IHVwIHRoZSBzdGF0ZXNcclxuICAgICAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9pbmRleFwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnd29ya3NwYWNlcycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvd29ya3NwYWNlc1wiLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL2RlZmF1bHQvdGVtcGxhdGVzL1dvcmtzcGFjZXMuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJXb3Jrc3BhY2VzQ29udHJvbGxlclwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnd29ya3NwYWNlRGV0YWlscycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvd29ya3NwYWNlRGV0YWlscy86d29ya3NwYWNlSWRcIixcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9Xb3Jrc3BhY2VEZXRhaWxzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXJcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ2Rlc2lnblNwYWNlJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9kZXNpZ25TcGFjZS86d29ya3NwYWNlSWQvOmRlc2lnbklkXCIsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvRGVzaWduU3BhY2UuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJEZXNpZ25TcGFjZUNvbnRyb2xsZXJcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ3Rlc3RCZW5jaCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvdGVzdEJlbmNoLzp3b3Jrc3BhY2VJZC86dGVzdEJlbmNoSWRcIixcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9UZXN0QmVuY2guaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJUZXN0QmVuY2hDb250cm9sbGVyXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLnJ1bihmdW5jdGlvbiAoJHN0YXRlLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgY29ubmVjdGlvbklkID0gJ215LWRiLWNvbm5lY3Rpb24taWQnO1xyXG5cclxuICAgICAgICBkYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKGNvbm5lY3Rpb25JZCwge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIHNlbGVjdCBkZWZhdWx0IHByb2plY3QgYW5kIGJyYW5jaCAobWFzdGVyKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoY29ubmVjdGlvbklkLCAnQURNRWRpdG9yJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG5cclxucmVxdWlyZSgnLi92aWV3cy9Xb3Jrc3BhY2VzL1dvcmtzcGFjZXNDb250cm9sbGVyJyk7XHJcbnJlcXVpcmUoJy4vdmlld3MvV29ya3NwYWNlRGV0YWlscy9Xb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicpO1xyXG5yZXF1aXJlKCcuL3ZpZXdzL0Rlc2lnblNwYWNlL0Rlc2lnblNwYWNlQ29udHJvbGxlcicpO1xyXG5yZXF1aXJlKCcuL3ZpZXdzL1Rlc3RCZW5jaC9UZXN0QmVuY2hDb250cm9sbGVyJyk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcpXHJcbiAgICAuY29udHJvbGxlcignRGVzaWduU3BhY2VDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkdGltZW91dCwgJG1vZGFsLCAkbG9jYXRpb24sIGdyb3dsLCBkZXNlcnRTZXJ2aWNlLCBkZXNpZ25TZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgY29udGV4dCxcclxuICAgICAgICAgICAgbWV0YSxcclxuICAgICAgICAgICAgd29ya3NwYWNlSWQgPSAkc3RhdGUucGFyYW1zLndvcmtzcGFjZUlkLnJlcGxhY2UoLy0vZywgJy8nKSxcclxuICAgICAgICAgICAgZGVzaWduSWQgPSAkc3RhdGUucGFyYW1zLmRlc2lnbklkLnJlcGxhY2UoLy0vZywgJy8nKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Rlc2lnblNwYWNlQ29udHJvbGxlcicpO1xyXG4gICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSAnbXktZGItY29ubmVjdGlvbi1pZCc7XHJcbiAgICAgICAgJHNjb3BlLndvcmtzcGFjZUlkID0gd29ya3NwYWNlSWQ7XHJcbiAgICAgICAgJHNjb3BlLmRlc2lnbklkID0gZGVzaWduSWQ7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0Rlc2lnblNwYWNlQ29udHJvbGxlcicgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLnN0YXRlID0ge1xyXG4gICAgICAgICAgICBkZXNpZ25UcmVlTG9hZGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgZGVzZXJ0SW5wdXRBdmFsaWFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uU3RhdHVzOiAnU2VsZWN0IGFuIGFjdGlvbiBhYm92ZS4uLicsXHJcbiAgICAgICAgICAgIGhhc0NvbXBvbmVudHM6IHRydWUsXHJcbiAgICAgICAgICAgIHNhdmluZ0NvbmZpZ3VyYXRpb25zOiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5kYXRhTW9kZWxzID0ge1xyXG4gICAgICAgICAgICBhdm1JZHM6IHt9LFxyXG4gICAgICAgICAgICBkZXNlcnRJbnB1dDoge30sXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiBbXSxcclxuICAgICAgICAgICAgc2V0TmFtZTogbnVsbCxcclxuICAgICAgICAgICAgZGVzaWduOiB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnTG9hZGluZyBkZXNpZ24uLi4nXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdkZXNpZ25UcmVlTG9hZGVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmF2bUlkcyA9IGRhdGE7XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5oYXNDb21wb25lbnRzID0gT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmRlc2lnblRyZWVMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdzZWxlY3RlZEluc3RhbmNlcycsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICBncm93bC5pbmZvKGRhdGEubmFtZSArICcgaGFzICcgKyBkYXRhLmlkcy5sZW5ndGggKyAnIGluc3RhbmNlKHMpLicpO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2V0U2VsZWN0ZWROb2RlcycsIGRhdGEuaWRzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignY29uZmlndXJhdGlvbkNsaWNrZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICBpZHMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGRhdGEuYWx0ZXJuYXRpdmVBc3NpZ25tZW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgaWRzLnB1c2goZGF0YS5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzW2ldLnNlbGVjdGVkQWx0ZXJuYXRpdmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzZXRTZWxlY3RlZE5vZGVzJywgaWRzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZGVzZXJ0SW5wdXRSZWFkeScsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5kZXNlcnRJbnB1dCA9IGRhdGE7XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5kZXNlcnRJbnB1dEF2YWxpYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdjb25maWd1cmF0aW9uc0xvYWRlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IFtdO1xyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gZGF0YS5zZXROYW1lO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBkYXRhLmNvbmZpZ3VyYXRpb25zO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuY29uZmlndXJhdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnVGhlcmUgd2VyZSBubyBjb25maWd1cmF0aW9ucyBpbiAnICsgZGF0YS5zZXROYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuY29uZmlndXJhdGlvblN0YXR1cyA9ICdTZWxlY3QgYW4gYWN0aW9uIGFib3ZlLi4uJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS5jYWxjdWxhdGVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZ3Jvd2wuaW5mbygnQ2FsY3VsYXRpbmcgY29uZmlndXJhdGlvbnMuIFBsZWFzZSB3YWl0Li4nKTtcclxuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnQ2FsY3VsYXRpbmcuLic7XHJcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gW107XHJcbiAgICAgICAgICAgIGRlc2VydFNlcnZpY2UuY2FsY3VsYXRlQ29uZmlndXJhdGlvbnMoJHNjb3BlLmRhdGFNb2RlbHMuZGVzZXJ0SW5wdXQpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29uZmlndXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb25maWd1cmF0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBjb25maWd1cmF0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gJ2NhbGN1bGF0ZWQnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnNhdmVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ2V4cG9zZVNlbGVjdGlvbicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3NlbGVjdGlvbkV4cG9zZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2U7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ05vIHNlbGVjdGVkIGNvbmZpZ3VyYXRpb25zIScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5zYXZpbmdDb25maWd1cmF0aW9ucyA9IHRydWU7XHJcbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9kZWZhdWx0L3RlbXBsYXRlcy9TYXZlQ29uZmlndXJhdGlvblNldC5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTYXZlQ29uZmlndXJhdGlvblNldENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgLy9zaXplOiBzaXplLFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogeyBkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtjb25maWd1cmF0aW9uczogZGF0YSwgbWV0YTogbWV0YSwgZGVzaWduTm9kZTogJHNjb3BlLmRhdGFNb2RlbHMuZGVzaWduLm5vZGV9O1xyXG4gICAgICAgICAgICAgICAgfSB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5zYXZpbmdDb25maWd1cmF0aW9ucyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnbk5vZGUoY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdMb2FkIHNob3VsZG50IGhhcHBlbicpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5kZXNpZ24gPSB1cGRhdGVPYmplY3QuZGF0YTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnRGVzaWduIE5vZGUgd2FzIHJlbW92ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy93b3Jrc3BhY2VEZXRhaWxzLycgKyB3b3Jrc3BhY2VJZC5yZXBsYWNlKC9cXC8vZywgJy0nKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5kZXNpZ24gPSBkYXRhLmRlc2lnbjtcclxuICAgICAgICAgICAgICAgICAgICBtZXRhID0gZGF0YS5tZXRhO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLmNvbnRyb2xsZXIoJ1NhdmVDb25maWd1cmF0aW9uU2V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCAkdGltZW91dCwgZ3Jvd2wsIGRhdGEsIGRlc2lnblNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucyxcclxuICAgICAgICAgICAgbWV0YSA9IGRhdGEubWV0YSxcclxuICAgICAgICAgICAgZGVzaWduTm9kZSA9IGRhdGEuZGVzaWduTm9kZTtcclxuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG51bGwsXHJcbiAgICAgICAgICAgIG5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgIG5ick9mQ29uZmlndXJhdGlvbnM6IGNvbmZpZ3VyYXRpb25zLmxlbmd0aFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCEkc2NvcGUuZGF0YS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdZb3UgbXVzdCBwcm92aWRlIGEgbmFtZSEnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBncm93bC5pbmZvKCdTYXZpbmcgY29uZmlndXJhdGlvbiBzZXQgJyArICRzY29wZS5kYXRhLm5hbWUgKyAndGhpcyBtYXkgdGFrZSBhIHdoaWxlLi4uJyk7XHJcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uuc2F2ZUNvbmZpZ3VyYXRpb25TZXROb2Rlcygkc2NvcGUuZGF0YS5uYW1lLCAkc2NvcGUuZGF0YS5kZXNjcmlwdGlvbiwgY29uZmlndXJhdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLCBtZXRhKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoJ0NvbmZpZ3VyYXRpb25zIHNhdmVkIHRvICcgKyAkc2NvcGUuZGF0YS5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgkc2NvcGUuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcpXHJcbiAgICAuY29udHJvbGxlcignVGVzdEJlbmNoQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJHRpbWVvdXQsICRsb2NhdGlvbiwgZ3Jvd2wsIHRlc3RCZW5jaFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICdteS1kYi1jb25uZWN0aW9uLWlkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSgvLS9nLCAnLycpLFxyXG4gICAgICAgICAgICB0ZXN0QmVuY2hJZCA9ICRzdGF0ZS5wYXJhbXMudGVzdEJlbmNoSWQucmVwbGFjZSgvLS9nLCAnLycpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnVGVzdEJlbmNoQ29udHJvbGxlcicpO1xyXG4gICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb250ZXh0LmRiO1xyXG5cclxuICAgICAgICAkc2NvcGUud29ya3NwYWNlSWQgPSB3b3Jrc3BhY2VJZDtcclxuICAgICAgICAkc2NvcGUudGVzdEJlbmNoSWQgPSB0ZXN0QmVuY2hJZDtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnVGVzdEJlbmNoQ29udHJvbGxlcicgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLnN0YXRlID0ge1xyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uU3RhdHVzOiAnU2VsZWN0IGEgVG9wIExldmVsIFN5c3RlbSBVbmRlciBUZXN0Li4uJyxcclxuICAgICAgICAgICAgZGVzaWduSWQ6IG51bGxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVscyA9IHtcclxuICAgICAgICAgICAgdGVzdEJlbmNoOiB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnTG9hZGluZyB0ZXN0LWJlbmNoLi4nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiBbXSxcclxuICAgICAgICAgICAgc2V0TmFtZTogbnVsbFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2NvbmZpZ3VyYXRpb25zTG9hZGVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gW107XHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucztcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnNldE5hbWUgPSBkYXRhLnNldE5hbWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb25maWd1cmF0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdUaGVyZSB3ZXJlIG5vIGNvbmZpZ3VyYXRpb25zIGluICcgKyBkYXRhLnNldE5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ1NlbGVjdCBhbiBhY3Rpb24gYWJvdmUuLi4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbigndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RTZXQnLCBmdW5jdGlvbiAoZXZlbnQsIG5ld0xpc3RJdGVtLCBvbGRMaXN0SXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLm5vZGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9PT0gbmV3TGlzdEl0ZW0uaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdEZXNpZ24gc3BhY2UgaXMgYWxyZWFkeSBzZXQgYXMgVG9wIExldmVsIFN5c3RlbSBVbmRlciBUZXN0LicpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9IG5ld0xpc3RJdGVtLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdMaXN0SXRlbS5jc3NDbGFzcyA9ICd0b3AtbGV2ZWwtc3lzdGVtLXVuZGVyLXRlc3QnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkTGlzdEl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZExpc3RJdGVtLmNzc0NsYXNzID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLm5vZGUubWFrZVBvaW50ZXIoJ1RvcExldmVsU3lzdGVtVW5kZXJUZXN0JywgbmV3TGlzdEl0ZW0uaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8kc2NvcGUuc3RhdGUuZGVzaWduSWQgPSBuZXdMaXN0SXRlbS5pZDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdFNldCcsIG5ld0xpc3RJdGVtLCBvbGRMaXN0SXRlbSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdDYW4gbm90IHNldCBUTFNVVCB3aGlsZSB0ZXN0LWJlbmNoIGhhcyBub3QgYmVlbiBsb2FkZWQuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignc2VsZWN0aW9uRXhwb3NlZCcsIGZ1bmN0aW9uIChldmVudCwgY29uZmlndXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgbnVtQ2ZncyA9IGNvbmZpZ3VyYXRpb25zLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIHJ1blRlc3RCZW5jaCA9IGZ1bmN0aW9uIChjb25maWd1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5ydW5UZXN0QmVuY2goY29udGV4dCwgdGVzdEJlbmNoSWQsIGNvbmZpZ3VyYXRpb24uaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoJ1Rlc3RCZW5jaCBydW4gc3VjY2Vzc2Z1bGx5IG9uICcgKyBjb25maWd1cmF0aW9uLm5hbWUgKyAnLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJSdW5uaW5nIHRlc3QtYmVuY2ggZmFpbGVkLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAobnVtQ2ZncyA8IDEpIHtcclxuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ05vIHNlbGVjdGVkIGNvbmZpZ3VyYXRpb25zIScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2ZnczsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbnNbaV07XHJcbiAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdUZXN0LWJlbmNoIHN0YXJ0ZWQgb24gJyArIGNvbmZpZ3VyYXRpb24ubmFtZSArICcgWycgKyAoaSArIDEpLnRvU3RyaW5nKCkgKyAnLycgKyBudW1DZmdzICsgJ10nKTtcclxuICAgICAgICAgICAgICAgIHJ1blRlc3RCZW5jaChjb25maWd1cmF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2NvcGUucnVuVGVzdEJlbmNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnZXhwb3NlU2VsZWN0aW9uJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGVzdEJlbmNoU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hOb2RlKGNvbnRleHQsICRzY29wZS50ZXN0QmVuY2hJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTG9hZCBzaG91bGQgbm90IGhhcHBlbicpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2ggPSB1cGRhdGVPYmplY3QuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnRsc3V0Q2hhbmdlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RDaGFuZ2VkJywgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLnRsc3V0SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnVGVzdCBCZW5jaCB3YXMgcmVtb3ZlZCEnKTtcclxuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3dvcmtzcGFjZURldGFpbHMvJyArIHdvcmtzcGFjZUlkLnJlcGxhY2UoL1xcLy9nLCAnLScpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaCA9IGRhdGEudGVzdEJlbmNoO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnRlc3RCZW5jaC50bHN1dElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdENoYW5nZWQnLCBkYXRhLnRlc3RCZW5jaC50bHN1dElkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSgvLS9nLCAnLycpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIHdvcmtzcGFjZUlkKTtcclxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVsID0ge1xyXG4gICAgICAgICAgICB3b3Jrc3BhY2VJZDogd29ya3NwYWNlSWRcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vZGVidWdnZXI7XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJylcclxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VzQ29udHJvbGxlcicpO1xyXG4gICAgfSk7Il19
