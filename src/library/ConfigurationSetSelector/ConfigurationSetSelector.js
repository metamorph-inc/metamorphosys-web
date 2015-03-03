/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'ConfigurationSetSelectorController', function ( $scope, growl, designService ) {
        'use strict';
        var context,
            spawnedConfigurationRegions = [];
        $scope.dataModel = {
            dataAvaliable: false,
            configurationSets: {}
        };

        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'ConfigurationSetSelectorController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                designService.unregisterWatcher( context );
                //console.log('$destroyed ' + context.regionId);
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }

        designService.registerWatcher( context, function ( destroyed ) {
            $scope.dataModel.dataAvaliable = false;
            $scope.dataModel.configurationSets = {};

            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }

            designService.watchConfigurationSets( context, $scope.designId, function ( updateObject ) {
                $scope.dataModel.dataAvaliable = Object.keys( updateObject.data.configurationSets )
                    .length > 0;
            } )
                .then( function ( data ) {
                    $scope.dataModel.configurationSets = data.configurationSets;
                    $scope.dataModel.dataAvaliable = Object.keys( data.configurationSets )
                        .length > 0;
                } );
        } );

        $scope.loadConfigurations = function ( setId, setName ) {
            var i;

            for ( i = 0; i < spawnedConfigurationRegions.length; i += 1 ) {
                designService.cleanUpRegion( context, spawnedConfigurationRegions[ i ] );
            }
            spawnedConfigurationRegions = [];
            designService.watchConfigurations( context, setId, function ( updateObject ) {
                console.warn( updateObject );
            } )
                .then( function ( data ) {
                    var key,
                        config,
                        configurations = [];
                    spawnedConfigurationRegions.push( data.regionId );
                    for ( key in data.configurations ) {
                        if ( data.configurations.hasOwnProperty( key ) ) {
                            config = data.configurations[ key ];
                            try {
                                configurations.push( {
                                    id: config.id,
                                    name: config.name,
                                    alternativeAssignments: JSON.parse( config.alternativeAssignments )
                                } );
                            } catch ( error ) {
                                growl.error( 'Configuration ' + config.name + ' had invalid attribute.' );
                                console.error( 'Could not parse', config.alternativeAssignments, error );
                            }
                        }
                    }
                    $scope.$emit( 'configurationsLoaded', {
                        configurations: configurations,
                        setName: setName
                    } );
                } );
        };
    } )
    .directive( 'configurationSetSelector', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                designId: '=designId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ConfigurationSetSelector.html',
            controller: 'ConfigurationSetSelectorController'
        };
    } );
