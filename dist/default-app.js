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
                                    if (growl.hasOwnProperty(resultLight.messages[i].severity)) {
                                        growl[resultLight.messages[i].severity](resultLight.messages[i].message);
                                    } else {
                                        growl.warning(resultLight.messages[i].message);
                                    }
                                }
                            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL2RlZmF1bHQvYXBwLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvRGVzaWduU3BhY2UvRGVzaWduU3BhY2VDb250cm9sbGVyLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXIuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9hcHAvZGVmYXVsdC92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgd2luZG93LCByZXF1aXJlKi9cclxuXHJcbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcclxuICAgICd1aS5yb3V0ZXInLFxyXG5cclxuICAgICdnbWUuc2VydmljZXMnLFxyXG5cclxuICAgICdpc2lzLnVpLmNvbXBvbmVudHMnLFxyXG5cclxuICAgICdjeXBoeS5jb21wb25lbnRzJyxcclxuXHJcbiAgICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXHJcbiAgICAnY3lwaHkuZGVmYXVsdC50ZW1wbGF0ZXMnXHJcbl0pXHJcbiAgICAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIC8vIEZvciBhbnkgdW5tYXRjaGVkIHVybCwgcmVkaXJlY3QgdG8gL3dvcmtzcGFjZXNcclxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvd29ya3NwYWNlcycpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gTm93IHNldCB1cCB0aGUgc3RhdGVzXHJcbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAgICAgLnN0YXRlKCdpbmRleCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvaW5kZXhcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ3dvcmtzcGFjZXMnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3dvcmtzcGFjZXNcIixcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9Xb3Jrc3BhY2VzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiV29ya3NwYWNlc0NvbnRyb2xsZXJcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ3dvcmtzcGFjZURldGFpbHMnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3dvcmtzcGFjZURldGFpbHMvOndvcmtzcGFjZUlkXCIsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvV29ya3NwYWNlRGV0YWlscy5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIldvcmtzcGFjZURldGFpbHNDb250cm9sbGVyXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkZXNpZ25TcGFjZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvZGVzaWduU3BhY2UvOndvcmtzcGFjZUlkLzpkZXNpZ25JZFwiLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL2RlZmF1bHQvdGVtcGxhdGVzL0Rlc2lnblNwYWNlLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiRGVzaWduU3BhY2VDb250cm9sbGVyXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCd0ZXN0QmVuY2gnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3Rlc3RCZW5jaC86d29ya3NwYWNlSWQvOnRlc3RCZW5jaElkXCIsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvVGVzdEJlbmNoLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiVGVzdEJlbmNoQ29udHJvbGxlclwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5ydW4oZnVuY3Rpb24gKCRzdGF0ZSwgZGF0YVN0b3JlU2VydmljZSwgcHJvamVjdFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGNvbm5lY3Rpb25JZCA9ICdteS1kYi1jb25uZWN0aW9uLWlkJztcclxuXHJcbiAgICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZShjb25uZWN0aW9uSWQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBzZWxlY3QgZGVmYXVsdCBwcm9qZWN0IGFuZCBicmFuY2ggKG1hc3RlcilcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9qZWN0U2VydmljZS5zZWxlY3RQcm9qZWN0KGNvbm5lY3Rpb25JZCwgJ0FETUVkaXRvcicpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuXHJcbnJlcXVpcmUoJy4vdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlcicpO1xyXG5yZXF1aXJlKCcuL3ZpZXdzL1dvcmtzcGFjZURldGFpbHMvV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInKTtcclxucmVxdWlyZSgnLi92aWV3cy9EZXNpZ25TcGFjZS9EZXNpZ25TcGFjZUNvbnRyb2xsZXInKTtcclxucmVxdWlyZSgnLi92aWV3cy9UZXN0QmVuY2gvVGVzdEJlbmNoQ29udHJvbGxlcicpOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnblNwYWNlQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJHRpbWVvdXQsICRtb2RhbCwgJGxvY2F0aW9uLCBncm93bCwgZGVzZXJ0U2VydmljZSwgZGVzaWduU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGNvbnRleHQsXHJcbiAgICAgICAgICAgIG1ldGEsXHJcbiAgICAgICAgICAgIHdvcmtzcGFjZUlkID0gJHN0YXRlLnBhcmFtcy53b3Jrc3BhY2VJZC5yZXBsYWNlKC8tL2csICcvJyksXHJcbiAgICAgICAgICAgIGRlc2lnbklkID0gJHN0YXRlLnBhcmFtcy5kZXNpZ25JZC5yZXBsYWNlKC8tL2csICcvJyk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXNpZ25TcGFjZUNvbnRyb2xsZXInKTtcclxuICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gJ215LWRiLWNvbm5lY3Rpb24taWQnO1xyXG4gICAgICAgICRzY29wZS53b3Jrc3BhY2VJZCA9IHdvcmtzcGFjZUlkO1xyXG4gICAgICAgICRzY29wZS5kZXNpZ25JZCA9IGRlc2lnbklkO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25TcGFjZUNvbnRyb2xsZXInICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5zdGF0ZSA9IHtcclxuICAgICAgICAgICAgZGVzaWduVHJlZUxvYWRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGRlc2VydElucHV0QXZhbGlhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgY29uZmlndXJhdGlvblN0YXR1czogJ1NlbGVjdCBhbiBhY3Rpb24gYWJvdmUuLi4nLFxyXG4gICAgICAgICAgICBoYXNDb21wb25lbnRzOiB0cnVlLFxyXG4gICAgICAgICAgICBzYXZpbmdDb25maWd1cmF0aW9uczogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVscyA9IHtcclxuICAgICAgICAgICAgYXZtSWRzOiB7fSxcclxuICAgICAgICAgICAgZGVzZXJ0SW5wdXQ6IHt9LFxyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uczogW10sXHJcbiAgICAgICAgICAgIHNldE5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgIGRlc2lnbjoge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0xvYWRpbmcgZGVzaWduLi4uJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZGVzaWduVHJlZUxvYWRlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5hdm1JZHMgPSBkYXRhO1xyXG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuaGFzQ29tcG9uZW50cyA9IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5kZXNpZ25UcmVlTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignc2VsZWN0ZWRJbnN0YW5jZXMnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgZ3Jvd2wuaW5mbyhkYXRhLm5hbWUgKyAnIGhhcyAnICsgZGF0YS5pZHMubGVuZ3RoICsgJyBpbnN0YW5jZShzKS4nKTtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3NldFNlbGVjdGVkTm9kZXMnLCBkYXRhLmlkcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2NvbmZpZ3VyYXRpb25DbGlja2VkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgaWRzID0gW107XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBkYXRhLmFsdGVybmF0aXZlQXNzaWdubWVudHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGlkcy5wdXNoKGRhdGEuYWx0ZXJuYXRpdmVBc3NpZ25tZW50c1tpXS5zZWxlY3RlZEFsdGVybmF0aXZlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2V0U2VsZWN0ZWROb2RlcycsIGlkcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2Rlc2VydElucHV0UmVhZHknLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuZGVzZXJ0SW5wdXQgPSBkYXRhO1xyXG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuZGVzZXJ0SW5wdXRBdmFsaWFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignY29uZmlndXJhdGlvbnNMb2FkZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9IGRhdGEuc2V0TmFtZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucztcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbmZpZ3VyYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ1RoZXJlIHdlcmUgbm8gY29uZmlndXJhdGlvbnMgaW4gJyArIGRhdGEuc2V0TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnU2VsZWN0IGFuIGFjdGlvbiBhYm92ZS4uLic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FsY3VsYXRlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGdyb3dsLmluZm8oJ0NhbGN1bGF0aW5nIGNvbmZpZ3VyYXRpb25zLiBQbGVhc2Ugd2FpdC4uJyk7XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ0NhbGN1bGF0aW5nLi4nO1xyXG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IFtdO1xyXG4gICAgICAgICAgICBkZXNlcnRTZXJ2aWNlLmNhbGN1bGF0ZUNvbmZpZ3VyYXRpb25zKCRzY29wZS5kYXRhTW9kZWxzLmRlc2VydElucHV0KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY29uZmlndXJhdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gY29uZmlndXJhdGlvbnM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9ICdjYWxjdWxhdGVkJztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5zYXZlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdleHBvc2VTZWxlY3Rpb24nKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdzZWxlY3Rpb25FeHBvc2VkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdObyBzZWxlY3RlZCBjb25maWd1cmF0aW9ucyEnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuc2F2aW5nQ29uZmlndXJhdGlvbnMgPSB0cnVlO1xyXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvZGVmYXVsdC90ZW1wbGF0ZXMvU2F2ZUNvbmZpZ3VyYXRpb25TZXQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2F2ZUNvbmZpZ3VyYXRpb25TZXRDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIC8vc2l6ZTogc2l6ZSxcclxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHsgZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7Y29uZmlndXJhdGlvbnM6IGRhdGEsIG1ldGE6IG1ldGEsIGRlc2lnbk5vZGU6ICRzY29wZS5kYXRhTW9kZWxzLmRlc2lnbi5ub2RlfTtcclxuICAgICAgICAgICAgICAgIH0gfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuc2F2aW5nQ29uZmlndXJhdGlvbnMgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZGVzaWduU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hEZXNpZ25Ob2RlKGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTG9hZCBzaG91bGRudCBoYXBwZW4nKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuZGVzaWduID0gdXBkYXRlT2JqZWN0LmRhdGE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ0Rlc2lnbiBOb2RlIHdhcyByZW1vdmVkIScpO1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvd29ya3NwYWNlRGV0YWlscy8nICsgd29ya3NwYWNlSWQucmVwbGFjZSgvXFwvL2csICctJykpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuZGVzaWduID0gZGF0YS5kZXNpZ247XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0YSA9IGRhdGEubWV0YTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jb250cm9sbGVyKCdTYXZlQ29uZmlndXJhdGlvblNldENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgJHRpbWVvdXQsIGdyb3dsLCBkYXRhLCBkZXNpZ25TZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBjb25maWd1cmF0aW9ucyA9IGRhdGEuY29uZmlndXJhdGlvbnMsXHJcbiAgICAgICAgICAgIG1ldGEgPSBkYXRhLm1ldGEsXHJcbiAgICAgICAgICAgIGRlc2lnbk5vZGUgPSBkYXRhLmRlc2lnbk5vZGU7XHJcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBudWxsLFxyXG4gICAgICAgICAgICBuYW1lOiBudWxsLFxyXG4gICAgICAgICAgICBuYnJPZkNvbmZpZ3VyYXRpb25zOiBjb25maWd1cmF0aW9ucy5sZW5ndGhcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghJHNjb3BlLmRhdGEubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnWW91IG11c3QgcHJvdmlkZSBhIG5hbWUhJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZ3Jvd2wuaW5mbygnU2F2aW5nIGNvbmZpZ3VyYXRpb24gc2V0ICcgKyAkc2NvcGUuZGF0YS5uYW1lICsgJ3RoaXMgbWF5IHRha2UgYSB3aGlsZS4uLicpO1xyXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLnNhdmVDb25maWd1cmF0aW9uU2V0Tm9kZXMoJHNjb3BlLmRhdGEubmFtZSwgJHNjb3BlLmRhdGEuZGVzY3JpcHRpb24sIGNvbmZpZ3VyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgZGVzaWduTm9kZSwgbWV0YSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdDb25maWd1cmF0aW9ucyBzYXZlZCB0byAnICsgJHNjb3BlLmRhdGEubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoJHNjb3BlLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1Rlc3RCZW5jaENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICR0aW1lb3V0LCAkbG9jYXRpb24sIGdyb3dsLCB0ZXN0QmVuY2hTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAnbXktZGItY29ubmVjdGlvbi1pZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgd29ya3NwYWNlSWQgPSAkc3RhdGUucGFyYW1zLndvcmtzcGFjZUlkLnJlcGxhY2UoLy0vZywgJy8nKSxcclxuICAgICAgICAgICAgdGVzdEJlbmNoSWQgPSAkc3RhdGUucGFyYW1zLnRlc3RCZW5jaElkLnJlcGxhY2UoLy0vZywgJy8nKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1Rlc3RCZW5jaENvbnRyb2xsZXInKTtcclxuICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gY29udGV4dC5kYjtcclxuXHJcbiAgICAgICAgJHNjb3BlLndvcmtzcGFjZUlkID0gd29ya3NwYWNlSWQ7XHJcbiAgICAgICAgJHNjb3BlLnRlc3RCZW5jaElkID0gdGVzdEJlbmNoSWQ7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ1Rlc3RCZW5jaENvbnRyb2xsZXInICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5zdGF0ZSA9IHtcclxuICAgICAgICAgICAgY29uZmlndXJhdGlvblN0YXR1czogJ1NlbGVjdCBhIFRvcCBMZXZlbCBTeXN0ZW0gVW5kZXIgVGVzdC4uLicsXHJcbiAgICAgICAgICAgIGRlc2lnbklkOiBudWxsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMgPSB7XHJcbiAgICAgICAgICAgIHRlc3RCZW5jaDoge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0xvYWRpbmcgdGVzdC1iZW5jaC4uJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uczogW10sXHJcbiAgICAgICAgICAgIHNldE5hbWU6IG51bGxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdjb25maWd1cmF0aW9uc0xvYWRlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IFtdO1xyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IGRhdGEuY29uZmlndXJhdGlvbnM7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gZGF0YS5zZXROYW1lO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuY29uZmlndXJhdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnVGhlcmUgd2VyZSBubyBjb25maWd1cmF0aW9ucyBpbiAnICsgZGF0YS5zZXROYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuY29uZmlndXJhdGlvblN0YXR1cyA9ICdTZWxlY3QgYW4gYWN0aW9uIGFib3ZlLi4uJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0U2V0JywgZnVuY3Rpb24gKGV2ZW50LCBuZXdMaXN0SXRlbSwgb2xkTGlzdEl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC5ub2RlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLnRsc3V0SWQgPT09IG5ld0xpc3RJdGVtLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbygnRGVzaWduIHNwYWNlIGlzIGFscmVhZHkgc2V0IGFzIFRvcCBMZXZlbCBTeXN0ZW0gVW5kZXIgVGVzdC4nKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLnRsc3V0SWQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLnRsc3V0SWQgPSBuZXdMaXN0SXRlbS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TGlzdEl0ZW0uY3NzQ2xhc3MgPSAndG9wLWxldmVsLXN5c3RlbS11bmRlci10ZXN0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9sZExpc3RJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRMaXN0SXRlbS5jc3NDbGFzcyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC5ub2RlLm1ha2VQb2ludGVyKCdUb3BMZXZlbFN5c3RlbVVuZGVyVGVzdCcsIG5ld0xpc3RJdGVtLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vJHNjb3BlLnN0YXRlLmRlc2lnbklkID0gbmV3TGlzdEl0ZW0uaWQ7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RTZXQnLCBuZXdMaXN0SXRlbSwgb2xkTGlzdEl0ZW0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnQ2FuIG5vdCBzZXQgVExTVVQgd2hpbGUgdGVzdC1iZW5jaCBoYXMgbm90IGJlZW4gbG9hZGVkLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3NlbGVjdGlvbkV4cG9zZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGNvbmZpZ3VyYXRpb25zKSB7XHJcbiAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbixcclxuICAgICAgICAgICAgICAgIG51bUNmZ3MgPSBjb25maWd1cmF0aW9ucy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBpbnZva2VUZXN0QmVuY2hSdW5uZXIgPSBmdW5jdGlvbiAoY29uZmlndXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucnVuVGVzdEJlbmNoKGNvbnRleHQsIHRlc3RCZW5jaElkLCBjb25maWd1cmF0aW9uLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0TGlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBqO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdExpZ2h0LnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdUZXN0QmVuY2ggcnVuIHN1Y2Nlc3NmdWxseSBvbiAnICsgY29uZmlndXJhdGlvbi5uYW1lICsgJy4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCwge3R0bDogLTF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ1Rlc3RCZW5jaCBydW4gZmFpbGVkIG9uICcgKyBjb25maWd1cmF0aW9uLm5hbWUgKyAnLicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRMaWdodC5hcnRpZmFjdHNIdG1sLCB7dHRsOiAtMX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCByZXN1bHRMaWdodC5tZXNzYWdlcy5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3Jvd2wuaGFzT3duUHJvcGVydHkocmVzdWx0TGlnaHQubWVzc2FnZXNbaV0uc2V2ZXJpdHkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bFtyZXN1bHRMaWdodC5tZXNzYWdlc1tpXS5zZXZlcml0eV0ocmVzdWx0TGlnaHQubWVzc2FnZXNbaV0ubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKHJlc3VsdExpZ2h0Lm1lc3NhZ2VzW2ldLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJSdW5uaW5nIHRlc3QtYmVuY2ggZmFpbGVkLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAobnVtQ2ZncyA8IDEpIHtcclxuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ05vIHNlbGVjdGVkIGNvbmZpZ3VyYXRpb25zIScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2ZnczsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbnNbaV07XHJcbiAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdUZXN0LWJlbmNoIHN0YXJ0ZWQgb24gJyArIGNvbmZpZ3VyYXRpb24ubmFtZSArICcgWycgKyAoaSArIDEpLnRvU3RyaW5nKCkgKyAnLycgKyBudW1DZmdzICsgJ10nKTtcclxuICAgICAgICAgICAgICAgIGludm9rZVRlc3RCZW5jaFJ1bm5lcihjb25maWd1cmF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2NvcGUucnVuVGVzdEJlbmNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnZXhwb3NlU2VsZWN0aW9uJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGVzdEJlbmNoU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hOb2RlKGNvbnRleHQsICRzY29wZS50ZXN0QmVuY2hJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTG9hZCBzaG91bGQgbm90IGhhcHBlbicpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2ggPSB1cGRhdGVPYmplY3QuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnRsc3V0Q2hhbmdlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RDaGFuZ2VkJywgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLnRsc3V0SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnVGVzdCBCZW5jaCB3YXMgcmVtb3ZlZCEnKTtcclxuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3dvcmtzcGFjZURldGFpbHMvJyArIHdvcmtzcGFjZUlkLnJlcGxhY2UoL1xcLy9nLCAnLScpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaCA9IGRhdGEudGVzdEJlbmNoO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnRlc3RCZW5jaC50bHN1dElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdENoYW5nZWQnLCBkYXRhLnRlc3RCZW5jaC50bHN1dElkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSgvLS9nLCAnLycpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIHdvcmtzcGFjZUlkKTtcclxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVsID0ge1xyXG4gICAgICAgICAgICB3b3Jrc3BhY2VJZDogd29ya3NwYWNlSWRcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vZGVidWdnZXI7XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJylcclxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VzQ29udHJvbGxlcicpO1xyXG4gICAgfSk7Il19
