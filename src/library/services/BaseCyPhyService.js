/*globals angular, console*/

/**
 * This service contains functionality shared amongst the different services. It should not be used
 * directly in a controller - only as part of other services.
 *
 * @author pmeijer / https://github.com/pmeijer
 */


angular.module( 'cyphy.services' )
    .service( 'baseCyPhyService', function ( $q, $timeout, nodeService ) {
        'use strict';
        var self = this;
        /**
         * Registers a watcher (controller) to the service. Callback function is called when nodes become available or
         * when they became unavailable. These are also called directly with the state of the nodeService.
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.db - Database connection.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         * @param {function} fn - Called with true when there are no nodes unavailable and false when there are.
         */
        this.registerWatcher = function ( watchers, parentContext, fn ) {
            nodeService.on( parentContext, 'initialize', function () {
                // This should be enough, the regions will be cleaned up in nodeService.
                watchers[ parentContext.regionId ] = {};
                fn( false );
            } );
            nodeService.on( parentContext, 'destroy', function () {
                watchers[ parentContext.regionId ] = {};
                fn( true );
            } );
        };

        /**
         * Unregisters the watchers spawned from parentContext, this should typically be invoked when the controller is destroyed.
         * @param {object} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         */
        this.unregisterWatcher = function ( watchers, parentContext ) {
            var childWatchers,
                key,
                success;
            if ( watchers[ parentContext.regionId ] ) {
                childWatchers = watchers[ parentContext.regionId ];
                for ( key in childWatchers ) {
                    if ( childWatchers.hasOwnProperty( key ) ) {
                        nodeService.cleanUpRegion( childWatchers[ key ].db, childWatchers[ key ].regionId );
                    }
                }
                delete watchers[ parentContext.regionId ];
            } else {
                console.log( 'Nothing to clean-up..' );
            }
            success = nodeService.off(parentContext, 'initialize');
            if (success !== true) {
                console.error(success.msg);
            }
            success = nodeService.off(parentContext, 'destroy');
            if (success !== true) {
                console.error(success.msg);
            }
        };

        /**
         * Removes specified watcher (regionId)
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.db - Database connection of both parent and region to be deleted.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         * @param {string} regionId - Region id of the spawned region that should be deleted.
         */
        this.cleanUpRegion = function ( watchers, parentContext, regionId ) {
            if ( watchers[ parentContext.regionId ] ) {
                if ( watchers[ parentContext.regionId ][ regionId ] ) {
                    nodeService.cleanUpRegion( parentContext.db, regionId );
                    delete watchers[ parentContext.regionId ][ regionId ];
                } else {
                    console.log( 'Nothing to clean-up..' );
                }
            } else {
                console.log( 'Cannot clean-up region since parentContext is not registered..', parentContext );
            }
        };

        /**
         * Updates the given attributes of a node.
         * @param {object} context - Must exist within watchers and contain the component.
         * @param {string} context.db - Must exist within watchers and contain the component.
         * @param {string} context.regionId - Must exist within watchers and contain the component.
         * @param {string} id - Path to node.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setNodeAttributes = function ( context, id, attrs ) {
            var deferred = $q.defer();
            if ( Object.keys( attrs )
                .length === 0 ) {
                console.log( 'no attribute to update' );
                deferred.resolve();
            }
            nodeService.loadNode( context, id )
                .then( function ( nodeObj ) {
                    var keys = Object.keys( attrs ),
                        counter = keys.length,
                        setAttr = function () {
                            counter -= 1;
                            nodeObj.setAttribute( keys[ counter ], attrs[ keys[ counter ] ],
                                'webCyPhy - setNodeAttributes' );
                            if ( counter <= 0 ) {
                                deferred.resolve();
                            } else {
                                setAttr();
                            }
                        };
                    setAttr();
                } );

            return deferred.promise;
        };

        /** TODO: Watch domainPorts inside Connectors
         *  Watches the interfaces (Properties, Connectors and DomainPorts) of a model.
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} id - Path to model.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchInterfaces = function ( watchers, parentContext, id, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchInterfaces_' + id,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    id: id,
                    properties: {}, //property:  {id: <string>, name: <string>, dataType: <string>, valueType <string>, derived <boolean>}
                    connectors: {}, //connector: {id: <string>, name: <string>, domainPorts: <object> }
                    ports: {} //port:      {id: <string>, name: <string>, type: <string>, class: <string> }
                },
                triggerUpdateListener = function ( id, data, eventType ) {
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: eventType,
                            data: data
                        } );
                    } );
                },
                addNewProperty = function ( id, node ) {
                    data.properties[ id ] = {
                        id: id,
                        name: node.getAttribute( 'name' ),
                        dataType: node.getAttribute( 'DataType' ),
                        valueType: node.getAttribute( 'ValueType' ),
                        value: node.getAttribute( 'Value' ),
                        unit: node.getAttribute( 'Unit' ),
                        isProminent: node.getAttribute( 'IsProminent' ),

                        derived: isPropertyDerived( node )
                    };
                    node.onUpdate( onPropertyUpdate );
                    node.onUnload( onPropertyUnload );
                },
                onPropertyUpdate = function ( id ) {
                    var keyToAttr = {
                        name: 'name',
                        dataType: 'DataType',
                        valueType: 'ValueType',
                        value: 'Value',
                        unit: 'Unit',
                        isProminent: 'IsProminent'
                    },
                        newDerived = isPropertyDerived( this ),
                        hadChanges = self.checkForAttributeUpdates( data.properties[ id ], this, keyToAttr );

                    if ( newDerived !== data.properties[ id ].derived ) {
                        data.properties[ id ].derived = newDerived;
                        hadChanges = true;
                    }

                    if ( hadChanges ) {
                        triggerUpdateListener( id, data, 'update' );
                    }
                },
                onPropertyUnload = function ( id ) {
                    delete data.properties[ id ];
                    triggerUpdateListener( id, null, 'unload' );
                },
                addNewConnector = function ( id, node ) {
                    data.connectors[ id ] = {
                        id: id,
                        name: node.getAttribute( 'name' ),
                        position: node.getRegistry( 'position' ),
                        domainPorts: {}
                    };
                    node.onUpdate( onConnectorUpdate );
                    node.onUnload( onConnectorUnload );
                    ///queueList.push(childNode.loadChildren(childNode));
                },
                onConnectorUpdate = function ( id ) {

                    var connector,

                        newName,
                        newPos,

                        hadChanges;

                    hadChanges = false;

                    connector = data.connectors[ id ];

                    newName = this.getAttribute( 'name' );
                    newPos = this.getRegistry( 'position' );


                    if ( newName !== connector.name ) {
                        connector.name = newName;
                        hadChanges = true;
                    }

                    if ( newPos.x !== connector.position.x || newPos.y !== connector.position.y ) {
                        connector.position = newPos;
                        hadChanges = true;
                    }

                    if ( hadChanges ) {
                        triggerUpdateListener( id, data, 'update' );
                    }
                },
                onConnectorUnload = function ( id ) {
                    delete data.connectors[ id ];
                    triggerUpdateListener( id, null, 'unload' );
                },
                addNewPort = function ( id, node ) {
                    data.ports[ id ] = {
                        id: id,
                        name: node.getAttribute( 'name' ),
                        type: node.getAttribute( 'Type' ),
                        class: node.getAttribute( 'Class' )
                    };
                    node.onUpdate( onPortUpdate );
                    node.onUnload( onPortUnload );
                },
                onPortUpdate = function ( id ) {
                    var keyToAttr = {
                        name: 'name',
                        type: 'Type',
                        class: 'Class'
                    },
                        hadChanges = self.checkForAttributeUpdates( data.ports[ id ], this, keyToAttr );

                    if ( hadChanges ) {
                        triggerUpdateListener( id, data, 'update' );
                    }
                },
                onPortUnload = function ( id ) {
                    delete data.ports[ id ];
                    triggerUpdateListener( id, null, 'unload' );
                },
                isPropertyDerived = function ( node ) {
                    return node.getCollectionPaths( 'dst' )
                        .length > 0;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, id )
                        .then( function ( modelNode ) {
                            modelNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        childId,
                                        metaName,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        childId = childNode.getId();
                                        metaName = childNode.getMetaTypeName( meta );
                                        if ( metaName === 'Property' ) {
                                            addNewProperty( childId, childNode );
                                        } else if ( metaName === 'Connector' ) {
                                            addNewConnector( childId, childNode );
                                        } else if ( metaName === 'DomainPort' ) {
                                            addNewPort( childId, childNode );
                                        }
                                    }
                                    modelNode.onNewChildLoaded( function ( newChild ) {
                                        childId = newChild.getId();
                                        metaName = newChild.getMetaTypeName( meta );
                                        if ( metaName === 'Property' ) {
                                            addNewProperty( childId, newChild );
                                            triggerUpdateListener( childId, data, 'load' );
                                        } else if ( metaName === 'Connector' ) {
                                            addNewConnector( childId, newChild );
                                            triggerUpdateListener( childId, data, 'load' );
                                        } else if ( metaName === 'DomainPort' ) {
                                            addNewPort( childId, newChild );
                                            triggerUpdateListener( childId, data, 'load' );
                                        }
                                    } );

                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         * Checks and updates the values in data with the new attribute values in node.
         * @param {Object} data - Where the attribute values are stored.
         * @param {NodeObj} node - Node that had update events.
         * @param {Object} keyToAttr - Maps the key in data to the attribute string.
         * @returns {boolean} - True if there were any changes.
         */
        this.checkForAttributeUpdates = function ( data, node, keyToAttr ) {
            var key,
                newAttr,
                hadChanges = false;
            for ( key in keyToAttr ) {
                if ( keyToAttr.hasOwnProperty( key ) ) {
                    newAttr = node.getAttribute( keyToAttr[ key ] );
                    if ( newAttr !== data[ key ] ) {
                        data[ key ] = newAttr;
                        hadChanges = true;
                    }
                }
            }
            return hadChanges;
        };
    } );
