(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console, window, require*/

var CyPhyApp = angular.module( 'CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.default.templates'
] )
    .config( function ( $stateProvider, $urlRouterProvider ) {
        'use strict';
        // For any unmatched url, redirect to /workspaces
        $urlRouterProvider.otherwise( '/workspaces' );
        //
        // Now set up the states
        $stateProvider
            .state( 'index', {
                url: "/index"
            } )
            .state( 'workspaces', {
                url: "/workspaces",
                templateUrl: "/default/templates/Workspaces.html",
                controller: "WorkspacesController"
            } )
            .state( 'workspaceDetails', {
                url: "/workspaceDetails/:workspaceId",
                templateUrl: "/default/templates/WorkspaceDetails.html",
                controller: "WorkspaceDetailsController"
            } )
            .state( 'designSpace', {
                url: "/designSpace/:workspaceId/:designId",
                templateUrl: "/default/templates/DesignSpace.html",
                controller: "DesignSpaceController"
            } )
            .state( 'testBench', {
                url: "/testBench/:workspaceId/:testBenchId",
                templateUrl: "/default/templates/TestBench.html",
                controller: "TestBenchController"
            } );
    } )
    .controller( 'MainNavigatorController', function ( $rootScope, $scope ) {
        'use strict';
        $scope.navigator = {};
        $scope.navigator.items = [ {
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root'
        } ];
        $rootScope.mainNavigator = $scope.navigator;
    } )
    .run( function ( $state, growl, dataStoreService, projectService ) {
        'use strict';
        var connectionId = 'my-db-connection-id';

        dataStoreService.connectToDatabase( connectionId, {
            host: window.location.basename
        } )
            .then( function () {
                // select default project and branch (master)
                return projectService.selectProject( connectionId, 'ADMEditor' );
            } )
            .
        catch ( function ( reason ) {
            growl.error( 'ADMEditor does not exist. Create and import it using the <a href="' +
                window.location.origin + '"> webgme interface</a>.' );
            console.error( reason );
        } );
    } );


require( './views/Workspaces/WorkspacesController' );
require( './views/WorkspaceDetails/WorkspaceDetailsController' );
require( './views/DesignSpace/DesignSpaceController' );
require( './views/TestBench/TestBenchController' );
},{"./views/DesignSpace/DesignSpaceController":2,"./views/TestBench/TestBenchController":3,"./views/WorkspaceDetails/WorkspaceDetailsController":4,"./views/Workspaces/WorkspacesController":5}],2:[function(require,module,exports){
/*globals angular, console */

angular.module( 'CyPhyApp' )
    .controller( 'DesignSpaceController', function ( $scope, $state, $timeout, $modal, $location, $q, growl,
        desertService, designService ) {
        'use strict';
        var self = this,
            context,
            meta,
            workspaceId = $state.params.workspaceId.replace( /-/g, '/' ),
            designId = $state.params.designId.replace( /-/g, '/' ),
            saveConfigurations,
            generateDashboard,
            cleanUpConfigurations = function () {
                var i,
                    config;
                for ( i = 0; i < $scope.dataModels.configurations.length; i += 1 ) {
                    config = $scope.dataModels.configurations[ i ];
                    if ( config.hasOwnProperty( 'regionId' ) ) {
                        designService.cleanUpRegion( context, config.regionId );
                    }
                }
                $scope.state.resultsAvaliable = false;
                $scope.dataModels.configurations = [];
            };

        console.log( 'DesignSpaceController' );
        $scope.connectionId = 'my-db-connection-id';
        $scope.workspaceId = workspaceId;
        $scope.designId = designId;

        // Check for valid connectionId and register clean-up on destroy event.
        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'DesignSpaceController' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                designService.cleanUpAllRegions( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
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

        $scope.$on( 'designTreeLoaded', function ( event, data ) {
            $scope.dataModels.avmIds = data;
            $scope.state.hasComponents = Object.keys( data )
                .length > 0;
            $scope.state.designTreeLoaded = true;
        } );

        $scope.$on( 'selectedInstances', function ( event, data ) {
            growl.info( data.name + ' has ' + data.ids.length + ' instance(s).' );
            $scope.$broadcast( 'setSelectedNodes', data.ids );
        } );

        $scope.$on( 'configurationClicked', function ( event, data ) {
            var i,
                ids = [];
            for ( i = 0; i < data.alternativeAssignments.length; i += 1 ) {
                ids.push( data.alternativeAssignments[ i ].selectedAlternative );
            }
            $scope.$broadcast( 'setSelectedNodes', ids );
        } );

        $scope.$on( 'desertInputReady', function ( event, data ) {
            $scope.dataModels.desertInput = data;
            $scope.state.desertInputAvaliable = true;
            console.log( data );
        } );

        $scope.$on( 'configurationsLoaded', function ( event, data ) {
            cleanUpConfigurations();
            $timeout( function () {
                var i,
                    queueList = [];
                $scope.dataModels.setName = data.setName;
                $scope.dataModels.configurations = data.configurations;
                if ( data.configurations.length === 0 ) {
                    growl.warning( 'There were no configurations in ' + data.setName );
                    $scope.state.configurationStatus = 'Select an action above...';
                }
                for ( i = 0; i < $scope.dataModels.configurations.length; i += 1 ) {
                    queueList.push( designService.appendWatchResults( context, $scope.dataModels.configurations[
                        i ] ) );
                }
                $q.all( queueList )
                    .then( function ( hasResults ) {
                        hasResults.map( function ( res ) {
                            if ( res === true ) {
                                $scope.state.resultsAvaliable = true;
                            }
                        } );
                    } );
            } );
        } );

        $scope.calculateConfigurations = function () {
            growl.info( 'Calculating configurations. Please wait..' );
            $scope.state.configurationStatus = 'Calculating..';
            cleanUpConfigurations();
            desertService.calculateConfigurations( $scope.dataModels.desertInput )
                .then( function ( configurations ) {
                    $scope.dataModels.configurations = configurations;
                    $scope.dataModels.setName = 'calculated';
                    $scope.state.configurationStatus = 'Calculated';
                } )
                .
            catch ( function ( reason ) {
                console.error( reason );
                growl.error( 'Failed to calculate configurations, see console for more info.' );
                $scope.dataModels.configurations = [];
                $scope.dataModels.setName = '';
                $scope.state.configurationStatus = 'Failed to calculate.';
            } );
        };

        $scope.saveConfigurations = function () {
            $scope.$broadcast( 'exposeSelection', 'save' );
        };

        saveConfigurations = function ( configurations ) {
            var modalInstance;
            if ( configurations.length < 1 ) {
                growl.warning( 'No selected configurations!' );
                return;
            }
            $scope.state.savingConfigurations = true;
            modalInstance = $modal.open( {
                templateUrl: '/default/templates/SaveConfigurationSet.html',
                controller: 'SaveConfigurationSetController',
                //size: size,
                resolve: {
                    data: function () {
                        return {
                            configurations: configurations,
                            meta: meta,
                            context: context,
                            designNode: $scope.dataModels.design.node
                        };
                    }
                }
            } );
            modalInstance.result.then( function ( result ) {
                $scope.state.savingConfigurations = false;
            }, function () {
                console.log( 'Modal dismissed at: ' + new Date() );
            } );
        };

        $scope.generateDashboard = function () {
            $scope.$broadcast( 'exposeSelection', 'dashboard' );
        };

        generateDashboard = function ( configurations ) {
            var i,
                key,
                resultIds = [];
            for ( i = 0; i < configurations.length; i += 1 ) {
                for ( key in configurations[ i ].results ) {
                    if ( configurations[ i ].results.hasOwnProperty( key ) ) {
                        resultIds.push( key );
                    }
                }
            }
            if ( resultIds.length > 0 ) {
                growl.info( 'Generating dashboard for ' + resultIds.length + ' results.' );
                designService.generateDashboard( context, $scope.designId, resultIds )
                    .then( function ( resultLight ) {
                        var k;
                        if ( resultLight.success ) {
                            growl.success( 'Dashboard generated ' + resultLight.artifactsHtml, {
                                ttl: -1
                            } );
                        } else {
                            growl.error( 'Dashboard generation failed.' );
                            for ( k = 0; k < resultLight.messages.length; k += 1 ) {
                                if ( growl.hasOwnProperty( resultLight.messages[ k ].severity ) ) {
                                    growl[ resultLight.messages[ k ].severity ]( resultLight.messages[ k ].message );
                                } else {
                                    growl.warning( resultLight.messages[ k ].message );
                                }
                            }
                        }
                    } )
                    .
                catch ( function ( reason ) {
                    console.error( reason );
                    growl.error( 'Dashboard generation failed.' );
                } );
            } else {
                growl.warning( 'No results in selected configurations!' );
            }
        };

        $scope.$on( 'selectionExposed', function ( event, data, eType ) {
            if ( eType === 'save' ) {
                saveConfigurations( data );
            } else if ( eType === 'dashboard' ) {
                generateDashboard( data );
            }
        } );

        designService.registerWatcher( context, function ( destroyed ) {

            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'initialize event raised' );

            designService.watchDesignNode( context, $scope.designId, function ( updateObject ) {
                console.warn( updateObject );
                if ( updateObject.type === 'load' ) {
                    console.warn( 'Load shouldnt happen' );
                } else if ( updateObject.type === 'update' ) {
                    $scope.dataModels.design = updateObject.data;
                } else if ( updateObject.type === 'unload' ) {
                    growl.warning( 'Design Node was removed!' );
                    $location.path( '/workspaceDetails/' + workspaceId.replace( /\//g, '-' ) );
                } else {
                    throw new Error( updateObject );
                }
            } )
                .then( function ( data ) {
                    $scope.dataModels.design = data.design;
                    meta = data.meta;
                } );
        } );
    } )
    .controller( 'SaveConfigurationSetController', function ( $scope, $modalInstance, $timeout, growl, data,
        designService ) {
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
            if ( !$scope.data.name ) {
                growl.warning( 'You must provide a name!' );
                return;
            }
            growl.info( 'Saving configuration set ' + $scope.data.name + 'this may take a while...' );
            designService.callSaveDesertConfigurations( context, $scope.data.name, $scope.data.description,
                configurations,
                designNode.getId() )
                .then( function () {
                    growl.success( 'Configurations saved to ' + $scope.data.name );
                    $modalInstance.close( $scope.data );
                } );
            //            designService.saveConfigurationSet($scope.data.name, $scope.data.description, configurations,
            //                designNode, meta)
            //                .then(function () {
            //                    growl.success('Configurations saved to ' + $scope.data.name);
            //                    $modalInstance.close($scope.data);
            //                });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };
    } );
},{}],3:[function(require,module,exports){
/*globals angular, console */

angular.module( 'CyPhyApp' )
    .controller( 'TestBenchController', function ( $scope, $state, $timeout, $location, growl, testBenchService ) {
        'use strict';
        var self = this,
            context = {
                db: 'my-db-connection-id'
            },
            workspaceId = $state.params.workspaceId.replace( /-/g, '/' ),
            testBenchId = $state.params.testBenchId.replace( /-/g, '/' );

        console.log( 'TestBenchController' );
        $scope.connectionId = context.db;

        $scope.workspaceId = workspaceId;
        $scope.testBenchId = testBenchId;

        // Check for valid connectionId and register clean-up on destroy event.
        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'TestBenchController' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                testBenchService.cleanUpAllRegions( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
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

        $scope.$on( 'configurationsLoaded', function ( event, data ) {
            $scope.dataModels.configurations = [];
            $timeout( function () {
                $scope.dataModels.configurations = data.configurations;
                $scope.dataModels.setName = data.setName;
                if ( data.configurations.length === 0 ) {
                    growl.warning( 'There were no configurations in ' + data.setName );
                    $scope.state.configurationStatus = 'Select an action above...';
                }
            } );
        } );

        $scope.$on( 'topLevelSystemUnderTestSet', function ( event, newListItem, oldListItem ) {
            if ( $scope.dataModels.testBench.node ) {
                if ( $scope.dataModels.testBench.tlsutId === newListItem.id ) {
                    growl.info( 'Design space is already set as Top Level System Under Test.' );
                } else {
                    $scope.dataModels.testBench.tlsutId = null;
                    $timeout( function () {
                        $scope.dataModels.testBench.tlsutId = newListItem.id;
                        newListItem.cssClass = 'top-level-system-under-test';
                        if ( oldListItem ) {
                            oldListItem.cssClass = '';
                        }
                        $scope.dataModels.testBench.node.makePointer( 'TopLevelSystemUnderTest',
                            newListItem.id );
                    } );
                }
                //$scope.state.designId = newListItem.id;
                console.log( 'topLevelSystemUnderTestSet', newListItem, oldListItem );
            } else {
                growl.warning( 'Can not set TLSUT while test-bench has not been loaded.' );
            }
        } );

        $scope.$on( 'selectionExposed', function ( event, configurations ) {
            var i,
                configuration,
                numCfgs = configurations.length,
                invokeTestBenchRunner = function ( configuration ) {
                    testBenchService.runTestBench( context, testBenchId, configuration.id )
                        .then( function ( resultLight ) {
                            var j;
                            if ( resultLight.success ) {
                                growl.success( 'TestBench run successfully on ' + configuration.name + '.' +
                                    resultLight.artifactsHtml, {
                                        ttl: -1
                                    } );
                            } else {
                                growl.error( 'TestBench run failed on ' + configuration.name + '.' +
                                    resultLight.artifactsHtml, {
                                        ttl: -1
                                    } );
                                for ( j = 0; j < resultLight.messages.length; j += 1 ) {
                                    if ( growl.hasOwnProperty( resultLight.messages[ j ].severity ) ) {
                                        growl[ resultLight.messages[ j ].severity ]( resultLight.messages[
                                            j ].message );
                                    } else {
                                        growl.warning( resultLight.messages[ j ].message );
                                    }
                                }
                            }
                        } )
                        .
                    catch ( function ( reason ) {
                        console.error( reason );
                        growl.error( 'Running test-bench failed.' );
                    } );
                };
            if ( numCfgs < 1 ) {
                growl.warning( 'No selected configurations!' );
                return;
            }

            for ( i = 0; i < numCfgs; i += 1 ) {
                configuration = configurations[ i ];
                growl.info( 'Test-bench started on ' + configuration.name + ' [' + ( i + 1 )
                    .toString() + '/' + numCfgs + ']' );
                invokeTestBenchRunner( configuration );
            }
        } );

        $scope.runTestBench = function () {
            $scope.$broadcast( 'exposeSelection' );
        };

        testBenchService.registerWatcher( context, function ( destroyed ) {

            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'initialize event raised' );

            testBenchService.watchTestBenchNode( context, $scope.testBenchId, function ( updateObject ) {
                console.warn( updateObject );
                if ( updateObject.type === 'load' ) {
                    console.warn( 'Load should not happen' );
                } else if ( updateObject.type === 'update' ) {
                    $scope.dataModels.testBench = updateObject.data;
                    if ( updateObject.tlsutChanged ) {
                        $scope.$broadcast( 'topLevelSystemUnderTestChanged', $scope.dataModels.testBench.tlsutId );
                    }
                } else if ( updateObject.type === 'unload' ) {
                    growl.warning( 'Test Bench was removed!' );
                    $location.path( '/workspaceDetails/' + workspaceId.replace( /\//g, '-' ) );
                } else {
                    throw new Error( updateObject );
                }
            } )
                .then( function ( data ) {
                    $scope.dataModels.testBench = data.testBench;
                    if ( data.testBench.tlsutId ) {
                        $scope.$broadcast( 'topLevelSystemUnderTestChanged', data.testBench.tlsutId );
                    }
                } );
        } );
    } );
},{}],4:[function(require,module,exports){
/*globals angular, console */

angular.module( 'CyPhyApp' )
    .controller( 'WorkspaceDetailsController', function ( $rootScope, $scope, $window, $state ) {
        'use strict';
        var workspaceId = $state.params.workspaceId.replace( /-/g, '/' );
        console.log( 'WorkspaceDetailsController', workspaceId );
        $scope.dataModel = {
            workspaceId: workspaceId
        };
        $rootScope.mainNavigator.items = [ {
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root',
            menu: [ {
                id: 'editor',
                items: [ {
                    id: 'open',
                    label: 'Open in editor',
                    disabled: false,
                    iconClass: 'glyphicon glyphicon-edit',
                    action: function () {
                        $window.open( '/?project=ADMEditor', '_blank' );
                    },
                    actionData: {}
                } ]
            } ]
        } ];
        $rootScope.mainNavigator.separator = false;
        //debugger;
    } );
},{}],5:[function(require,module,exports){
/*globals angular, console */

angular.module( 'CyPhyApp' )
    .controller( 'WorkspacesController', function ( $rootScope, $window ) {
        'use strict';
        console.log( 'WorkspacesController' );
        $rootScope.mainNavigator.items = [ {
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root',
            menu: [ {
                id: 'editor',
                items: [ {
                    id: 'open',
                    label: 'Open in editor',
                    disabled: false,
                    iconClass: 'glyphicon glyphicon-edit',
                    action: function () {
                        $window.open( '/?project=ADMEditor', '_blank' );
                    },
                    actionData: {}
                } ]
            } ]
        } ];
        $rootScope.mainNavigator.separator = false;
    } );
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL2RlZmF1bHQvYXBwLmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvRGVzaWduU3BhY2UvRGVzaWduU3BhY2VDb250cm9sbGVyLmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXIuanMiLCJDOi9Vc2Vycy9rZXZpbi9Eb2N1bWVudHMvd2ViZ21lLWN5cGh5L3NyYy9hcHAvZGVmYXVsdC92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyLmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCB3aW5kb3csIHJlcXVpcmUqL1xuXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSggJ0N5UGh5QXBwJywgW1xuICAgICd1aS5yb3V0ZXInLFxuXG4gICAgJ2dtZS5zZXJ2aWNlcycsXG5cbiAgICAnaXNpcy51aS5jb21wb25lbnRzJyxcblxuICAgICdjeXBoeS5jb21wb25lbnRzJyxcblxuICAgIC8vIGFwcCBzcGVjaWZpYyB0ZW1wbGF0ZXNcbiAgICAnY3lwaHkuZGVmYXVsdC50ZW1wbGF0ZXMnXG5dIClcbiAgICAuY29uZmlnKCBmdW5jdGlvbiAoICRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgLy8gRm9yIGFueSB1bm1hdGNoZWQgdXJsLCByZWRpcmVjdCB0byAvd29ya3NwYWNlc1xuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCAnL3dvcmtzcGFjZXMnICk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIE5vdyBzZXQgdXAgdGhlIHN0YXRlc1xuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAgICAgLnN0YXRlKCAnaW5kZXgnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiBcIi9pbmRleFwiXG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC5zdGF0ZSggJ3dvcmtzcGFjZXMnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiBcIi93b3Jrc3BhY2VzXCIsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL2RlZmF1bHQvdGVtcGxhdGVzL1dvcmtzcGFjZXMuaHRtbFwiLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiV29ya3NwYWNlc0NvbnRyb2xsZXJcIlxuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAuc3RhdGUoICd3b3Jrc3BhY2VEZXRhaWxzJywge1xuICAgICAgICAgICAgICAgIHVybDogXCIvd29ya3NwYWNlRGV0YWlscy86d29ya3NwYWNlSWRcIixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvV29ya3NwYWNlRGV0YWlscy5odG1sXCIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlclwiXG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC5zdGF0ZSggJ2Rlc2lnblNwYWNlJywge1xuICAgICAgICAgICAgICAgIHVybDogXCIvZGVzaWduU3BhY2UvOndvcmtzcGFjZUlkLzpkZXNpZ25JZFwiLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9EZXNpZ25TcGFjZS5odG1sXCIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJEZXNpZ25TcGFjZUNvbnRyb2xsZXJcIlxuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAuc3RhdGUoICd0ZXN0QmVuY2gnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiBcIi90ZXN0QmVuY2gvOndvcmtzcGFjZUlkLzp0ZXN0QmVuY2hJZFwiLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9UZXN0QmVuY2guaHRtbFwiLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiVGVzdEJlbmNoQ29udHJvbGxlclwiXG4gICAgICAgICAgICB9ICk7XG4gICAgfSApXG4gICAgLmNvbnRyb2xsZXIoICdNYWluTmF2aWdhdG9yQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHJvb3RTY29wZSwgJHNjb3BlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgICRzY29wZS5uYXZpZ2F0b3IgPSB7fTtcbiAgICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IFsge1xuICAgICAgICAgICAgaWQ6ICdyb290JyxcbiAgICAgICAgICAgIGxhYmVsOiAnQURNRWRpdG9yJyxcbiAgICAgICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnXG4gICAgICAgIH0gXTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yID0gJHNjb3BlLm5hdmlnYXRvcjtcbiAgICB9IClcbiAgICAucnVuKCBmdW5jdGlvbiAoICRzdGF0ZSwgZ3Jvd2wsIGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSAnbXktZGItY29ubmVjdGlvbi1pZCc7XG5cbiAgICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZSggY29ubmVjdGlvbklkLCB7XG4gICAgICAgICAgICBob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWVcbiAgICAgICAgfSApXG4gICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIHNlbGVjdCBkZWZhdWx0IHByb2plY3QgYW5kIGJyYW5jaCAobWFzdGVyKVxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9qZWN0U2VydmljZS5zZWxlY3RQcm9qZWN0KCBjb25uZWN0aW9uSWQsICdBRE1FZGl0b3InICk7XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC5cbiAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoIHJlYXNvbiApIHtcbiAgICAgICAgICAgIGdyb3dsLmVycm9yKCAnQURNRWRpdG9yIGRvZXMgbm90IGV4aXN0LiBDcmVhdGUgYW5kIGltcG9ydCBpdCB1c2luZyB0aGUgPGEgaHJlZj1cIicgK1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnXCI+IHdlYmdtZSBpbnRlcmZhY2U8L2E+LicgKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIHJlYXNvbiApO1xuICAgICAgICB9ICk7XG4gICAgfSApO1xuXG5cbnJlcXVpcmUoICcuL3ZpZXdzL1dvcmtzcGFjZXMvV29ya3NwYWNlc0NvbnRyb2xsZXInICk7XG5yZXF1aXJlKCAnLi92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJyApO1xucmVxdWlyZSggJy4vdmlld3MvRGVzaWduU3BhY2UvRGVzaWduU3BhY2VDb250cm9sbGVyJyApO1xucmVxdWlyZSggJy4vdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXInICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cblxuYW5ndWxhci5tb2R1bGUoICdDeVBoeUFwcCcgKVxuICAgIC5jb250cm9sbGVyKCAnRGVzaWduU3BhY2VDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICRzdGF0ZSwgJHRpbWVvdXQsICRtb2RhbCwgJGxvY2F0aW9uLCAkcSwgZ3Jvd2wsXG4gICAgICAgIGRlc2VydFNlcnZpY2UsIGRlc2lnblNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIG1ldGEsXG4gICAgICAgICAgICB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSggLy0vZywgJy8nICksXG4gICAgICAgICAgICBkZXNpZ25JZCA9ICRzdGF0ZS5wYXJhbXMuZGVzaWduSWQucmVwbGFjZSggLy0vZywgJy8nICksXG4gICAgICAgICAgICBzYXZlQ29uZmlndXJhdGlvbnMsXG4gICAgICAgICAgICBnZW5lcmF0ZURhc2hib2FyZCxcbiAgICAgICAgICAgIGNsZWFuVXBDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnO1xuICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9ICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zWyBpIF07XG4gICAgICAgICAgICAgICAgICAgIGlmICggY29uZmlnLmhhc093blByb3BlcnR5KCAncmVnaW9uSWQnICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBSZWdpb24oIGNvbnRleHQsIGNvbmZpZy5yZWdpb25JZCApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5yZXN1bHRzQXZhbGlhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgY29uc29sZS5sb2coICdEZXNpZ25TcGFjZUNvbnRyb2xsZXInICk7XG4gICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSAnbXktZGItY29ubmVjdGlvbi1pZCc7XG4gICAgICAgICRzY29wZS53b3Jrc3BhY2VJZCA9IHdvcmtzcGFjZUlkO1xuICAgICAgICAkc2NvcGUuZGVzaWduSWQgPSBkZXNpZ25JZDtcblxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxuICAgICAgICBpZiAoICRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZyggJHNjb3BlLmNvbm5lY3Rpb25JZCApICkge1xuICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0Rlc2lnblNwYWNlQ29udHJvbGxlcicgKyAoIG5ldyBEYXRlKCkgKVxuICAgICAgICAgICAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICRzY29wZS4kb24oICckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKCBjb250ZXh0ICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnN0YXRlID0ge1xuICAgICAgICAgICAgZGVzaWduVHJlZUxvYWRlZDogZmFsc2UsXG4gICAgICAgICAgICBkZXNlcnRJbnB1dEF2YWxpYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uU3RhdHVzOiAnU2VsZWN0IGFuIGFjdGlvbiBhYm92ZS4uLicsXG4gICAgICAgICAgICBoYXNDb21wb25lbnRzOiB0cnVlLFxuICAgICAgICAgICAgc2F2aW5nQ29uZmlndXJhdGlvbnM6IGZhbHNlLFxuICAgICAgICAgICAgcmVzdWx0c0F2YWxpYWJsZTogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVscyA9IHtcbiAgICAgICAgICAgIGF2bUlkczoge30sXG4gICAgICAgICAgICBkZXNlcnRJbnB1dDoge30sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uczogW10sXG4gICAgICAgICAgICBzZXROYW1lOiBudWxsLFxuICAgICAgICAgICAgZGVzaWduOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ0xvYWRpbmcgZGVzaWduLi4uJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS4kb24oICdkZXNpZ25UcmVlTG9hZGVkJywgZnVuY3Rpb24gKCBldmVudCwgZGF0YSApIHtcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmF2bUlkcyA9IGRhdGE7XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuaGFzQ29tcG9uZW50cyA9IE9iamVjdC5rZXlzKCBkYXRhIClcbiAgICAgICAgICAgICAgICAubGVuZ3RoID4gMDtcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5kZXNpZ25UcmVlTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgICRzY29wZS4kb24oICdzZWxlY3RlZEluc3RhbmNlcycsIGZ1bmN0aW9uICggZXZlbnQsIGRhdGEgKSB7XG4gICAgICAgICAgICBncm93bC5pbmZvKCBkYXRhLm5hbWUgKyAnIGhhcyAnICsgZGF0YS5pZHMubGVuZ3RoICsgJyBpbnN0YW5jZShzKS4nICk7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCggJ3NldFNlbGVjdGVkTm9kZXMnLCBkYXRhLmlkcyApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ2NvbmZpZ3VyYXRpb25DbGlja2VkJywgZnVuY3Rpb24gKCBldmVudCwgZGF0YSApIHtcbiAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgIGlkcyA9IFtdO1xuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBkYXRhLmFsdGVybmF0aXZlQXNzaWdubWVudHMubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgaWRzLnB1c2goIGRhdGEuYWx0ZXJuYXRpdmVBc3NpZ25tZW50c1sgaSBdLnNlbGVjdGVkQWx0ZXJuYXRpdmUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCAnc2V0U2VsZWN0ZWROb2RlcycsIGlkcyApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ2Rlc2VydElucHV0UmVhZHknLCBmdW5jdGlvbiAoIGV2ZW50LCBkYXRhICkge1xuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuZGVzZXJ0SW5wdXQgPSBkYXRhO1xuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmRlc2VydElucHV0QXZhbGlhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBkYXRhICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAkc2NvcGUuJG9uKCAnY29uZmlndXJhdGlvbnNMb2FkZWQnLCBmdW5jdGlvbiAoIGV2ZW50LCBkYXRhICkge1xuICAgICAgICAgICAgY2xlYW5VcENvbmZpZ3VyYXRpb25zKCk7XG4gICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gZGF0YS5zZXROYW1lO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucztcbiAgICAgICAgICAgICAgICBpZiAoIGRhdGEuY29uZmlndXJhdGlvbnMubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnVGhlcmUgd2VyZSBubyBjb25maWd1cmF0aW9ucyBpbiAnICsgZGF0YS5zZXROYW1lICk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ1NlbGVjdCBhbiBhY3Rpb24gYWJvdmUuLi4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8ICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCggZGVzaWduU2VydmljZS5hcHBlbmRXYXRjaFJlc3VsdHMoIGNvbnRleHQsICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zW1xuICAgICAgICAgICAgICAgICAgICAgICAgaSBdICkgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJHEuYWxsKCBxdWV1ZUxpc3QgKVxuICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBoYXNSZXN1bHRzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFzUmVzdWx0cy5tYXAoIGZ1bmN0aW9uICggcmVzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcmVzID09PSB0cnVlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUucmVzdWx0c0F2YWxpYWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAkc2NvcGUuY2FsY3VsYXRlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBncm93bC5pbmZvKCAnQ2FsY3VsYXRpbmcgY29uZmlndXJhdGlvbnMuIFBsZWFzZSB3YWl0Li4nICk7XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuY29uZmlndXJhdGlvblN0YXR1cyA9ICdDYWxjdWxhdGluZy4uJztcbiAgICAgICAgICAgIGNsZWFuVXBDb25maWd1cmF0aW9ucygpO1xuICAgICAgICAgICAgZGVzZXJ0U2VydmljZS5jYWxjdWxhdGVDb25maWd1cmF0aW9ucyggJHNjb3BlLmRhdGFNb2RlbHMuZGVzZXJ0SW5wdXQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGNvbmZpZ3VyYXRpb25zICkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IGNvbmZpZ3VyYXRpb25zO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gJ2NhbGN1bGF0ZWQnO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuY29uZmlndXJhdGlvblN0YXR1cyA9ICdDYWxjdWxhdGVkJztcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIHJlYXNvbiApO1xuICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCAnRmFpbGVkIHRvIGNhbGN1bGF0ZSBjb25maWd1cmF0aW9ucywgc2VlIGNvbnNvbGUgZm9yIG1vcmUgaW5mby4nICk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gJyc7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnRmFpbGVkIHRvIGNhbGN1bGF0ZS4nO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zYXZlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCggJ2V4cG9zZVNlbGVjdGlvbicsICdzYXZlJyApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNhdmVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICggY29uZmlndXJhdGlvbnMgKSB7XG4gICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZTtcbiAgICAgICAgICAgIGlmICggY29uZmlndXJhdGlvbnMubGVuZ3RoIDwgMSApIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnTm8gc2VsZWN0ZWQgY29uZmlndXJhdGlvbnMhJyApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5zYXZpbmdDb25maWd1cmF0aW9ucyA9IHRydWU7XG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9kZWZhdWx0L3RlbXBsYXRlcy9TYXZlQ29uZmlndXJhdGlvblNldC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2F2ZUNvbmZpZ3VyYXRpb25TZXRDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICAvL3NpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiBjb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhOiBtZXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZTogJHNjb3BlLmRhdGFNb2RlbHMuZGVzaWduLm5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKCBmdW5jdGlvbiAoIHJlc3VsdCApIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuc2F2aW5nQ29uZmlndXJhdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZ2VuZXJhdGVEYXNoYm9hcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCggJ2V4cG9zZVNlbGVjdGlvbicsICdkYXNoYm9hcmQnICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZ2VuZXJhdGVEYXNoYm9hcmQgPSBmdW5jdGlvbiAoIGNvbmZpZ3VyYXRpb25zICkge1xuICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgIHJlc3VsdElkcyA9IFtdO1xuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBjb25maWd1cmF0aW9ucy5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgICAgICBmb3IgKCBrZXkgaW4gY29uZmlndXJhdGlvbnNbIGkgXS5yZXN1bHRzICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGNvbmZpZ3VyYXRpb25zWyBpIF0ucmVzdWx0cy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRJZHMucHVzaCgga2V5ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIHJlc3VsdElkcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgICAgIGdyb3dsLmluZm8oICdHZW5lcmF0aW5nIGRhc2hib2FyZCBmb3IgJyArIHJlc3VsdElkcy5sZW5ndGggKyAnIHJlc3VsdHMuJyApO1xuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuZ2VuZXJhdGVEYXNoYm9hcmQoIGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgcmVzdWx0SWRzIClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggcmVzdWx0TGlnaHQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcmVzdWx0TGlnaHQuc3VjY2VzcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCAnRGFzaGJvYXJkIGdlbmVyYXRlZCAnICsgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dGw6IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvciggJ0Rhc2hib2FyZCBnZW5lcmF0aW9uIGZhaWxlZC4nICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggayA9IDA7IGsgPCByZXN1bHRMaWdodC5tZXNzYWdlcy5sZW5ndGg7IGsgKz0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBncm93bC5oYXNPd25Qcm9wZXJ0eSggcmVzdWx0TGlnaHQubWVzc2FnZXNbIGsgXS5zZXZlcml0eSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2xbIHJlc3VsdExpZ2h0Lm1lc3NhZ2VzWyBrIF0uc2V2ZXJpdHkgXSggcmVzdWx0TGlnaHQubWVzc2FnZXNbIGsgXS5tZXNzYWdlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCByZXN1bHRMaWdodC5tZXNzYWdlc1sgayBdLm1lc3NhZ2UgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoICdEYXNoYm9hcmQgZ2VuZXJhdGlvbiBmYWlsZWQuJyApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggJ05vIHJlc3VsdHMgaW4gc2VsZWN0ZWQgY29uZmlndXJhdGlvbnMhJyApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS4kb24oICdzZWxlY3Rpb25FeHBvc2VkJywgZnVuY3Rpb24gKCBldmVudCwgZGF0YSwgZVR5cGUgKSB7XG4gICAgICAgICAgICBpZiAoIGVUeXBlID09PSAnc2F2ZScgKSB7XG4gICAgICAgICAgICAgICAgc2F2ZUNvbmZpZ3VyYXRpb25zKCBkYXRhICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBlVHlwZSA9PT0gJ2Rhc2hib2FyZCcgKSB7XG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVEYXNoYm9hcmQoIGRhdGEgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuXG4gICAgICAgIGRlc2lnblNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKCBjb250ZXh0LCBmdW5jdGlvbiAoIGRlc3Ryb3llZCApIHtcblxuICAgICAgICAgICAgaWYgKCBkZXN0cm95ZWQgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCAnZGVzdHJveSBldmVudCByYWlzZWQnICk7XG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oICdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcgKTtcblxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnbk5vZGUoIGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgZnVuY3Rpb24gKCB1cGRhdGVPYmplY3QgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCB1cGRhdGVPYmplY3QgKTtcbiAgICAgICAgICAgICAgICBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggJ0xvYWQgc2hvdWxkbnQgaGFwcGVuJyApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJyApIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuZGVzaWduID0gdXBkYXRlT2JqZWN0LmRhdGE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnICkge1xuICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnRGVzaWduIE5vZGUgd2FzIHJlbW92ZWQhJyApO1xuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCggJy93b3Jrc3BhY2VEZXRhaWxzLycgKyB3b3Jrc3BhY2VJZC5yZXBsYWNlKCAvXFwvL2csICctJyApICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCB1cGRhdGVPYmplY3QgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5kZXNpZ24gPSBkYXRhLmRlc2lnbjtcbiAgICAgICAgICAgICAgICAgICAgbWV0YSA9IGRhdGEubWV0YTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKTtcbiAgICB9IClcbiAgICAuY29udHJvbGxlciggJ1NhdmVDb25maWd1cmF0aW9uU2V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgJHRpbWVvdXQsIGdyb3dsLCBkYXRhLFxuICAgICAgICBkZXNpZ25TZXJ2aWNlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBjb25maWd1cmF0aW9ucyA9IGRhdGEuY29uZmlndXJhdGlvbnMsXG4gICAgICAgICAgICBtZXRhID0gZGF0YS5tZXRhLFxuICAgICAgICAgICAgZGVzaWduTm9kZSA9IGRhdGEuZGVzaWduTm9kZSxcbiAgICAgICAgICAgIGNvbnRleHQgPSBkYXRhLmNvbnRleHQ7XG4gICAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IG51bGwsXG4gICAgICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICAgICAgbmJyT2ZDb25maWd1cmF0aW9uczogY29uZmlndXJhdGlvbnMubGVuZ3RoXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCAhJHNjb3BlLmRhdGEubmFtZSApIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnWW91IG11c3QgcHJvdmlkZSBhIG5hbWUhJyApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdyb3dsLmluZm8oICdTYXZpbmcgY29uZmlndXJhdGlvbiBzZXQgJyArICRzY29wZS5kYXRhLm5hbWUgKyAndGhpcyBtYXkgdGFrZSBhIHdoaWxlLi4uJyApO1xuICAgICAgICAgICAgZGVzaWduU2VydmljZS5jYWxsU2F2ZURlc2VydENvbmZpZ3VyYXRpb25zKCBjb250ZXh0LCAkc2NvcGUuZGF0YS5uYW1lLCAkc2NvcGUuZGF0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLmdldElkKCkgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoICdDb25maWd1cmF0aW9ucyBzYXZlZCB0byAnICsgJHNjb3BlLmRhdGEubmFtZSApO1xuICAgICAgICAgICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSggJHNjb3BlLmRhdGEgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uuc2F2ZUNvbmZpZ3VyYXRpb25TZXQoJHNjb3BlLmRhdGEubmFtZSwgJHNjb3BlLmRhdGEuZGVzY3JpcHRpb24sIGNvbmZpZ3VyYXRpb25zLFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgZGVzaWduTm9kZSwgbWV0YSlcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdDb25maWd1cmF0aW9ucyBzYXZlZCB0byAnICsgJHNjb3BlLmRhdGEubmFtZSk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoJHNjb3BlLmRhdGEpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoICdjYW5jZWwnICk7XG4gICAgICAgIH07XG4gICAgfSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXG5cbmFuZ3VsYXIubW9kdWxlKCAnQ3lQaHlBcHAnIClcbiAgICAuY29udHJvbGxlciggJ1Rlc3RCZW5jaENvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSwgJHN0YXRlLCAkdGltZW91dCwgJGxvY2F0aW9uLCBncm93bCwgdGVzdEJlbmNoU2VydmljZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAnbXktZGItY29ubmVjdGlvbi1pZCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSggLy0vZywgJy8nICksXG4gICAgICAgICAgICB0ZXN0QmVuY2hJZCA9ICRzdGF0ZS5wYXJhbXMudGVzdEJlbmNoSWQucmVwbGFjZSggLy0vZywgJy8nICk7XG5cbiAgICAgICAgY29uc29sZS5sb2coICdUZXN0QmVuY2hDb250cm9sbGVyJyApO1xuICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gY29udGV4dC5kYjtcblxuICAgICAgICAkc2NvcGUud29ya3NwYWNlSWQgPSB3b3Jrc3BhY2VJZDtcbiAgICAgICAgJHNjb3BlLnRlc3RCZW5jaElkID0gdGVzdEJlbmNoSWQ7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cbiAgICAgICAgaWYgKCAkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoICRzY29wZS5jb25uZWN0aW9uSWQgKSApIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0QmVuY2hDb250cm9sbGVyJyArICggbmV3IERhdGUoKSApXG4gICAgICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLiRvbiggJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoIGNvbnRleHQgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uU3RhdHVzOiAnU2VsZWN0IGEgVG9wIExldmVsIFN5c3RlbSBVbmRlciBUZXN0Li4uJyxcbiAgICAgICAgICAgIGRlc2lnbklkOiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMgPSB7XG4gICAgICAgICAgICB0ZXN0QmVuY2g6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnTG9hZGluZyB0ZXN0LWJlbmNoLi4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgc2V0TmFtZTogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS4kb24oICdjb25maWd1cmF0aW9uc0xvYWRlZCcsIGZ1bmN0aW9uICggZXZlbnQsIGRhdGEgKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IGRhdGEuY29uZmlndXJhdGlvbnM7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9IGRhdGEuc2V0TmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoIGRhdGEuY29uZmlndXJhdGlvbnMubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnVGhlcmUgd2VyZSBubyBjb25maWd1cmF0aW9ucyBpbiAnICsgZGF0YS5zZXROYW1lICk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ1NlbGVjdCBhbiBhY3Rpb24gYWJvdmUuLi4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgICRzY29wZS4kb24oICd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdFNldCcsIGZ1bmN0aW9uICggZXZlbnQsIG5ld0xpc3RJdGVtLCBvbGRMaXN0SXRlbSApIHtcbiAgICAgICAgICAgIGlmICggJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLm5vZGUgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9PT0gbmV3TGlzdEl0ZW0uaWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLmluZm8oICdEZXNpZ24gc3BhY2UgaXMgYWxyZWFkeSBzZXQgYXMgVG9wIExldmVsIFN5c3RlbSBVbmRlciBUZXN0LicgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9IG5ld0xpc3RJdGVtLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TGlzdEl0ZW0uY3NzQ2xhc3MgPSAndG9wLWxldmVsLXN5c3RlbS11bmRlci10ZXN0JztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggb2xkTGlzdEl0ZW0gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkTGlzdEl0ZW0uY3NzQ2xhc3MgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC5ub2RlLm1ha2VQb2ludGVyKCAnVG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0xpc3RJdGVtLmlkICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8kc2NvcGUuc3RhdGUuZGVzaWduSWQgPSBuZXdMaXN0SXRlbS5pZDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0U2V0JywgbmV3TGlzdEl0ZW0sIG9sZExpc3RJdGVtICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoICdDYW4gbm90IHNldCBUTFNVVCB3aGlsZSB0ZXN0LWJlbmNoIGhhcyBub3QgYmVlbiBsb2FkZWQuJyApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ3NlbGVjdGlvbkV4cG9zZWQnLCBmdW5jdGlvbiAoIGV2ZW50LCBjb25maWd1cmF0aW9ucyApIHtcbiAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgICAgbnVtQ2ZncyA9IGNvbmZpZ3VyYXRpb25zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpbnZva2VUZXN0QmVuY2hSdW5uZXIgPSBmdW5jdGlvbiAoIGNvbmZpZ3VyYXRpb24gKSB7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucnVuVGVzdEJlbmNoKCBjb250ZXh0LCB0ZXN0QmVuY2hJZCwgY29uZmlndXJhdGlvbi5pZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByZXN1bHRMaWdodCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHJlc3VsdExpZ2h0LnN1Y2Nlc3MgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoICdUZXN0QmVuY2ggcnVuIHN1Y2Nlc3NmdWxseSBvbiAnICsgY29uZmlndXJhdGlvbi5uYW1lICsgJy4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdExpZ2h0LmFydGlmYWN0c0h0bWwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dGw6IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoICdUZXN0QmVuY2ggcnVuIGZhaWxlZCBvbiAnICsgY29uZmlndXJhdGlvbi5uYW1lICsgJy4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdExpZ2h0LmFydGlmYWN0c0h0bWwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dGw6IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGogPSAwOyBqIDwgcmVzdWx0TGlnaHQubWVzc2FnZXMubGVuZ3RoOyBqICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGdyb3dsLmhhc093blByb3BlcnR5KCByZXN1bHRMaWdodC5tZXNzYWdlc1sgaiBdLnNldmVyaXR5ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2xbIHJlc3VsdExpZ2h0Lm1lc3NhZ2VzWyBqIF0uc2V2ZXJpdHkgXSggcmVzdWx0TGlnaHQubWVzc2FnZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGogXS5tZXNzYWdlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoIHJlc3VsdExpZ2h0Lm1lc3NhZ2VzWyBqIF0ubWVzc2FnZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCAnUnVubmluZyB0ZXN0LWJlbmNoIGZhaWxlZC4nICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKCBudW1DZmdzIDwgMSApIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnTm8gc2VsZWN0ZWQgY29uZmlndXJhdGlvbnMhJyApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBudW1DZmdzOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IGNvbmZpZ3VyYXRpb25zWyBpIF07XG4gICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbyggJ1Rlc3QtYmVuY2ggc3RhcnRlZCBvbiAnICsgY29uZmlndXJhdGlvbi5uYW1lICsgJyBbJyArICggaSArIDEgKVxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKSArICcvJyArIG51bUNmZ3MgKyAnXScgKTtcbiAgICAgICAgICAgICAgICBpbnZva2VUZXN0QmVuY2hSdW5uZXIoIGNvbmZpZ3VyYXRpb24gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuXG4gICAgICAgICRzY29wZS5ydW5UZXN0QmVuY2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCggJ2V4cG9zZVNlbGVjdGlvbicgKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlciggY29udGV4dCwgZnVuY3Rpb24gKCBkZXN0cm95ZWQgKSB7XG5cbiAgICAgICAgICAgIGlmICggZGVzdHJveWVkICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyApO1xuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCAnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnICk7XG5cbiAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hOb2RlKCBjb250ZXh0LCAkc2NvcGUudGVzdEJlbmNoSWQsIGZ1bmN0aW9uICggdXBkYXRlT2JqZWN0ICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggdXBkYXRlT2JqZWN0ICk7XG4gICAgICAgICAgICAgICAgaWYgKCB1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oICdMb2FkIHNob3VsZCBub3QgaGFwcGVuJyApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJyApIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoID0gdXBkYXRlT2JqZWN0LmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGlmICggdXBkYXRlT2JqZWN0LnRsc3V0Q2hhbmdlZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCAndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RDaGFuZ2VkJywgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLnRsc3V0SWQgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJyApIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggJ1Rlc3QgQmVuY2ggd2FzIHJlbW92ZWQhJyApO1xuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCggJy93b3Jrc3BhY2VEZXRhaWxzLycgKyB3b3Jrc3BhY2VJZC5yZXBsYWNlKCAvXFwvL2csICctJyApICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCB1cGRhdGVPYmplY3QgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2ggPSBkYXRhLnRlc3RCZW5jaDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBkYXRhLnRlc3RCZW5jaC50bHN1dElkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoICd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdENoYW5nZWQnLCBkYXRhLnRlc3RCZW5jaC50bHN1dElkICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKTtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cblxuYW5ndWxhci5tb2R1bGUoICdDeVBoeUFwcCcgKVxuICAgIC5jb250cm9sbGVyKCAnV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRyb290U2NvcGUsICRzY29wZSwgJHdpbmRvdywgJHN0YXRlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSggLy0vZywgJy8nICk7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInLCB3b3Jrc3BhY2VJZCApO1xuICAgICAgICAkc2NvcGUuZGF0YU1vZGVsID0ge1xuICAgICAgICAgICAgd29ya3NwYWNlSWQ6IHdvcmtzcGFjZUlkXG4gICAgICAgIH07XG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvci5pdGVtcyA9IFsge1xuICAgICAgICAgICAgaWQ6ICdyb290JyxcbiAgICAgICAgICAgIGxhYmVsOiAnQURNRWRpdG9yJyxcbiAgICAgICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnLFxuICAgICAgICAgICAgbWVudTogWyB7XG4gICAgICAgICAgICAgICAgaWQ6ICdlZGl0b3InLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIGVkaXRvcicsXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oICcvP3Byb2plY3Q9QURNRWRpdG9yJywgJ19ibGFuaycgKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge31cbiAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgIH0gXVxuICAgICAgICB9IF07XG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvci5zZXBhcmF0b3IgPSBmYWxzZTtcbiAgICAgICAgLy9kZWJ1Z2dlcjtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cblxuYW5ndWxhci5tb2R1bGUoICdDeVBoeUFwcCcgKVxuICAgIC5jb250cm9sbGVyKCAnV29ya3NwYWNlc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRyb290U2NvcGUsICR3aW5kb3cgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgY29uc29sZS5sb2coICdXb3Jrc3BhY2VzQ29udHJvbGxlcicgKTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yLml0ZW1zID0gWyB7XG4gICAgICAgICAgICBpZDogJ3Jvb3QnLFxuICAgICAgICAgICAgbGFiZWw6ICdBRE1FZGl0b3InLFxuICAgICAgICAgICAgaXRlbUNsYXNzOiAnY3lwaHktcm9vdCcsXG4gICAgICAgICAgICBtZW51OiBbIHtcbiAgICAgICAgICAgICAgICBpZDogJ2VkaXRvcicsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFsge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW4nLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gZWRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbiggJy8/cHJvamVjdD1BRE1FZGl0b3InLCAnX2JsYW5rJyApO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7fVxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSBdXG4gICAgICAgIH0gXTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yLnNlcGFyYXRvciA9IGZhbHNlO1xuICAgIH0gKTsiXX0=
