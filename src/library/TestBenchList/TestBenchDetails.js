/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'TestBenchDetailsController', function ( $scope, testBenchService ) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {},
            ports = {},
            watchInterfaces;

        console.log( 'TestBenchDetailsController' );
        $scope.init = function ( connectionId ) {
            $scope.connectionId = connectionId;
            if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'TestBenchDetails_' + ( new Date() )
                        .toISOString()
                };
                $scope.$on( '$destroy', function () {
                    console.log( 'Destroying :', context.regionId );
                    testBenchService.unregisterWatcher( context );
                } );
            } else {
                throw new Error( 'connectionId must be defined and it must be a string' );
            }
            $scope.details = {
                properties: properties,
                connectors: connectors,
                ports: ports
            };
            watchInterfaces = function ( containerId ) {
                testBenchService.watchInterfaces( context, containerId, function ( updateObject ) {
                    // Since watchInterfaces keeps the data up-to-date there shouldn't be a need to do any
                    // updates here..
                    console.log( 'watchInterfaces', updateObject );
                } )
                    .then( function ( containerInterfaces ) {
                        $scope.details.properties = containerInterfaces.properties;
                        $scope.details.connectors = containerInterfaces.connectors;
                        $scope.details.ports = containerInterfaces.ports;
                    } );
            };

            testBenchService.registerWatcher( context, function ( destroy ) {
                $scope.details = {
                    properties: {},
                    connectors: {},
                    ports: {}
                };
                if ( destroy ) {
                    //TODO: notify user
                    return;
                }
                console.info( 'TestBenchDetailsController - initialize event raised' );
                testBenchService.watchTestBenchDetails( context, $scope.testBenchId, function ( updatedObj ) {
                    console.warn( 'watchTestBenchDetails updates', updatedObj );
                } )
                    .then( function ( data ) {
                        if ( data.containerIds.length === 0 ) {
                            console.warn( 'No container defined!' );
                        } else if ( data.containerIds.length === 1 ) {
                            watchInterfaces( data.containerIds[ 0 ] );
                        } else {
                            console.error( 'More than one container defined!' );
                        }
                    } );
            } );
        };
    } )
    .directive( 'testBenchDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                testBenchId: '=testBenchId'
            },
            require: '^testBenchList',
            link: function ( scope, elem, attr, testBenchListController ) {
                var connectionId = testBenchListController.getConnectionId();
                scope.init( connectionId );
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/InterfaceDetails.html',
            controller: 'TestBenchDetailsController'
        };
    } );
