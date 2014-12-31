/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */


angular.module( 'cyphy.services' )
    .service( 'designLayoutService', function ( $q, $timeout, nodeService, baseCyPhyService) {
        'use strict';
        var watchers = {};

        this.watchChildrenPositions = function ( parentContext, containerId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchChildrenPositions_' + containerId,
                data = {
                    regionId: regionId,
                    children: {}
                },
                context = {
                    db: parentContext.db,
                    regionId: regionId
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ regionId ] = context;

            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, containerId )
                        .then( function ( rootNode ) {
                            rootNode.loadChildren( context )
                                .then( function ( childNodes ) {
                                    var i,
                                        childId,
                                        onUpdate = function ( id ) {
                                            var newName = this.getAttribute( 'name' ),
                                                NewPos = this.getRegistry( 'position' ),
                                                hadChanges = false;

                                            if ( newName !== data.children[ id ].name ) {
                                                data.children[ id ].name = newName;
                                                hadChanges = true;
                                            }
//                                            if ( NewPos !== data.children[ id ].position ) {
                                                data.children[ id ].position = NewPos;
                                                hadChanges = true;
                                            //}

                                            if ( hadChanges ) {
                                                $timeout( function () {
                                                    updateListener( {
                                                        id: id,
                                                        type: 'update',
                                                        data: data.children[ id ]
                                                    } );
                                                } );
                                            }
                                        },
                                        onUnload = function ( id ) {
                                            if ( data.children[ id ] ) {
                                                delete data.children[ id ];
                                            }
                                            $timeout( function () {
                                                updateListener( {
                                                    id: id,
                                                    type: 'unload',
                                                    data: null
                                                } );
                                            } );
                                        };

                                    for ( i = 0; i < childNodes.length; i += 1 ) {
                                        childId = childNodes[ i ].getId();
                                        data.children[ childId ] = {
                                            id: childId,
                                            name: childNodes[ i ].getAttribute( 'name' ),
                                            position: childNodes[ i ].getRegistry( 'position' )
                                        };
                                        childNodes[ i ].onUpdate( onUpdate );
                                        childNodes[ i ].onUnload( onUnload );
                                    }

                                    rootNode.onNewChildLoaded( function ( newNode ) {
                                        childId = newNode.getId();
                                        data.children[ childId ] = {
                                            id: childId,
                                            name: newNode.getAttribute( 'name' ),
                                            position: newNode.getRegistry( 'position' )
                                        };
                                        newNode.onUpdate( onUpdate );
                                        newNode.onUnload( onUnload );
                                        $timeout( function () {
                                            updateListener( {
                                                id: childId,
                                                type: 'load',
                                                data: data.children[ childId ]
                                            } );
                                        } );
                                    } );

                                    deferred.resolve( data );
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function ( parentContext ) {
            baseCyPhyService.cleanUpAllRegions( watchers, parentContext );
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function ( parentContext, regionId ) {
            baseCyPhyService.cleanUpRegion( watchers, parentContext, regionId );
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function ( parentContext, fn ) {
            baseCyPhyService.registerWatcher( watchers, parentContext, fn );
        };
    } );