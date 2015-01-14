(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console, window, require*/

angular.module( 'CyPhyApp', [
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
                url: '/index'
            } )
            .state( 'workspaces', {
                url: '/workspaces',
                templateUrl: '/default/templates/Workspaces.html',
                controller: 'WorkspacesController'
            } )
            .state( 'workspaceDetails', {
                url: '/workspaceDetails/:workspaceId',
                templateUrl: '/default/templates/WorkspaceDetails.html',
                controller: 'WorkspaceDetailsController'
            } )
            .state( 'designSpace', {
                url: '/designSpace/:workspaceId/:designId',
                templateUrl: '/default/templates/DesignSpace.html',
                controller: 'DesignSpaceController'
            } )
            .state( 'testBench', {
                url: '/testBench/:workspaceId/:testBenchId',
                templateUrl: '/default/templates/TestBench.html',
                controller: 'TestBenchController'
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
        var context,
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
            modalInstance.result.then( function ( /*result*/ ) {
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
            //meta = data.meta,
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
        var context = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL2RlZmF1bHQvYXBwLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvRGVzaWduU3BhY2UvRGVzaWduU3BhY2VDb250cm9sbGVyLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXIuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9hcHAvZGVmYXVsdC92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIHdpbmRvdywgcmVxdWlyZSovXG5cbmFuZ3VsYXIubW9kdWxlKCAnQ3lQaHlBcHAnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG5cbiAgICAnZ21lLnNlcnZpY2VzJyxcblxuICAgICdpc2lzLnVpLmNvbXBvbmVudHMnLFxuXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnLFxuXG4gICAgLy8gYXBwIHNwZWNpZmljIHRlbXBsYXRlc1xuICAgICdjeXBoeS5kZWZhdWx0LnRlbXBsYXRlcydcbl0gKVxuICAgIC5jb25maWcoIGZ1bmN0aW9uICggJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICAvLyBGb3IgYW55IHVubWF0Y2hlZCB1cmwsIHJlZGlyZWN0IHRvIC93b3Jrc3BhY2VzXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoICcvd29ya3NwYWNlcycgKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gTm93IHNldCB1cCB0aGUgc3RhdGVzXG4gICAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgICAgICAuc3RhdGUoICdpbmRleCcsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvaW5kZXgnXG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC5zdGF0ZSggJ3dvcmtzcGFjZXMnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3dvcmtzcGFjZXMnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2RlZmF1bHQvdGVtcGxhdGVzL1dvcmtzcGFjZXMuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzcGFjZXNDb250cm9sbGVyJ1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAuc3RhdGUoICd3b3Jrc3BhY2VEZXRhaWxzJywge1xuICAgICAgICAgICAgICAgIHVybDogJy93b3Jrc3BhY2VEZXRhaWxzLzp3b3Jrc3BhY2VJZCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvZGVmYXVsdC90ZW1wbGF0ZXMvV29ya3NwYWNlRGV0YWlscy5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInXG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC5zdGF0ZSggJ2Rlc2lnblNwYWNlJywge1xuICAgICAgICAgICAgICAgIHVybDogJy9kZXNpZ25TcGFjZS86d29ya3NwYWNlSWQvOmRlc2lnbklkJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9kZWZhdWx0L3RlbXBsYXRlcy9EZXNpZ25TcGFjZS5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduU3BhY2VDb250cm9sbGVyJ1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAuc3RhdGUoICd0ZXN0QmVuY2gnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3Rlc3RCZW5jaC86d29ya3NwYWNlSWQvOnRlc3RCZW5jaElkJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9kZWZhdWx0L3RlbXBsYXRlcy9UZXN0QmVuY2guaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaENvbnRyb2xsZXInXG4gICAgICAgICAgICB9ICk7XG4gICAgfSApXG4gICAgLmNvbnRyb2xsZXIoICdNYWluTmF2aWdhdG9yQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHJvb3RTY29wZSwgJHNjb3BlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgICRzY29wZS5uYXZpZ2F0b3IgPSB7fTtcbiAgICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IFsge1xuICAgICAgICAgICAgaWQ6ICdyb290JyxcbiAgICAgICAgICAgIGxhYmVsOiAnQURNRWRpdG9yJyxcbiAgICAgICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnXG4gICAgICAgIH0gXTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yID0gJHNjb3BlLm5hdmlnYXRvcjtcbiAgICB9IClcbiAgICAucnVuKCBmdW5jdGlvbiAoICRzdGF0ZSwgZ3Jvd2wsIGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSAnbXktZGItY29ubmVjdGlvbi1pZCc7XG5cbiAgICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZSggY29ubmVjdGlvbklkLCB7XG4gICAgICAgICAgICBob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWVcbiAgICAgICAgfSApXG4gICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIHNlbGVjdCBkZWZhdWx0IHByb2plY3QgYW5kIGJyYW5jaCAobWFzdGVyKVxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9qZWN0U2VydmljZS5zZWxlY3RQcm9qZWN0KCBjb25uZWN0aW9uSWQsICdBRE1FZGl0b3InICk7XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC5cbiAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoIHJlYXNvbiApIHtcbiAgICAgICAgICAgIGdyb3dsLmVycm9yKCAnQURNRWRpdG9yIGRvZXMgbm90IGV4aXN0LiBDcmVhdGUgYW5kIGltcG9ydCBpdCB1c2luZyB0aGUgPGEgaHJlZj1cIicgK1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnXCI+IHdlYmdtZSBpbnRlcmZhY2U8L2E+LicgKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIHJlYXNvbiApO1xuICAgICAgICB9ICk7XG4gICAgfSApO1xuXG5cbnJlcXVpcmUoICcuL3ZpZXdzL1dvcmtzcGFjZXMvV29ya3NwYWNlc0NvbnRyb2xsZXInICk7XG5yZXF1aXJlKCAnLi92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJyApO1xucmVxdWlyZSggJy4vdmlld3MvRGVzaWduU3BhY2UvRGVzaWduU3BhY2VDb250cm9sbGVyJyApO1xucmVxdWlyZSggJy4vdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXInICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cblxuYW5ndWxhci5tb2R1bGUoICdDeVBoeUFwcCcgKVxuICAgIC5jb250cm9sbGVyKCAnRGVzaWduU3BhY2VDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICRzdGF0ZSwgJHRpbWVvdXQsICRtb2RhbCwgJGxvY2F0aW9uLCAkcSwgZ3Jvd2wsXG4gICAgICAgIGRlc2VydFNlcnZpY2UsIGRlc2lnblNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbnRleHQsXG4gICAgICAgICAgICBtZXRhLFxuICAgICAgICAgICAgd29ya3NwYWNlSWQgPSAkc3RhdGUucGFyYW1zLndvcmtzcGFjZUlkLnJlcGxhY2UoIC8tL2csICcvJyApLFxuICAgICAgICAgICAgZGVzaWduSWQgPSAkc3RhdGUucGFyYW1zLmRlc2lnbklkLnJlcGxhY2UoIC8tL2csICcvJyApLFxuICAgICAgICAgICAgc2F2ZUNvbmZpZ3VyYXRpb25zLFxuICAgICAgICAgICAgZ2VuZXJhdGVEYXNoYm9hcmQsXG4gICAgICAgICAgICBjbGVhblVwQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZztcbiAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8ICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcgPSAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9uc1sgaSBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGNvbmZpZy5oYXNPd25Qcm9wZXJ0eSggJ3JlZ2lvbklkJyApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwUmVnaW9uKCBjb250ZXh0LCBjb25maWcucmVnaW9uSWQgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUucmVzdWx0c0F2YWxpYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gW107XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCAnRGVzaWduU3BhY2VDb250cm9sbGVyJyApO1xuICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gJ215LWRiLWNvbm5lY3Rpb24taWQnO1xuICAgICAgICAkc2NvcGUud29ya3NwYWNlSWQgPSB3b3Jrc3BhY2VJZDtcbiAgICAgICAgJHNjb3BlLmRlc2lnbklkID0gZGVzaWduSWQ7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cbiAgICAgICAgaWYgKCAkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoICRzY29wZS5jb25uZWN0aW9uSWQgKSApIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25TcGFjZUNvbnRyb2xsZXInICsgKCBuZXcgRGF0ZSgpIClcbiAgICAgICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkc2NvcGUuJG9uKCAnJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyggY29udGV4dCApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGRlc2lnblRyZWVMb2FkZWQ6IGZhbHNlLFxuICAgICAgICAgICAgZGVzZXJ0SW5wdXRBdmFsaWFibGU6IGZhbHNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvblN0YXR1czogJ1NlbGVjdCBhbiBhY3Rpb24gYWJvdmUuLi4nLFxuICAgICAgICAgICAgaGFzQ29tcG9uZW50czogdHJ1ZSxcbiAgICAgICAgICAgIHNhdmluZ0NvbmZpZ3VyYXRpb25zOiBmYWxzZSxcbiAgICAgICAgICAgIHJlc3VsdHNBdmFsaWFibGU6IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMgPSB7XG4gICAgICAgICAgICBhdm1JZHM6IHt9LFxuICAgICAgICAgICAgZGVzZXJ0SW5wdXQ6IHt9LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgc2V0TmFtZTogbnVsbCxcbiAgICAgICAgICAgIGRlc2lnbjoge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdMb2FkaW5nIGRlc2lnbi4uLidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuJG9uKCAnZGVzaWduVHJlZUxvYWRlZCcsIGZ1bmN0aW9uICggZXZlbnQsIGRhdGEgKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5hdm1JZHMgPSBkYXRhO1xuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmhhc0NvbXBvbmVudHMgPSBPYmplY3Qua2V5cyggZGF0YSApXG4gICAgICAgICAgICAgICAgLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuZGVzaWduVHJlZUxvYWRlZCA9IHRydWU7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAkc2NvcGUuJG9uKCAnc2VsZWN0ZWRJbnN0YW5jZXMnLCBmdW5jdGlvbiAoIGV2ZW50LCBkYXRhICkge1xuICAgICAgICAgICAgZ3Jvd2wuaW5mbyggZGF0YS5uYW1lICsgJyBoYXMgJyArIGRhdGEuaWRzLmxlbmd0aCArICcgaW5zdGFuY2UocykuJyApO1xuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoICdzZXRTZWxlY3RlZE5vZGVzJywgZGF0YS5pZHMgKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgICRzY29wZS4kb24oICdjb25maWd1cmF0aW9uQ2xpY2tlZCcsIGZ1bmN0aW9uICggZXZlbnQsIGRhdGEgKSB7XG4gICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICBpZHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgZGF0YS5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgIGlkcy5wdXNoKCBkYXRhLmFsdGVybmF0aXZlQXNzaWdubWVudHNbIGkgXS5zZWxlY3RlZEFsdGVybmF0aXZlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCggJ3NldFNlbGVjdGVkTm9kZXMnLCBpZHMgKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgICRzY29wZS4kb24oICdkZXNlcnRJbnB1dFJlYWR5JywgZnVuY3Rpb24gKCBldmVudCwgZGF0YSApIHtcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmRlc2VydElucHV0ID0gZGF0YTtcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5kZXNlcnRJbnB1dEF2YWxpYWJsZSA9IHRydWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggZGF0YSApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ2NvbmZpZ3VyYXRpb25zTG9hZGVkJywgZnVuY3Rpb24gKCBldmVudCwgZGF0YSApIHtcbiAgICAgICAgICAgIGNsZWFuVXBDb25maWd1cmF0aW9ucygpO1xuICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9IGRhdGEuc2V0TmFtZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IGRhdGEuY29uZmlndXJhdGlvbnM7XG4gICAgICAgICAgICAgICAgaWYgKCBkYXRhLmNvbmZpZ3VyYXRpb25zLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggJ1RoZXJlIHdlcmUgbm8gY29uZmlndXJhdGlvbnMgaW4gJyArIGRhdGEuc2V0TmFtZSApO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuY29uZmlndXJhdGlvblN0YXR1cyA9ICdTZWxlY3QgYW4gYWN0aW9uIGFib3ZlLi4uJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucy5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2goIGRlc2lnblNlcnZpY2UuYXBwZW5kV2F0Y2hSZXN1bHRzKCBjb250ZXh0LCAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9uc1tcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgXSApICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRxLmFsbCggcXVldWVMaXN0IClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggaGFzUmVzdWx0cyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc1Jlc3VsdHMubWFwKCBmdW5jdGlvbiAoIHJlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHJlcyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLnJlc3VsdHNBdmFsaWFibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgJHNjb3BlLmNhbGN1bGF0ZUNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZ3Jvd2wuaW5mbyggJ0NhbGN1bGF0aW5nIGNvbmZpZ3VyYXRpb25zLiBQbGVhc2Ugd2FpdC4uJyApO1xuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnQ2FsY3VsYXRpbmcuLic7XG4gICAgICAgICAgICBjbGVhblVwQ29uZmlndXJhdGlvbnMoKTtcbiAgICAgICAgICAgIGRlc2VydFNlcnZpY2UuY2FsY3VsYXRlQ29uZmlndXJhdGlvbnMoICRzY29wZS5kYXRhTW9kZWxzLmRlc2VydElucHV0IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjb25maWd1cmF0aW9ucyApIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBjb25maWd1cmF0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9ICdjYWxjdWxhdGVkJztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnQ2FsY3VsYXRlZCc7XG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoIHJlYXNvbiApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgICAgICAgICBncm93bC5lcnJvciggJ0ZhaWxlZCB0byBjYWxjdWxhdGUgY29uZmlndXJhdGlvbnMsIHNlZSBjb25zb2xlIGZvciBtb3JlIGluZm8uJyApO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gW107XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9ICcnO1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ0ZhaWxlZCB0byBjYWxjdWxhdGUuJztcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2F2ZUNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoICdleHBvc2VTZWxlY3Rpb24nLCAnc2F2ZScgKTtcbiAgICAgICAgfTtcblxuICAgICAgICBzYXZlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoIGNvbmZpZ3VyYXRpb25zICkge1xuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2U7XG4gICAgICAgICAgICBpZiAoIGNvbmZpZ3VyYXRpb25zLmxlbmd0aCA8IDEgKSB7XG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggJ05vIHNlbGVjdGVkIGNvbmZpZ3VyYXRpb25zIScgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuc2F2aW5nQ29uZmlndXJhdGlvbnMgPSB0cnVlO1xuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKCB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvZGVmYXVsdC90ZW1wbGF0ZXMvU2F2ZUNvbmZpZ3VyYXRpb25TZXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NhdmVDb25maWd1cmF0aW9uU2V0Q29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgLy9zaXplOiBzaXplLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uczogY29uZmlndXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YTogbWV0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGU6ICRzY29wZS5kYXRhTW9kZWxzLmRlc2lnbi5ub2RlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbiggZnVuY3Rpb24gKCAvKnJlc3VsdCovICkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5zYXZpbmdDb25maWd1cmF0aW9ucyA9IGZhbHNlO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5nZW5lcmF0ZURhc2hib2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCAnZXhwb3NlU2VsZWN0aW9uJywgJ2Rhc2hib2FyZCcgKTtcbiAgICAgICAgfTtcblxuICAgICAgICBnZW5lcmF0ZURhc2hib2FyZCA9IGZ1bmN0aW9uICggY29uZmlndXJhdGlvbnMgKSB7XG4gICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgcmVzdWx0SWRzID0gW107XG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNvbmZpZ3VyYXRpb25zLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgIGZvciAoIGtleSBpbiBjb25maWd1cmF0aW9uc1sgaSBdLnJlc3VsdHMgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggY29uZmlndXJhdGlvbnNbIGkgXS5yZXN1bHRzLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdElkcy5wdXNoKCBrZXkgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggcmVzdWx0SWRzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbyggJ0dlbmVyYXRpbmcgZGFzaGJvYXJkIGZvciAnICsgcmVzdWx0SWRzLmxlbmd0aCArICcgcmVzdWx0cy4nICk7XG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5nZW5lcmF0ZURhc2hib2FyZCggY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCByZXN1bHRJZHMgKVxuICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByZXN1bHRMaWdodCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCByZXN1bHRMaWdodC5zdWNjZXNzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoICdEYXNoYm9hcmQgZ2VuZXJhdGVkICcgKyByZXN1bHRMaWdodC5hcnRpZmFjdHNIdG1sLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR0bDogLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCAnRGFzaGJvYXJkIGdlbmVyYXRpb24gZmFpbGVkLicgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBrID0gMDsgayA8IHJlc3VsdExpZ2h0Lm1lc3NhZ2VzLmxlbmd0aDsgayArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGdyb3dsLmhhc093blByb3BlcnR5KCByZXN1bHRMaWdodC5tZXNzYWdlc1sgayBdLnNldmVyaXR5ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bFsgcmVzdWx0TGlnaHQubWVzc2FnZXNbIGsgXS5zZXZlcml0eSBdKCByZXN1bHRMaWdodC5tZXNzYWdlc1sgayBdLm1lc3NhZ2UgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoIHJlc3VsdExpZ2h0Lm1lc3NhZ2VzWyBrIF0ubWVzc2FnZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIHJlYXNvbiApO1xuICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvciggJ0Rhc2hib2FyZCBnZW5lcmF0aW9uIGZhaWxlZC4nICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnTm8gcmVzdWx0cyBpbiBzZWxlY3RlZCBjb25maWd1cmF0aW9ucyEnICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ3NlbGVjdGlvbkV4cG9zZWQnLCBmdW5jdGlvbiAoIGV2ZW50LCBkYXRhLCBlVHlwZSApIHtcbiAgICAgICAgICAgIGlmICggZVR5cGUgPT09ICdzYXZlJyApIHtcbiAgICAgICAgICAgICAgICBzYXZlQ29uZmlndXJhdGlvbnMoIGRhdGEgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIGVUeXBlID09PSAnZGFzaGJvYXJkJyApIHtcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZURhc2hib2FyZCggZGF0YSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgZGVzaWduU2VydmljZS5yZWdpc3RlcldhdGNoZXIoIGNvbnRleHQsIGZ1bmN0aW9uICggZGVzdHJveWVkICkge1xuXG4gICAgICAgICAgICBpZiAoIGRlc3Ryb3llZCApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oICdkZXN0cm95IGV2ZW50IHJhaXNlZCcgKTtcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyggJ2luaXRpYWxpemUgZXZlbnQgcmFpc2VkJyApO1xuXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWduTm9kZSggY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAoIHVwZGF0ZU9iamVjdCApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oIHVwZGF0ZU9iamVjdCApO1xuICAgICAgICAgICAgICAgIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJyApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCAnTG9hZCBzaG91bGRudCBoYXBwZW4nICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnICkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5kZXNpZ24gPSB1cGRhdGVPYmplY3QuZGF0YTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCB1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoICdEZXNpZ24gTm9kZSB3YXMgcmVtb3ZlZCEnICk7XG4gICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCAnL3dvcmtzcGFjZURldGFpbHMvJyArIHdvcmtzcGFjZUlkLnJlcGxhY2UoIC9cXC8vZywgJy0nICkgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIHVwZGF0ZU9iamVjdCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmRlc2lnbiA9IGRhdGEuZGVzaWduO1xuICAgICAgICAgICAgICAgICAgICBtZXRhID0gZGF0YS5tZXRhO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuICAgIH0gKVxuICAgIC5jb250cm9sbGVyKCAnU2F2ZUNvbmZpZ3VyYXRpb25TZXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICRtb2RhbEluc3RhbmNlLCAkdGltZW91dCwgZ3Jvd2wsIGRhdGEsXG4gICAgICAgIGRlc2lnblNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgIC8vbWV0YSA9IGRhdGEubWV0YSxcbiAgICAgICAgICAgIGRlc2lnbk5vZGUgPSBkYXRhLmRlc2lnbk5vZGUsXG4gICAgICAgICAgICBjb250ZXh0ID0gZGF0YS5jb250ZXh0O1xuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBudWxsLFxuICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgIG5ick9mQ29uZmlndXJhdGlvbnM6IGNvbmZpZ3VyYXRpb25zLmxlbmd0aFxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICggISRzY29wZS5kYXRhLm5hbWUgKSB7XG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggJ1lvdSBtdXN0IHByb3ZpZGUgYSBuYW1lIScgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBncm93bC5pbmZvKCAnU2F2aW5nIGNvbmZpZ3VyYXRpb24gc2V0ICcgKyAkc2NvcGUuZGF0YS5uYW1lICsgJ3RoaXMgbWF5IHRha2UgYSB3aGlsZS4uLicgKTtcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2FsbFNhdmVEZXNlcnRDb25maWd1cmF0aW9ucyggY29udGV4dCwgJHNjb3BlLmRhdGEubmFtZSwgJHNjb3BlLmRhdGEuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgZGVzaWduTm9kZS5nZXRJZCgpIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCAnQ29uZmlndXJhdGlvbnMgc2F2ZWQgdG8gJyArICRzY29wZS5kYXRhLm5hbWUgKTtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoICRzY29wZS5kYXRhICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLnNhdmVDb25maWd1cmF0aW9uU2V0KCRzY29wZS5kYXRhLm5hbWUsICRzY29wZS5kYXRhLmRlc2NyaXB0aW9uLCBjb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUsIG1ldGEpXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnQ29uZmlndXJhdGlvbnMgc2F2ZWQgdG8gJyArICRzY29wZS5kYXRhLm5hbWUpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5kYXRhKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCAnY2FuY2VsJyApO1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ0N5UGh5QXBwJyApXG4gICAgLmNvbnRyb2xsZXIoICdUZXN0QmVuY2hDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICRzdGF0ZSwgJHRpbWVvdXQsICRsb2NhdGlvbiwgZ3Jvd2wsIHRlc3RCZW5jaFNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICdteS1kYi1jb25uZWN0aW9uLWlkJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdvcmtzcGFjZUlkID0gJHN0YXRlLnBhcmFtcy53b3Jrc3BhY2VJZC5yZXBsYWNlKCAvLS9nLCAnLycgKSxcbiAgICAgICAgICAgIHRlc3RCZW5jaElkID0gJHN0YXRlLnBhcmFtcy50ZXN0QmVuY2hJZC5yZXBsYWNlKCAvLS9nLCAnLycgKTtcblxuICAgICAgICBjb25zb2xlLmxvZyggJ1Rlc3RCZW5jaENvbnRyb2xsZXInICk7XG4gICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb250ZXh0LmRiO1xuXG4gICAgICAgICRzY29wZS53b3Jrc3BhY2VJZCA9IHdvcmtzcGFjZUlkO1xuICAgICAgICAkc2NvcGUudGVzdEJlbmNoSWQgPSB0ZXN0QmVuY2hJZDtcblxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxuICAgICAgICBpZiAoICRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZyggJHNjb3BlLmNvbm5lY3Rpb25JZCApICkge1xuICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ1Rlc3RCZW5jaENvbnRyb2xsZXInICsgKCBuZXcgRGF0ZSgpIClcbiAgICAgICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkc2NvcGUuJG9uKCAnJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyggY29udGV4dCApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25TdGF0dXM6ICdTZWxlY3QgYSBUb3AgTGV2ZWwgU3lzdGVtIFVuZGVyIFRlc3QuLi4nLFxuICAgICAgICAgICAgZGVzaWduSWQ6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVscyA9IHtcbiAgICAgICAgICAgIHRlc3RCZW5jaDoge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdMb2FkaW5nIHRlc3QtYmVuY2guLidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uczogW10sXG4gICAgICAgICAgICBzZXROYW1lOiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ2NvbmZpZ3VyYXRpb25zTG9hZGVkJywgZnVuY3Rpb24gKCBldmVudCwgZGF0YSApIHtcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gW107XG4gICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucztcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5zZXROYW1lID0gZGF0YS5zZXROYW1lO1xuICAgICAgICAgICAgICAgIGlmICggZGF0YS5jb25maWd1cmF0aW9ucy5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoICdUaGVyZSB3ZXJlIG5vIGNvbmZpZ3VyYXRpb25zIGluICcgKyBkYXRhLnNldE5hbWUgKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnU2VsZWN0IGFuIGFjdGlvbiBhYm92ZS4uLic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0U2V0JywgZnVuY3Rpb24gKCBldmVudCwgbmV3TGlzdEl0ZW0sIG9sZExpc3RJdGVtICkge1xuICAgICAgICAgICAgaWYgKCAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gubm9kZSApIHtcbiAgICAgICAgICAgICAgICBpZiAoICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC50bHN1dElkID09PSBuZXdMaXN0SXRlbS5pZCApIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbyggJ0Rlc2lnbiBzcGFjZSBpcyBhbHJlYWR5IHNldCBhcyBUb3AgTGV2ZWwgU3lzdGVtIFVuZGVyIFRlc3QuJyApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC50bHN1dElkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC50bHN1dElkID0gbmV3TGlzdEl0ZW0uaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdMaXN0SXRlbS5jc3NDbGFzcyA9ICd0b3AtbGV2ZWwtc3lzdGVtLXVuZGVyLXRlc3QnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBvbGRMaXN0SXRlbSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRMaXN0SXRlbS5jc3NDbGFzcyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLm5vZGUubWFrZVBvaW50ZXIoICdUb3BMZXZlbFN5c3RlbVVuZGVyVGVzdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3TGlzdEl0ZW0uaWQgKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyRzY29wZS5zdGF0ZS5kZXNpZ25JZCA9IG5ld0xpc3RJdGVtLmlkO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RTZXQnLCBuZXdMaXN0SXRlbSwgb2xkTGlzdEl0ZW0gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggJ0NhbiBub3Qgc2V0IFRMU1VUIHdoaWxlIHRlc3QtYmVuY2ggaGFzIG5vdCBiZWVuIGxvYWRlZC4nICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gKTtcblxuICAgICAgICAkc2NvcGUuJG9uKCAnc2VsZWN0aW9uRXhwb3NlZCcsIGZ1bmN0aW9uICggZXZlbnQsIGNvbmZpZ3VyYXRpb25zICkge1xuICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgICBudW1DZmdzID0gY29uZmlndXJhdGlvbnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGludm9rZVRlc3RCZW5jaFJ1bm5lciA9IGZ1bmN0aW9uICggY29uZmlndXJhdGlvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5ydW5UZXN0QmVuY2goIGNvbnRleHQsIHRlc3RCZW5jaElkLCBjb25maWd1cmF0aW9uLmlkIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIHJlc3VsdExpZ2h0ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBqO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcmVzdWx0TGlnaHQuc3VjY2VzcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcyggJ1Rlc3RCZW5jaCBydW4gc3VjY2Vzc2Z1bGx5IG9uICcgKyBjb25maWd1cmF0aW9uLm5hbWUgKyAnLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR0bDogLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvciggJ1Rlc3RCZW5jaCBydW4gZmFpbGVkIG9uICcgKyBjb25maWd1cmF0aW9uLm5hbWUgKyAnLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR0bDogLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggaiA9IDA7IGogPCByZXN1bHRMaWdodC5tZXNzYWdlcy5sZW5ndGg7IGogKz0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggZ3Jvd2wuaGFzT3duUHJvcGVydHkoIHJlc3VsdExpZ2h0Lm1lc3NhZ2VzWyBqIF0uc2V2ZXJpdHkgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bFsgcmVzdWx0TGlnaHQubWVzc2FnZXNbIGogXS5zZXZlcml0eSBdKCByZXN1bHRMaWdodC5tZXNzYWdlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaiBdLm1lc3NhZ2UgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggcmVzdWx0TGlnaHQubWVzc2FnZXNbIGogXS5tZXNzYWdlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoIHJlYXNvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIHJlYXNvbiApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoICdSdW5uaW5nIHRlc3QtYmVuY2ggZmFpbGVkLicgKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoIG51bUNmZ3MgPCAxICkge1xuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoICdObyBzZWxlY3RlZCBjb25maWd1cmF0aW9ucyEnICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG51bUNmZ3M7IGkgKz0gMSApIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbnNbIGkgXTtcbiAgICAgICAgICAgICAgICBncm93bC5pbmZvKCAnVGVzdC1iZW5jaCBzdGFydGVkIG9uICcgKyBjb25maWd1cmF0aW9uLm5hbWUgKyAnIFsnICsgKCBpICsgMSApXG4gICAgICAgICAgICAgICAgICAgIC50b1N0cmluZygpICsgJy8nICsgbnVtQ2ZncyArICddJyApO1xuICAgICAgICAgICAgICAgIGludm9rZVRlc3RCZW5jaFJ1bm5lciggY29uZmlndXJhdGlvbiApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgJHNjb3BlLnJ1blRlc3RCZW5jaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCAnZXhwb3NlU2VsZWN0aW9uJyApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKCBjb250ZXh0LCBmdW5jdGlvbiAoIGRlc3Ryb3llZCApIHtcblxuICAgICAgICAgICAgaWYgKCBkZXN0cm95ZWQgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCAnZGVzdHJveSBldmVudCByYWlzZWQnICk7XG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oICdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcgKTtcblxuICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS53YXRjaFRlc3RCZW5jaE5vZGUoIGNvbnRleHQsICRzY29wZS50ZXN0QmVuY2hJZCwgZnVuY3Rpb24gKCB1cGRhdGVPYmplY3QgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCB1cGRhdGVPYmplY3QgKTtcbiAgICAgICAgICAgICAgICBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggJ0xvYWQgc2hvdWxkIG5vdCBoYXBwZW4nICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnICkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2ggPSB1cGRhdGVPYmplY3QuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB1cGRhdGVPYmplY3QudGxzdXRDaGFuZ2VkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoICd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdENoYW5nZWQnLCAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnICkge1xuICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnVGVzdCBCZW5jaCB3YXMgcmVtb3ZlZCEnICk7XG4gICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCAnL3dvcmtzcGFjZURldGFpbHMvJyArIHdvcmtzcGFjZUlkLnJlcGxhY2UoIC9cXC8vZywgJy0nICkgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIHVwZGF0ZU9iamVjdCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaCA9IGRhdGEudGVzdEJlbmNoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGRhdGEudGVzdEJlbmNoLnRsc3V0SWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCggJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0Q2hhbmdlZCcsIGRhdGEudGVzdEJlbmNoLnRsc3V0SWQgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ0N5UGh5QXBwJyApXG4gICAgLmNvbnRyb2xsZXIoICdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHJvb3RTY29wZSwgJHNjb3BlLCAkd2luZG93LCAkc3RhdGUgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIHdvcmtzcGFjZUlkID0gJHN0YXRlLnBhcmFtcy53b3Jrc3BhY2VJZC5yZXBsYWNlKCAvLS9nLCAnLycgKTtcbiAgICAgICAgY29uc29sZS5sb2coICdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIHdvcmtzcGFjZUlkICk7XG4gICAgICAgICRzY29wZS5kYXRhTW9kZWwgPSB7XG4gICAgICAgICAgICB3b3Jrc3BhY2VJZDogd29ya3NwYWNlSWRcbiAgICAgICAgfTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yLml0ZW1zID0gWyB7XG4gICAgICAgICAgICBpZDogJ3Jvb3QnLFxuICAgICAgICAgICAgbGFiZWw6ICdBRE1FZGl0b3InLFxuICAgICAgICAgICAgaXRlbUNsYXNzOiAnY3lwaHktcm9vdCcsXG4gICAgICAgICAgICBtZW51OiBbIHtcbiAgICAgICAgICAgICAgICBpZDogJ2VkaXRvcicsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFsge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW4nLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gZWRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbiggJy8/cHJvamVjdD1BRE1FZGl0b3InLCAnX2JsYW5rJyApO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7fVxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSBdXG4gICAgICAgIH0gXTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yLnNlcGFyYXRvciA9IGZhbHNlO1xuICAgICAgICAvL2RlYnVnZ2VyO1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ0N5UGh5QXBwJyApXG4gICAgLmNvbnRyb2xsZXIoICdXb3Jrc3BhY2VzQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHJvb3RTY29wZSwgJHdpbmRvdyApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICBjb25zb2xlLmxvZyggJ1dvcmtzcGFjZXNDb250cm9sbGVyJyApO1xuICAgICAgICAkcm9vdFNjb3BlLm1haW5OYXZpZ2F0b3IuaXRlbXMgPSBbIHtcbiAgICAgICAgICAgIGlkOiAncm9vdCcsXG4gICAgICAgICAgICBsYWJlbDogJ0FETUVkaXRvcicsXG4gICAgICAgICAgICBpdGVtQ2xhc3M6ICdjeXBoeS1yb290JyxcbiAgICAgICAgICAgIG1lbnU6IFsge1xuICAgICAgICAgICAgICAgIGlkOiAnZWRpdG9yJyxcbiAgICAgICAgICAgICAgICBpdGVtczogWyB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbicsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBlZGl0b3InLFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCcsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCAnLz9wcm9qZWN0PUFETUVkaXRvcicsICdfYmxhbmsnICk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHt9XG4gICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICB9IF1cbiAgICAgICAgfSBdO1xuICAgICAgICAkcm9vdFNjb3BlLm1haW5OYXZpZ2F0b3Iuc2VwYXJhdG9yID0gZmFsc2U7XG4gICAgfSApOyJdfQ==
