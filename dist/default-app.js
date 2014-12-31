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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvZGVmYXVsdC9hcHAuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9kZWZhdWx0L3ZpZXdzL0Rlc2lnblNwYWNlL0Rlc2lnblNwYWNlQ29udHJvbGxlci5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvVGVzdEJlbmNoL1Rlc3RCZW5jaENvbnRyb2xsZXIuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9kZWZhdWx0L3ZpZXdzL1dvcmtzcGFjZURldGFpbHMvV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXIuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2FwcC9kZWZhdWx0L3ZpZXdzL1dvcmtzcGFjZXMvV29ya3NwYWNlc0NvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCB3aW5kb3csIHJlcXVpcmUqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ0N5UGh5QXBwJywgW1xuICAgICd1aS5yb3V0ZXInLFxuXG4gICAgJ2dtZS5zZXJ2aWNlcycsXG5cbiAgICAnaXNpcy51aS5jb21wb25lbnRzJyxcblxuICAgICdjeXBoeS5jb21wb25lbnRzJyxcblxuICAgIC8vIGFwcCBzcGVjaWZpYyB0ZW1wbGF0ZXNcbiAgICAnY3lwaHkuZGVmYXVsdC50ZW1wbGF0ZXMnXG5dIClcbiAgICAuY29uZmlnKCBmdW5jdGlvbiAoICRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgLy8gRm9yIGFueSB1bm1hdGNoZWQgdXJsLCByZWRpcmVjdCB0byAvd29ya3NwYWNlc1xuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCAnL3dvcmtzcGFjZXMnICk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIE5vdyBzZXQgdXAgdGhlIHN0YXRlc1xuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAgICAgLnN0YXRlKCAnaW5kZXgnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL2luZGV4J1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAuc3RhdGUoICd3b3Jrc3BhY2VzJywge1xuICAgICAgICAgICAgICAgIHVybDogJy93b3Jrc3BhY2VzJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9kZWZhdWx0L3RlbXBsYXRlcy9Xb3Jrc3BhY2VzLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdXb3Jrc3BhY2VzQ29udHJvbGxlcidcbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgLnN0YXRlKCAnd29ya3NwYWNlRGV0YWlscycsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvd29ya3NwYWNlRGV0YWlscy86d29ya3NwYWNlSWQnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2RlZmF1bHQvdGVtcGxhdGVzL1dvcmtzcGFjZURldGFpbHMuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJ1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAuc3RhdGUoICdkZXNpZ25TcGFjZScsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvZGVzaWduU3BhY2UvOndvcmtzcGFjZUlkLzpkZXNpZ25JZCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvZGVmYXVsdC90ZW1wbGF0ZXMvRGVzaWduU3BhY2UuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnblNwYWNlQ29udHJvbGxlcidcbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgLnN0YXRlKCAndGVzdEJlbmNoJywge1xuICAgICAgICAgICAgICAgIHVybDogJy90ZXN0QmVuY2gvOndvcmtzcGFjZUlkLzp0ZXN0QmVuY2hJZCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvZGVmYXVsdC90ZW1wbGF0ZXMvVGVzdEJlbmNoLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdUZXN0QmVuY2hDb250cm9sbGVyJ1xuICAgICAgICAgICAgfSApO1xuICAgIH0gKVxuICAgIC5jb250cm9sbGVyKCAnTWFpbk5hdmlnYXRvckNvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRyb290U2NvcGUsICRzY29wZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICAkc2NvcGUubmF2aWdhdG9yID0ge307XG4gICAgICAgICRzY29wZS5uYXZpZ2F0b3IuaXRlbXMgPSBbIHtcbiAgICAgICAgICAgIGlkOiAncm9vdCcsXG4gICAgICAgICAgICBsYWJlbDogJ0FETUVkaXRvcicsXG4gICAgICAgICAgICBpdGVtQ2xhc3M6ICdjeXBoeS1yb290J1xuICAgICAgICB9IF07XG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvciA9ICRzY29wZS5uYXZpZ2F0b3I7XG4gICAgfSApXG4gICAgLnJ1biggZnVuY3Rpb24gKCAkc3RhdGUsIGdyb3dsLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgY29ubmVjdGlvbklkID0gJ215LWRiLWNvbm5lY3Rpb24taWQnO1xuXG4gICAgICAgIGRhdGFTdG9yZVNlcnZpY2UuY29ubmVjdFRvRGF0YWJhc2UoIGNvbm5lY3Rpb25JZCwge1xuICAgICAgICAgICAgaG9zdDogd2luZG93LmxvY2F0aW9uLmJhc2VuYW1lXG4gICAgICAgIH0gKVxuICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBzZWxlY3QgZGVmYXVsdCBwcm9qZWN0IGFuZCBicmFuY2ggKG1hc3RlcilcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdCggY29ubmVjdGlvbklkLCAnQURNRWRpdG9yJyApO1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAuXG4gICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICBncm93bC5lcnJvciggJ0FETUVkaXRvciBkb2VzIG5vdCBleGlzdC4gQ3JlYXRlIGFuZCBpbXBvcnQgaXQgdXNpbmcgdGhlIDxhIGhyZWY9XCInICtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJ1wiPiB3ZWJnbWUgaW50ZXJmYWNlPC9hPi4nICk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgfSApO1xuICAgIH0gKTtcblxuXG5yZXF1aXJlKCAnLi92aWV3cy9Xb3Jrc3BhY2VzL1dvcmtzcGFjZXNDb250cm9sbGVyJyApO1xucmVxdWlyZSggJy4vdmlld3MvV29ya3NwYWNlRGV0YWlscy9Xb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicgKTtcbnJlcXVpcmUoICcuL3ZpZXdzL0Rlc2lnblNwYWNlL0Rlc2lnblNwYWNlQ29udHJvbGxlcicgKTtcbnJlcXVpcmUoICcuL3ZpZXdzL1Rlc3RCZW5jaC9UZXN0QmVuY2hDb250cm9sbGVyJyApOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXG5cbmFuZ3VsYXIubW9kdWxlKCAnQ3lQaHlBcHAnIClcbiAgICAuY29udHJvbGxlciggJ0Rlc2lnblNwYWNlQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCAkc3RhdGUsICR0aW1lb3V0LCAkbW9kYWwsICRsb2NhdGlvbiwgJHEsIGdyb3dsLFxuICAgICAgICBkZXNlcnRTZXJ2aWNlLCBkZXNpZ25TZXJ2aWNlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBjb250ZXh0LFxuICAgICAgICAgICAgbWV0YSxcbiAgICAgICAgICAgIHdvcmtzcGFjZUlkID0gJHN0YXRlLnBhcmFtcy53b3Jrc3BhY2VJZC5yZXBsYWNlKCAvLS9nLCAnLycgKSxcbiAgICAgICAgICAgIGRlc2lnbklkID0gJHN0YXRlLnBhcmFtcy5kZXNpZ25JZC5yZXBsYWNlKCAvLS9nLCAnLycgKSxcbiAgICAgICAgICAgIHNhdmVDb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgIGdlbmVyYXRlRGFzaGJvYXJkLFxuICAgICAgICAgICAgY2xlYW5VcENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICBjb25maWc7XG4gICAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucy5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnNbIGkgXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBjb25maWcuaGFzT3duUHJvcGVydHkoICdyZWdpb25JZCcgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcFJlZ2lvbiggY29udGV4dCwgY29uZmlnLnJlZ2lvbklkICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLnJlc3VsdHNBdmFsaWFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBjb25zb2xlLmxvZyggJ0Rlc2lnblNwYWNlQ29udHJvbGxlcicgKTtcbiAgICAgICAgJHNjb3BlLmNvbm5lY3Rpb25JZCA9ICdteS1kYi1jb25uZWN0aW9uLWlkJztcbiAgICAgICAgJHNjb3BlLndvcmtzcGFjZUlkID0gd29ya3NwYWNlSWQ7XG4gICAgICAgICRzY29wZS5kZXNpZ25JZCA9IGRlc2lnbklkO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXG4gICAgICAgIGlmICggJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCAkc2NvcGUuY29ubmVjdGlvbklkICkgKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnRGVzaWduU3BhY2VDb250cm9sbGVyJyArICggbmV3IERhdGUoKSApXG4gICAgICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLiRvbiggJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoIGNvbnRleHQgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgICAgICBkZXNpZ25UcmVlTG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2VydElucHV0QXZhbGlhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25TdGF0dXM6ICdTZWxlY3QgYW4gYWN0aW9uIGFib3ZlLi4uJyxcbiAgICAgICAgICAgIGhhc0NvbXBvbmVudHM6IHRydWUsXG4gICAgICAgICAgICBzYXZpbmdDb25maWd1cmF0aW9uczogZmFsc2UsXG4gICAgICAgICAgICByZXN1bHRzQXZhbGlhYmxlOiBmYWxzZVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5kYXRhTW9kZWxzID0ge1xuICAgICAgICAgICAgYXZtSWRzOiB7fSxcbiAgICAgICAgICAgIGRlc2VydElucHV0OiB7fSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiBbXSxcbiAgICAgICAgICAgIHNldE5hbWU6IG51bGwsXG4gICAgICAgICAgICBkZXNpZ246IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnTG9hZGluZyBkZXNpZ24uLi4nXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ2Rlc2lnblRyZWVMb2FkZWQnLCBmdW5jdGlvbiAoIGV2ZW50LCBkYXRhICkge1xuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuYXZtSWRzID0gZGF0YTtcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5oYXNDb21wb25lbnRzID0gT2JqZWN0LmtleXMoIGRhdGEgKVxuICAgICAgICAgICAgICAgIC5sZW5ndGggPiAwO1xuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmRlc2lnblRyZWVMb2FkZWQgPSB0cnVlO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ3NlbGVjdGVkSW5zdGFuY2VzJywgZnVuY3Rpb24gKCBldmVudCwgZGF0YSApIHtcbiAgICAgICAgICAgIGdyb3dsLmluZm8oIGRhdGEubmFtZSArICcgaGFzICcgKyBkYXRhLmlkcy5sZW5ndGggKyAnIGluc3RhbmNlKHMpLicgKTtcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCAnc2V0U2VsZWN0ZWROb2RlcycsIGRhdGEuaWRzICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAkc2NvcGUuJG9uKCAnY29uZmlndXJhdGlvbkNsaWNrZWQnLCBmdW5jdGlvbiAoIGV2ZW50LCBkYXRhICkge1xuICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgaWRzID0gW107XG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGRhdGEuYWx0ZXJuYXRpdmVBc3NpZ25tZW50cy5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgICAgICBpZHMucHVzaCggZGF0YS5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzWyBpIF0uc2VsZWN0ZWRBbHRlcm5hdGl2ZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoICdzZXRTZWxlY3RlZE5vZGVzJywgaWRzICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAkc2NvcGUuJG9uKCAnZGVzZXJ0SW5wdXRSZWFkeScsIGZ1bmN0aW9uICggZXZlbnQsIGRhdGEgKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5kZXNlcnRJbnB1dCA9IGRhdGE7XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUuZGVzZXJ0SW5wdXRBdmFsaWFibGUgPSB0cnVlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coIGRhdGEgKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgICRzY29wZS4kb24oICdjb25maWd1cmF0aW9uc0xvYWRlZCcsIGZ1bmN0aW9uICggZXZlbnQsIGRhdGEgKSB7XG4gICAgICAgICAgICBjbGVhblVwQ29uZmlndXJhdGlvbnMoKTtcbiAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnNldE5hbWUgPSBkYXRhLnNldE5hbWU7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMgPSBkYXRhLmNvbmZpZ3VyYXRpb25zO1xuICAgICAgICAgICAgICAgIGlmICggZGF0YS5jb25maWd1cmF0aW9ucy5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoICdUaGVyZSB3ZXJlIG5vIGNvbmZpZ3VyYXRpb25zIGluICcgKyBkYXRhLnNldE5hbWUgKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLmNvbmZpZ3VyYXRpb25TdGF0dXMgPSAnU2VsZWN0IGFuIGFjdGlvbiBhYm92ZS4uLic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnMubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKCBkZXNpZ25TZXJ2aWNlLmFwcGVuZFdhdGNoUmVzdWx0cyggY29udGV4dCwgJHNjb3BlLmRhdGFNb2RlbHMuY29uZmlndXJhdGlvbnNbXG4gICAgICAgICAgICAgICAgICAgICAgICBpIF0gKSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkcS5hbGwoIHF1ZXVlTGlzdCApXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGhhc1Jlc3VsdHMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNSZXN1bHRzLm1hcCggZnVuY3Rpb24gKCByZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCByZXMgPT09IHRydWUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5yZXN1bHRzQXZhbGlhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgICRzY29wZS5jYWxjdWxhdGVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdyb3dsLmluZm8oICdDYWxjdWxhdGluZyBjb25maWd1cmF0aW9ucy4gUGxlYXNlIHdhaXQuLicgKTtcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ0NhbGN1bGF0aW5nLi4nO1xuICAgICAgICAgICAgY2xlYW5VcENvbmZpZ3VyYXRpb25zKCk7XG4gICAgICAgICAgICBkZXNlcnRTZXJ2aWNlLmNhbGN1bGF0ZUNvbmZpZ3VyYXRpb25zKCAkc2NvcGUuZGF0YU1vZGVscy5kZXNlcnRJbnB1dCApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY29uZmlndXJhdGlvbnMgKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmNvbmZpZ3VyYXRpb25zID0gY29uZmlndXJhdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnNldE5hbWUgPSAnY2FsY3VsYXRlZCc7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ0NhbGN1bGF0ZWQnO1xuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvciggcmVhc29uICk7XG4gICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoICdGYWlsZWQgdG8gY2FsY3VsYXRlIGNvbmZpZ3VyYXRpb25zLCBzZWUgY29uc29sZSBmb3IgbW9yZSBpbmZvLicgKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnNldE5hbWUgPSAnJztcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUuY29uZmlndXJhdGlvblN0YXR1cyA9ICdGYWlsZWQgdG8gY2FsY3VsYXRlLic7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNhdmVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCAnZXhwb3NlU2VsZWN0aW9uJywgJ3NhdmUnICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2F2ZUNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCBjb25maWd1cmF0aW9ucyApIHtcbiAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlO1xuICAgICAgICAgICAgaWYgKCBjb25maWd1cmF0aW9ucy5sZW5ndGggPCAxICkge1xuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoICdObyBzZWxlY3RlZCBjb25maWd1cmF0aW9ucyEnICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLnNhdmluZ0NvbmZpZ3VyYXRpb25zID0gdHJ1ZTtcbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbigge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2RlZmF1bHQvdGVtcGxhdGVzL1NhdmVDb25maWd1cmF0aW9uU2V0Lmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTYXZlQ29uZmlndXJhdGlvblNldENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIC8vc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IGNvbmZpZ3VyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGE6IG1ldGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlOiAkc2NvcGUuZGF0YU1vZGVscy5kZXNpZ24ubm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oIGZ1bmN0aW9uICggLypyZXN1bHQqLykge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5zYXZpbmdDb25maWd1cmF0aW9ucyA9IGZhbHNlO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5nZW5lcmF0ZURhc2hib2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCAnZXhwb3NlU2VsZWN0aW9uJywgJ2Rhc2hib2FyZCcgKTtcbiAgICAgICAgfTtcblxuICAgICAgICBnZW5lcmF0ZURhc2hib2FyZCA9IGZ1bmN0aW9uICggY29uZmlndXJhdGlvbnMgKSB7XG4gICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgcmVzdWx0SWRzID0gW107XG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNvbmZpZ3VyYXRpb25zLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgIGZvciAoIGtleSBpbiBjb25maWd1cmF0aW9uc1sgaSBdLnJlc3VsdHMgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggY29uZmlndXJhdGlvbnNbIGkgXS5yZXN1bHRzLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdElkcy5wdXNoKCBrZXkgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggcmVzdWx0SWRzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbyggJ0dlbmVyYXRpbmcgZGFzaGJvYXJkIGZvciAnICsgcmVzdWx0SWRzLmxlbmd0aCArICcgcmVzdWx0cy4nICk7XG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5nZW5lcmF0ZURhc2hib2FyZCggY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCByZXN1bHRJZHMgKVxuICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByZXN1bHRMaWdodCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCByZXN1bHRMaWdodC5zdWNjZXNzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoICdEYXNoYm9hcmQgZ2VuZXJhdGVkICcgKyByZXN1bHRMaWdodC5hcnRpZmFjdHNIdG1sLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR0bDogLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCAnRGFzaGJvYXJkIGdlbmVyYXRpb24gZmFpbGVkLicgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBrID0gMDsgayA8IHJlc3VsdExpZ2h0Lm1lc3NhZ2VzLmxlbmd0aDsgayArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGdyb3dsLmhhc093blByb3BlcnR5KCByZXN1bHRMaWdodC5tZXNzYWdlc1sgayBdLnNldmVyaXR5ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bFsgcmVzdWx0TGlnaHQubWVzc2FnZXNbIGsgXS5zZXZlcml0eSBdKCByZXN1bHRMaWdodC5tZXNzYWdlc1sgayBdLm1lc3NhZ2UgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoIHJlc3VsdExpZ2h0Lm1lc3NhZ2VzWyBrIF0ubWVzc2FnZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIHJlYXNvbiApO1xuICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvciggJ0Rhc2hib2FyZCBnZW5lcmF0aW9uIGZhaWxlZC4nICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnTm8gcmVzdWx0cyBpbiBzZWxlY3RlZCBjb25maWd1cmF0aW9ucyEnICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ3NlbGVjdGlvbkV4cG9zZWQnLCBmdW5jdGlvbiAoIGV2ZW50LCBkYXRhLCBlVHlwZSApIHtcbiAgICAgICAgICAgIGlmICggZVR5cGUgPT09ICdzYXZlJyApIHtcbiAgICAgICAgICAgICAgICBzYXZlQ29uZmlndXJhdGlvbnMoIGRhdGEgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIGVUeXBlID09PSAnZGFzaGJvYXJkJyApIHtcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZURhc2hib2FyZCggZGF0YSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgZGVzaWduU2VydmljZS5yZWdpc3RlcldhdGNoZXIoIGNvbnRleHQsIGZ1bmN0aW9uICggZGVzdHJveWVkICkge1xuXG4gICAgICAgICAgICBpZiAoIGRlc3Ryb3llZCApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oICdkZXN0cm95IGV2ZW50IHJhaXNlZCcgKTtcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyggJ2luaXRpYWxpemUgZXZlbnQgcmFpc2VkJyApO1xuXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWduTm9kZSggY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAoIHVwZGF0ZU9iamVjdCApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oIHVwZGF0ZU9iamVjdCApO1xuICAgICAgICAgICAgICAgIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJyApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCAnTG9hZCBzaG91bGRudCBoYXBwZW4nICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnICkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5kZXNpZ24gPSB1cGRhdGVPYmplY3QuZGF0YTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCB1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoICdEZXNpZ24gTm9kZSB3YXMgcmVtb3ZlZCEnICk7XG4gICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCAnL3dvcmtzcGFjZURldGFpbHMvJyArIHdvcmtzcGFjZUlkLnJlcGxhY2UoIC9cXC8vZywgJy0nICkgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIHVwZGF0ZU9iamVjdCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLmRlc2lnbiA9IGRhdGEuZGVzaWduO1xuICAgICAgICAgICAgICAgICAgICBtZXRhID0gZGF0YS5tZXRhO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuICAgIH0gKVxuICAgIC5jb250cm9sbGVyKCAnU2F2ZUNvbmZpZ3VyYXRpb25TZXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICRtb2RhbEluc3RhbmNlLCAkdGltZW91dCwgZ3Jvd2wsIGRhdGEsXG4gICAgICAgIGRlc2lnblNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbmZpZ3VyYXRpb25zID0gZGF0YS5jb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgIC8vbWV0YSA9IGRhdGEubWV0YSxcbiAgICAgICAgICAgIGRlc2lnbk5vZGUgPSBkYXRhLmRlc2lnbk5vZGUsXG4gICAgICAgICAgICBjb250ZXh0ID0gZGF0YS5jb250ZXh0O1xuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBudWxsLFxuICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgIG5ick9mQ29uZmlndXJhdGlvbnM6IGNvbmZpZ3VyYXRpb25zLmxlbmd0aFxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICggISRzY29wZS5kYXRhLm5hbWUgKSB7XG4gICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggJ1lvdSBtdXN0IHByb3ZpZGUgYSBuYW1lIScgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBncm93bC5pbmZvKCAnU2F2aW5nIGNvbmZpZ3VyYXRpb24gc2V0ICcgKyAkc2NvcGUuZGF0YS5uYW1lICsgJ3RoaXMgbWF5IHRha2UgYSB3aGlsZS4uLicgKTtcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2FsbFNhdmVEZXNlcnRDb25maWd1cmF0aW9ucyggY29udGV4dCwgJHNjb3BlLmRhdGEubmFtZSwgJHNjb3BlLmRhdGEuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgZGVzaWduTm9kZS5nZXRJZCgpIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCAnQ29uZmlndXJhdGlvbnMgc2F2ZWQgdG8gJyArICRzY29wZS5kYXRhLm5hbWUgKTtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoICRzY29wZS5kYXRhICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLnNhdmVDb25maWd1cmF0aW9uU2V0KCRzY29wZS5kYXRhLm5hbWUsICRzY29wZS5kYXRhLmRlc2NyaXB0aW9uLCBjb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUsIG1ldGEpXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnQ29uZmlndXJhdGlvbnMgc2F2ZWQgdG8gJyArICRzY29wZS5kYXRhLm5hbWUpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5kYXRhKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCAnY2FuY2VsJyApO1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ0N5UGh5QXBwJyApXG4gICAgLmNvbnRyb2xsZXIoICdUZXN0QmVuY2hDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICRzdGF0ZSwgJHRpbWVvdXQsICRsb2NhdGlvbiwgZ3Jvd2wsIHRlc3RCZW5jaFNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7XG4gICAgICAgICAgICBkYjogJ215LWRiLWNvbm5lY3Rpb24taWQnXG4gICAgICAgIH0sXG4gICAgICAgICAgICB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSggLy0vZywgJy8nICksXG4gICAgICAgICAgICB0ZXN0QmVuY2hJZCA9ICRzdGF0ZS5wYXJhbXMudGVzdEJlbmNoSWQucmVwbGFjZSggLy0vZywgJy8nICk7XG5cbiAgICAgICAgY29uc29sZS5sb2coICdUZXN0QmVuY2hDb250cm9sbGVyJyApO1xuICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gY29udGV4dC5kYjtcblxuICAgICAgICAkc2NvcGUud29ya3NwYWNlSWQgPSB3b3Jrc3BhY2VJZDtcbiAgICAgICAgJHNjb3BlLnRlc3RCZW5jaElkID0gdGVzdEJlbmNoSWQ7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cbiAgICAgICAgaWYgKCAkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoICRzY29wZS5jb25uZWN0aW9uSWQgKSApIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0QmVuY2hDb250cm9sbGVyJyArICggbmV3IERhdGUoKSApXG4gICAgICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLiRvbiggJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoIGNvbnRleHQgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uU3RhdHVzOiAnU2VsZWN0IGEgVG9wIExldmVsIFN5c3RlbSBVbmRlciBUZXN0Li4uJyxcbiAgICAgICAgICAgIGRlc2lnbklkOiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMgPSB7XG4gICAgICAgICAgICB0ZXN0QmVuY2g6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnTG9hZGluZyB0ZXN0LWJlbmNoLi4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgc2V0TmFtZTogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS4kb24oICdjb25maWd1cmF0aW9uc0xvYWRlZCcsIGZ1bmN0aW9uICggZXZlbnQsIGRhdGEgKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy5jb25maWd1cmF0aW9ucyA9IGRhdGEuY29uZmlndXJhdGlvbnM7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMuc2V0TmFtZSA9IGRhdGEuc2V0TmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoIGRhdGEuY29uZmlndXJhdGlvbnMubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnVGhlcmUgd2VyZSBubyBjb25maWd1cmF0aW9ucyBpbiAnICsgZGF0YS5zZXROYW1lICk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS5jb25maWd1cmF0aW9uU3RhdHVzID0gJ1NlbGVjdCBhbiBhY3Rpb24gYWJvdmUuLi4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgICRzY29wZS4kb24oICd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdFNldCcsIGZ1bmN0aW9uICggZXZlbnQsIG5ld0xpc3RJdGVtLCBvbGRMaXN0SXRlbSApIHtcbiAgICAgICAgICAgIGlmICggJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLm5vZGUgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9PT0gbmV3TGlzdEl0ZW0uaWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLmluZm8oICdEZXNpZ24gc3BhY2UgaXMgYWxyZWFkeSBzZXQgYXMgVG9wIExldmVsIFN5c3RlbSBVbmRlciBUZXN0LicgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2gudGxzdXRJZCA9IG5ld0xpc3RJdGVtLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TGlzdEl0ZW0uY3NzQ2xhc3MgPSAndG9wLWxldmVsLXN5c3RlbS11bmRlci10ZXN0JztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggb2xkTGlzdEl0ZW0gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkTGlzdEl0ZW0uY3NzQ2xhc3MgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWxzLnRlc3RCZW5jaC5ub2RlLm1ha2VQb2ludGVyKCAnVG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0xpc3RJdGVtLmlkICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8kc2NvcGUuc3RhdGUuZGVzaWduSWQgPSBuZXdMaXN0SXRlbS5pZDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0U2V0JywgbmV3TGlzdEl0ZW0sIG9sZExpc3RJdGVtICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoICdDYW4gbm90IHNldCBUTFNVVCB3aGlsZSB0ZXN0LWJlbmNoIGhhcyBub3QgYmVlbiBsb2FkZWQuJyApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgJHNjb3BlLiRvbiggJ3NlbGVjdGlvbkV4cG9zZWQnLCBmdW5jdGlvbiAoIGV2ZW50LCBjb25maWd1cmF0aW9ucyApIHtcbiAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgICAgbnVtQ2ZncyA9IGNvbmZpZ3VyYXRpb25zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpbnZva2VUZXN0QmVuY2hSdW5uZXIgPSBmdW5jdGlvbiAoIGNvbmZpZ3VyYXRpb24gKSB7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucnVuVGVzdEJlbmNoKCBjb250ZXh0LCB0ZXN0QmVuY2hJZCwgY29uZmlndXJhdGlvbi5pZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByZXN1bHRMaWdodCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHJlc3VsdExpZ2h0LnN1Y2Nlc3MgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoICdUZXN0QmVuY2ggcnVuIHN1Y2Nlc3NmdWxseSBvbiAnICsgY29uZmlndXJhdGlvbi5uYW1lICsgJy4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdExpZ2h0LmFydGlmYWN0c0h0bWwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dGw6IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoICdUZXN0QmVuY2ggcnVuIGZhaWxlZCBvbiAnICsgY29uZmlndXJhdGlvbi5uYW1lICsgJy4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdExpZ2h0LmFydGlmYWN0c0h0bWwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dGw6IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGogPSAwOyBqIDwgcmVzdWx0TGlnaHQubWVzc2FnZXMubGVuZ3RoOyBqICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGdyb3dsLmhhc093blByb3BlcnR5KCByZXN1bHRMaWdodC5tZXNzYWdlc1sgaiBdLnNldmVyaXR5ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2xbIHJlc3VsdExpZ2h0Lm1lc3NhZ2VzWyBqIF0uc2V2ZXJpdHkgXSggcmVzdWx0TGlnaHQubWVzc2FnZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGogXS5tZXNzYWdlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoIHJlc3VsdExpZ2h0Lm1lc3NhZ2VzWyBqIF0ubWVzc2FnZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCAnUnVubmluZyB0ZXN0LWJlbmNoIGZhaWxlZC4nICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKCBudW1DZmdzIDwgMSApIHtcbiAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCAnTm8gc2VsZWN0ZWQgY29uZmlndXJhdGlvbnMhJyApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBudW1DZmdzOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IGNvbmZpZ3VyYXRpb25zWyBpIF07XG4gICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbyggJ1Rlc3QtYmVuY2ggc3RhcnRlZCBvbiAnICsgY29uZmlndXJhdGlvbi5uYW1lICsgJyBbJyArICggaSArIDEgKVxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKSArICcvJyArIG51bUNmZ3MgKyAnXScgKTtcbiAgICAgICAgICAgICAgICBpbnZva2VUZXN0QmVuY2hSdW5uZXIoIGNvbmZpZ3VyYXRpb24gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuXG4gICAgICAgICRzY29wZS5ydW5UZXN0QmVuY2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCggJ2V4cG9zZVNlbGVjdGlvbicgKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlciggY29udGV4dCwgZnVuY3Rpb24gKCBkZXN0cm95ZWQgKSB7XG5cbiAgICAgICAgICAgIGlmICggZGVzdHJveWVkICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyApO1xuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCAnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnICk7XG5cbiAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hOb2RlKCBjb250ZXh0LCAkc2NvcGUudGVzdEJlbmNoSWQsIGZ1bmN0aW9uICggdXBkYXRlT2JqZWN0ICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggdXBkYXRlT2JqZWN0ICk7XG4gICAgICAgICAgICAgICAgaWYgKCB1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oICdMb2FkIHNob3VsZCBub3QgaGFwcGVuJyApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJyApIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoID0gdXBkYXRlT2JqZWN0LmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGlmICggdXBkYXRlT2JqZWN0LnRsc3V0Q2hhbmdlZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCAndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RDaGFuZ2VkJywgJHNjb3BlLmRhdGFNb2RlbHMudGVzdEJlbmNoLnRsc3V0SWQgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJyApIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggJ1Rlc3QgQmVuY2ggd2FzIHJlbW92ZWQhJyApO1xuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCggJy93b3Jrc3BhY2VEZXRhaWxzLycgKyB3b3Jrc3BhY2VJZC5yZXBsYWNlKCAvXFwvL2csICctJyApICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCB1cGRhdGVPYmplY3QgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVscy50ZXN0QmVuY2ggPSBkYXRhLnRlc3RCZW5jaDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBkYXRhLnRlc3RCZW5jaC50bHN1dElkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoICd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdENoYW5nZWQnLCBkYXRhLnRlc3RCZW5jaC50bHN1dElkICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKTtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cblxuYW5ndWxhci5tb2R1bGUoICdDeVBoeUFwcCcgKVxuICAgIC5jb250cm9sbGVyKCAnV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRyb290U2NvcGUsICRzY29wZSwgJHdpbmRvdywgJHN0YXRlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSggLy0vZywgJy8nICk7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInLCB3b3Jrc3BhY2VJZCApO1xuICAgICAgICAkc2NvcGUuZGF0YU1vZGVsID0ge1xuICAgICAgICAgICAgd29ya3NwYWNlSWQ6IHdvcmtzcGFjZUlkXG4gICAgICAgIH07XG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvci5pdGVtcyA9IFsge1xuICAgICAgICAgICAgaWQ6ICdyb290JyxcbiAgICAgICAgICAgIGxhYmVsOiAnQURNRWRpdG9yJyxcbiAgICAgICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnLFxuICAgICAgICAgICAgbWVudTogWyB7XG4gICAgICAgICAgICAgICAgaWQ6ICdlZGl0b3InLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIGVkaXRvcicsXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oICcvP3Byb2plY3Q9QURNRWRpdG9yJywgJ19ibGFuaycgKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge31cbiAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgIH0gXVxuICAgICAgICB9IF07XG4gICAgICAgICRyb290U2NvcGUubWFpbk5hdmlnYXRvci5zZXBhcmF0b3IgPSBmYWxzZTtcbiAgICAgICAgLy9kZWJ1Z2dlcjtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cblxuYW5ndWxhci5tb2R1bGUoICdDeVBoeUFwcCcgKVxuICAgIC5jb250cm9sbGVyKCAnV29ya3NwYWNlc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRyb290U2NvcGUsICR3aW5kb3cgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgY29uc29sZS5sb2coICdXb3Jrc3BhY2VzQ29udHJvbGxlcicgKTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yLml0ZW1zID0gWyB7XG4gICAgICAgICAgICBpZDogJ3Jvb3QnLFxuICAgICAgICAgICAgbGFiZWw6ICdBRE1FZGl0b3InLFxuICAgICAgICAgICAgaXRlbUNsYXNzOiAnY3lwaHktcm9vdCcsXG4gICAgICAgICAgICBtZW51OiBbIHtcbiAgICAgICAgICAgICAgICBpZDogJ2VkaXRvcicsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFsge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW4nLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gZWRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbiggJy8/cHJvamVjdD1BRE1FZGl0b3InLCAnX2JsYW5rJyApO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7fVxuICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgfSBdXG4gICAgICAgIH0gXTtcbiAgICAgICAgJHJvb3RTY29wZS5tYWluTmF2aWdhdG9yLnNlcGFyYXRvciA9IGZhbHNlO1xuICAgIH0gKTsiXX0=
