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
