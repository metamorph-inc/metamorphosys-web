/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

'use strict';

angular.module( 'cyphy.services' )
    .service( 'designLayoutService', function ( $q, $timeout, nodeService, baseCyPhyService, $log ) {

        var self = this,
            watchers,
            typesWithConnectordsInside;

        typesWithConnectordsInside = [
            'AVMComponentModel',
            'Container'
        ];

        $log.debug( 'IN design layout service' );

        watchers = {};

        this.setWireSegments = function ( context, nodeId, segments, msg ) {

            nodeService.loadNode( context, nodeId )
                .then( function ( node ) {
                    node.setRegistry( 'wireSegments', segments, msg );
                } );

        };

        this.setPosition = function ( context, nodeId, position, msg ) {

            nodeService.loadNode( context, nodeId )
                .then( function ( node ) {
                    node.setRegistry( 'position', position, msg );
                } );

        };

        this.setRotation = function ( context, nodeId, angle, msg ) {

            nodeService.loadNode( context, nodeId )
                .then( function ( node ) {
                    node.setRegistry( 'rotation', angle, msg );
                } );

        };

        this.setRotation = function ( context, nodeId, rotation, msg ) {

            nodeService.loadNode( context, nodeId )
                .then( function ( node ) {
                    node.setRegistry( 'rotation', rotation, msg );
                } );

        };

        this.watchDiagramElements = function ( parentContext, containerId, updateListener ) {

            var deferred,
                regionId,
                context,

                data,

                meta,

                onChildUnload,
                onChildUpdate,

                deleteInElementsById,

                getConnectorCompositionDetails,
                parseNewChild,
                findChildForNode,

                triggerUpdateListener;

            deferred = $q.defer();
            regionId = parentContext.regionId + '_watchDiagramElements_' + containerId;
            context = {
                db: parentContext.db,
                regionId: regionId
            };

            data = {
                regionId: regionId,
                elements: {}
            };


            triggerUpdateListener = function ( id, data, eventType, updateType ) {

                $timeout( function () {
                    updateListener( {
                        id: id,
                        type: eventType,
                        updateType: updateType,
                        data: data
                    } );
                } );

            };

            findChildForNode = function ( node ) {

                var baseName,
                    child;

                baseName = node.getMetaTypeName( meta );

                if ( baseName ) {

                    data.elements[ baseName ] = data.elements[ baseName ] || {};
                    child = data.elements[ baseName ][ node.getId() ];
                }

                return child;

            };

            getConnectorCompositionDetails = function ( connectorCompositionNode ) {

                var details,
                    sourcePtr,
                    destinationPtr,

                    sourceId,
                    destinationId,
                    wireSegments;

                sourcePtr = connectorCompositionNode.getPointer( 'src' );
                destinationPtr = connectorCompositionNode.getPointer( 'dst' );
                wireSegments = connectorCompositionNode.getRegistry( 'wireSegments' );

                if ( angular.isObject( sourcePtr ) ) {
                    sourceId = sourcePtr.to;
                }

                if ( angular.isObject( destinationPtr ) ) {
                    destinationId = destinationPtr.to;
                }

                details = {
                    sourceId: sourceId,
                    destinationId: destinationId,
                    wireSegments: wireSegments
                };

                return details;

            };

            onChildUpdate = function () {

                var newName,
                    newDetails,
                    newPos,
                    newRotation,
                    hadChanges,
                    child,
                    updateType;

                // BaseName never changes, does it?

                child = findChildForNode( this );

                if ( child ) {

                    newName = this.getAttribute( 'name' );
                    newPos = this.getRegistry( 'position' );
                    newRotation = this.getRegistry( 'rotation' ) || 0;

                    hadChanges = false;

                    if ( newName !== child.name ) {
                        child.name = newName;
                        hadChanges = true;

                    }

                    if ( newPos.x !== child.position.x || newPos.y !== child.position.y ) {
                        child.position = newPos;

                        hadChanges = true;
                        updateType = 'positionChange';

                    }

                    if ( newRotation !== child.rotation ) {

                        child.rotation = newRotation;

                        hadChanges = true;
                        updateType = 'rotationChange';

                    }

                    if ( child.baseName === 'ConnectorComposition' ) {

                        newDetails = getConnectorCompositionDetails( this );

                        if ( !angular.equals( newDetails, child.details ) ) {

                            child.details = newDetails;
                            hadChanges = true;

                            updateType = 'detailsChange';

                        }

                    }

                    if ( hadChanges ) {

                        triggerUpdateListener( child.id, child, 'update', updateType );

                    }


                }

            };

            deleteInElementsById = function ( id ) {

                angular.forEach( data.elements, function ( category ) {

                    delete category[ id ];

                } );

            };


            onChildUnload = function ( id ) {

                deleteInElementsById( id );

                triggerUpdateListener( id, null, 'unload' );

            };

            parseNewChild = function ( node ) {

                var deferredParseResult,
                    parsePromises,

                    getInterfacesPromise,

                    child;

                deferredParseResult = $q.defer();
                parsePromises = [];

                child = {
                    id: node.getId(),
                    name: node.getAttribute( 'name' ),
                    position: node.getRegistry( 'position' ),
                    rotation: node.getRegistry( 'rotation' ),
                    baseId: node.getBaseId()
                };

                child.baseName = node.getMetaTypeName( meta );

                if ( child.baseName ) {

                    data.elements[ child.baseName ] = data.elements[ child.baseName ] || {};
                    data.elements[ child.baseName ][ child.id ] = child;

                }

                node.onUpdate( onChildUpdate );
                node.onUnload( onChildUnload );


                // Getting connectors from inside where needed

                if ( typesWithConnectordsInside.indexOf( child.baseName ) > -1 ) {

                    getInterfacesPromise = self.watchInterfaces( context, child.id, function ( /*interfaceUpdateData*/) {
                        //TODO: see if anything has to be done with this
                    } );

                    getInterfacesPromise.then( function ( interfaces ) {
                        child.interfaces = interfaces;
                    } );

                    parsePromises.push( getInterfacesPromise );
                }

                if ( child.baseName === 'ConnectorComposition' ) {

                    child.details = getConnectorCompositionDetails( node );
                }


                $q.all( parsePromises )
                    .then( function () {
                        deferredParseResult.resolve( child );
                    } );

                return deferredParseResult.promise;

            };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ regionId ] = context;

            nodeService.getMetaNodes( context )
                .then( function ( metaNodes ) {

                    meta = metaNodes;

                    nodeService.loadNode( context, containerId )

                    .then( function ( rootNode ) {
                        rootNode.loadChildren( context )
                            .then( function ( childNodes ) {

                                var i,
                                    childPromises;

                                childPromises = [];

                                for ( i = 0; i < childNodes.length; i += 1 ) {
                                    childPromises.push( parseNewChild( childNodes[ i ] ) );
                                }

                                rootNode.onNewChildLoaded( function ( newNode ) {

                                    parseNewChild( newNode )
                                        .then( function ( newChild ) {

                                            triggerUpdateListener(
                                                newChild.id,
                                                newChild,
                                                'load',
                                                'newChild'
                                            );
                                        } );

                                } );

                                $q.all( childPromises )
                                    .then( function () {

                                        deferred.resolve( data );
                                    } );

                            } );
                    } );
                } );

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.watchInterfaces.
         */
        this.watchInterfaces = function ( parentContext, id, updateListener ) {
            return baseCyPhyService.watchInterfaces( watchers, parentContext, id, updateListener );
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

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.unregisterWatcher = function ( parentContext ) {
            baseCyPhyService.unregisterWatcher( watchers, parentContext );
        };
    } );
