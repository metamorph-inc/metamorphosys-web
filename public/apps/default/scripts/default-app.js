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
    .run( function ( $state, growl, dataStoreService, projectService, branchService ) {
        'use strict';
        var connectionId = 'my-db-connection-id';

        dataStoreService.connectToDatabase( connectionId, {
            host: window.location.basename
        } )
            .then( function () {
                // select default project and branch (master)
                return projectService.selectProject( connectionId, 'ADMEditor' );
            } )
            .then( function () {
                dataStoreService.watchConnectionState( connectionId, function ( eventType ) {
                    console.log( 'watchConnectionState: ' + eventType );
                } );
                return branchService.selectBranch( connectionId, 'master' );
            } )
            .then( function () {
                branchService.watchBranchState( 'my-db-connection-id', function ( eventType ) {
                    console.log( 'watchBranchState: ' + eventType );
                } );
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
                            context: context,
                            designNode: $scope.dataModels.design.node
                        };
                    }
                }
            } );
            modalInstance.result.then( function ( /*result*/) {
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
                } );
        } );
    } )
    .controller( 'SaveConfigurationSetController', function ( $scope, $modalInstance, $timeout, growl, data,
        designService ) {
        'use strict';
        var configurations = data.configurations,
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
                        .then( function ( result ) {
                            var j,
                                key,
                                artifactsHtml = '';
                            // Build up artifacts html for growling.
                            for ( key in result.artifacts ) {
                                if ( result.artifacts.hasOwnProperty( key ) ) {
                                    artifactsHtml += '<br> <a href="' + result.artifacts[ key ].downloadUrl +
                                        '">' + key + '</a>';
                                }
                            }
                            if ( result.success ) {
                                growl.success( 'TestBench run successfully on ' + configuration.name + '.' +
                                    artifactsHtml, {
                                        ttl: -1
                                    } );
                            } else {
                                growl.error( 'TestBench run failed on ' + configuration.name + '.' +
                                    artifactsHtml, {
                                        ttl: -1
                                    } );
                                for ( j = 0; j < result.messages.length; j += 1 ) {
                                    if ( growl.hasOwnProperty( result.messages[ j ].severity ) ) {
                                        growl[ result.messages[ j ].severity ]( result.messages[
                                            j ].message );
                                    } else {
                                        growl.warning( result.messages[ j ].message );
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


//# sourceMappingURL=default-app.js.map