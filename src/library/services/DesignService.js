/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module( 'cyphy.services' )
    .service( 'designService', function ( $q, $timeout, $location, $modal, growl, nodeService, baseCyPhyService,
        pluginService, fileService ) {
        'use strict';
        var self = this,
            watchers = {};

        this.editDesignFn = function ( data ) {
            var modalInstance = $modal.open( {
                templateUrl: '/cyphy-components/templates/DesignEdit.html',
                controller: 'DesignEditController',
                //size: size,
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            } );

            modalInstance.result.then( function ( editedData ) {
                var attrs = {
                    'name': editedData.name,
                    'INFO': editedData.description
                };
                self.setDesignAttributes( data.context, data.id, attrs )
                    .then( function () {
                        console.log( 'Attribute updated' );
                    } );
            }, function () {
                console.log( 'Modal dismissed at: ' + new Date() );
            } );
        };

        this.exportAsAdmFn = function ( data ) {
            self.exportDesign( data.context, data.id )
                .then( function ( downloadUrl ) {
                    growl.success( 'ADM file for <a href="' + downloadUrl + '">' + data.name + '</a> exported.' );
                } )
                .
            catch ( function ( reason ) {
                console.error( reason );
                growl.error( 'Export failed, see console for details.' );
            } );
        };

        this.deleteFn = function ( data ) {
            var modalInstance = $modal.open( {
                templateUrl: '/cyphy-components/templates/SimpleModal.html',
                controller: 'SimpleModalController',
                resolve: {
                    data: function () {
                        return {
                            title: 'Delete Design Space',
                            details: 'This will delete ' + data.name + ' from the workspace.'
                        };
                    }
                }
            } );

            modalInstance.result.then( function () {
                self.deleteDesign( data.context, data.id );
            }, function () {
                console.log( 'Modal dismissed at: ' + new Date() );
            } );
        };

        /**
         * Removes the design from the context.
         * @param {object} context - context of controller.
         * @param {string} context.db - data-base connection.
         * @param {string} designId - Path to design-space.
         * @param [msg] - Commit message.
         */
        this.deleteDesign = function ( context, designId, msg ) {
            var message = msg || 'designService.deleteDesign ' + designId;
            nodeService.destroyNode( context, designId, message );
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the design.
         * @param {string} context.db - Must exist within watchers and contain the design.
         * @param {string} context.regionId - Must exist within watchers and contain the design.
         * @param {string} designId - Path to design-space.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setDesignAttributes = function ( context, designId, attrs ) {
            return baseCyPhyService.setNodeAttributes( context, designId, attrs );
        };

        /**
         * Calls AdmExporter.
         * @param {object} context - Context for plugin.
         * @param {string} context.db - Database connection to pull model from.
         * @param {string} designId
         * @param {string} [desertCfgPath] - Path to configuration if only one is to be exported.
         * @returns {Promise} - resolves to {string} if successful.
         */
        this.exportDesign = function ( context, designId, desertCfgPath ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: designId,
                    runOnServer: false,
                    pluginConfig: {
                        acms: false,
                        desertCfg: desertCfgPath || ''
                    }
                };

            pluginService.runPlugin( context, 'AdmExporter', config )
                .then( function ( result ) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ADM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    if ( result.success ) {
                        console.log( result );
                        deferred.resolve( fileService.getDownloadUrl( result.artifacts[ 0 ] ) );
                    } else {
                        if ( result.error ) {
                            deferred.reject( result.error + ' messages: ' + angular.toJson( result.messages ) );
                        } else {
                            deferred.reject( angular.toJson( result.messages ) );
                        }
                    }
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong ' + reason );
            } );

            return deferred.promise;

        };

        this.generateDashboard = function ( context, designId, resultIds ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: designId,
                    runOnServer: false,
                    pluginConfig: {
                        resultIDs: resultIds.join( ';' )
                    }
                };
            console.log( JSON.stringify( config ) );
            pluginService.runPlugin( context, 'GenerateDashboard', config )
                .then( function ( result ) {
                    var resultLight = {
                        success: result.success,
                        artifactsHtml: '',
                        messages: result.messages
                    };
                    console.log( 'Result', result );
                    pluginService.getPluginArtifactsHtml( result.artifacts )
                        .then( function ( artifactsHtml ) {
                            resultLight.artifactsHtml = artifactsHtml;
                            deferred.resolve( resultLight );
                        } );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        this.watchDesignNode = function ( parentContext, designId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesign',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    meta: null, // META nodes - needed when creating new nodes...
                    design: {} // design {id: <string>, name: <string>, description: <string>, node <NodeObj>}
                },
                onUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        newDesc = this.getAttribute( 'INFO' ),
                        hadChanges = false;
                    if ( newName !== data.design.name ) {
                        data.design.name = newName;
                        hadChanges = true;
                    }
                    if ( newDesc !== data.design.description ) {
                        data.design.description = newDesc;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data.design
                            } );
                        } );
                    }
                },
                onUnload = function ( id ) {
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                };
            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, designId )
                        .then( function ( designNode ) {
                            data.meta = meta;
                            data.design = {
                                id: designId,
                                name: designNode.getAttribute( 'name' ),
                                description: designNode.getAttribute( 'INFO' ),
                                node: designNode
                            };
                            designNode.onUpdate( onUpdate );
                            designNode.onUnload( onUnload );
                            deferred.resolve( data );
                        } );
                } );

            return deferred.promise;
        };

        /**
         *  Watches all containers (existence and their attributes) of a workspace.
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data. Data is an object in data.designs.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesigns = function ( parentContext, workspaceId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesigns',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    designs: {} // design {id: <string>, name: <string>, description: <string>}
                },
                onUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        newDesc = this.getAttribute( 'INFO' ),
                        hadChanges = false;
                    if ( newName !== data.designs[ id ].name ) {
                        data.designs[ id ].name = newName;
                        hadChanges = true;
                    }
                    if ( newDesc !== data.designs[ id ].description ) {
                        data.designs[ id ].description = newDesc;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data.designs[ id ]
                            } );
                        } );
                    }
                },
                onUnload = function ( id ) {
                    delete data.designs[ id ];
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                },
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                designId,
                                queueList = [],
                                childNode;
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.byName.ADMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.byName.Container ) ) {
                                    designId = childNode.getId();
                                    data.designs[ designId ] = {
                                        id: designId,
                                        name: childNode.getAttribute( 'name' ),
                                        description: childNode.getAttribute( 'INFO' )
                                    };
                                    childNode.onUnload( onUnload );
                                    childNode.onUpdate( onUpdate );
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.byName.ADMFolder ) ) {
                                    watchFromFolderRec( newChild, meta );
                                } else if ( newChild.isMetaTypeOf( meta.byName.Container ) ) {
                                    designId = newChild.getId();
                                    data.designs[ designId ] = {
                                        id: designId,
                                        name: newChild.getAttribute( 'name' ),
                                        description: newChild.getAttribute( 'INFO' )
                                    };
                                    newChild.onUnload( onUnload );
                                    newChild.onUpdate( onUpdate );
                                    $timeout( function () {
                                        updateListener( {
                                            id: designId,
                                            type: 'load',
                                            data: data.designs[ designId ]
                                        } );
                                    } );
                                }
                            } );
                            if ( queueList.length === 0 ) {
                                recDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        recDeferred.resolve();
                                    } );
                            }
                        } );

                    return recDeferred.promise;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, workspaceId )
                        .then( function ( workspaceNode ) {
                            workspaceNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.byName.ADMFolder ) ) {
                                            queueList.push( watchFromFolderRec( childNode, meta ) );
                                        }
                                    }
                                    workspaceNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.byName.ADMFolder ) ) {
                                            watchFromFolderRec( newChild, meta );
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
         *  Watches all containers (existence and their attributes) of a workspace.
         * @param {object} parentContext - context of controller.
         * @param {string} designId
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNbrOfConfigurations = function ( parentContext, designId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNbrOfConfigurations_' + designId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    counters: {
                        sets: 0,
                        configurations: 0,
                        results: 0
                    }
                },
                watchConfiguration = function ( cfgNode, meta, wasCreated ) {
                    var cfgDeferred = $q.defer(),
                        resultOnUnload = function ( id ) {
                            data.counters.results -= 1;
                            $timeout( function () {
                                updateListener( {
                                    id: id,
                                    type: 'unload',
                                    data: data
                                } );
                            } );
                        };
                    // Count this set and add an unload handle.
                    data.counters.configurations += 1;
                    if ( wasCreated ) {
                        $timeout( function () {
                            updateListener( {
                                id: cfgNode.getId(),
                                type: 'load',
                                data: data
                            } );
                        } );
                    }
                    cfgNode.onUnload( function ( id ) {
                        data.counters.configurations -= 1;
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'unload',
                                data: data
                            } );
                        } );
                    } );
                    cfgNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                childNode;
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.byName.Result ) ) {
                                    data.counters.results += 1;
                                    childNode.onUnload( resultOnUnload );
                                }
                            }
                            cfgNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.byName.Result ) ) {
                                    data.counters.results += 1;
                                    $timeout( function () {
                                        updateListener( {
                                            id: newChild.getId(),
                                            type: 'load',
                                            data: data
                                        } );
                                    } );
                                    newChild.onUnload( resultOnUnload );
                                }
                            } );
                            cfgDeferred.resolve();
                        } );

                    return cfgDeferred.promise;
                },
                watchConfigurationSet = function ( setNode, meta, wasCreated ) {
                    var setDeferred = $q.defer();
                    // Count this set and add an unload handle.
                    data.counters.sets += 1;
                    if ( wasCreated ) {
                        $timeout( function () {
                            updateListener( {
                                id: setNode.getId(),
                                type: 'load',
                                data: data
                            } );
                        } );
                    }
                    setNode.onUnload( function ( id ) {
                        data.counters.sets -= 1;
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'unload',
                                data: data
                            } );
                        } );
                    } );
                    setNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                queueList = [],
                                childNode;
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.byName.DesertConfiguration ) ) {
                                    queueList.push( watchConfiguration( childNode, meta ) );
                                }
                            }
                            setNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.byName.DesertConfiguration ) ) {
                                    watchConfiguration( newChild, meta, true );
                                }
                            } );
                            if ( queueList.length === 0 ) {
                                setDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        setDeferred.resolve();
                                    } );
                            }
                        } );

                    return setDeferred.promise;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, designId )
                        .then( function ( designNode ) {
                            designNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.byName.DesertConfigurationSet ) ) {
                                            queueList.push( watchConfigurationSet( childNode, meta ) );
                                        }
                                    }
                                    designNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.byName.DesertConfigurationSet ) ) {
                                            watchConfigurationSet( newChild, meta, true );
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
         *  Watches a design(space) w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchInterfaces = function ( parentContext, designId, updateListener ) {
            return baseCyPhyService.watchInterfaces( watchers, parentContext, designId, updateListener );
        };

        /**
         *  Watches the full hierarchy of a design w.r.t. containers and components.
         * @param {object} parentContext - context of controller.
         * @param {string} designId - path to root container.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesignStructure = function ( parentContext, designId ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesignStructure_' + designId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    rootId: designId,
                    containers: {}, // container: {id: <string>, name: <string>, parentId: <string>, type: <string>,
                    //             subContainers: {id:<string>: <container>},
                    //             components:    {id:<string>: <container>}}
                    components: {} // component: {id: <string>, name: <string>, parentId: <string>,
                    //             , avmId: <string> }
                },
                getComponentInfo = function ( node, parentId ) {
                    return {
                        id: node.getId(),
                        name: node.getAttribute( 'name' ),
                        parentId: parentId,
                        avmId: node.getAttribute( 'ID' )
                    };
                },
                watchFromContainerRec = function ( containerNode, rootContainer, meta ) {
                    var recDeferred = $q.defer();
                    containerNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                queueList = [],
                                childNode,
                                container = {
                                    id: containerNode.getId(),
                                    name: containerNode.getAttribute( 'name' ),
                                    type: containerNode.getAttribute( 'Type' ),
                                    subContainers: {},
                                    components: {}
                                },
                                component;

                            rootContainer.subContainers[ containerNode.getId() ] = container;
                            data.containers[ containerNode.getId() ] = container;

                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.byName.Container ) ) {
                                    queueList.push( watchFromContainerRec( childNode, container, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.byName.AVMComponentModel ) ) {
                                    component = getComponentInfo( childNode, container.id );
                                    container.components[ childNode.getId() ] = component;
                                    data.components[ childNode.getId() ] = component;
                                }
                            }

                            //                        containerNode.onNewChildLoaded(function (newChild) {
                            //                            if (newChild.isMetaTypeOf(meta.Container)) {
                            //                                watchFromContainerRec(newChild, container, meta).then(function () {
                            //                                    updateListener({id: newChild.getId(), type: 'load', data: data});
                            //                                });
                            //                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                            //                                container[childNode.getId()] = getComponentInfo(childNode, container.id);
                            //                                updateListener({id: newChild.getId(), type: 'load', data: data});
                            //                            }
                            //                        });

                            if ( queueList.length === 0 ) {
                                recDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        recDeferred.resolve();
                                    } );
                            }
                        } );

                    return recDeferred.promise;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, designId )
                        .then( function ( rootNode ) {
                            rootNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode,
                                        rootContainer = {
                                            id: rootNode.getId(),
                                            name: rootNode.getAttribute( 'name' ),
                                            type: rootNode.getAttribute( 'Type' ),
                                            subContainers: {},
                                            components: {}
                                        },
                                        component;

                                    data.containers[ rootContainer.id ] = rootContainer;
                                    data.containers[ rootContainer.id ] = rootContainer;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.byName.Container ) ) {
                                            queueList.push( watchFromContainerRec( childNode,
                                                rootContainer, meta ) );
                                        } else if ( childNode.isMetaTypeOf( meta.byName.AVMComponentModel ) ) {
                                            component = getComponentInfo( childNode, rootContainer.id );
                                            rootContainer.components[ childNode.getId() ] = component;
                                            data.components[ childNode.getId() ] = component;
                                        }
                                    }
                                    //                            rootNode.onNewChildLoaded(function (newChild) {
                                    //                                if (newChild.isMetaTypeOf(meta.Container)) {
                                    //                                    watchFromContainerRec(newChild, rootContainer, meta).then(function () {
                                    //                                        updateListener({id: newChild.getId(), type: 'load', data: data});
                                    //                                    });
                                    //                                } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                    //                                    rootContainer.components[childNode.getId()] = getComponentInfo(childNode, rootContainer.id);
                                    //                                    updateListener({id: newChild.getId(), type: 'load', data: data});
                                    //                                }
                                    //
                                    //                            });
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
         *  Watches the generated DesertConfigurationSets inside a Design.
         * @param {object} parentContext - context of controller.
         * @param {string} designId - path to design of which to watch.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchConfigurationSets = function ( parentContext, designId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchConfigurationSets_' + designId,
                data = {
                    regionId: regionId,
                    configurationSets: {} //configurationSet {id: <string>, name: <string>, description: <string>}
                },
                context = {
                    db: parentContext.db,
                    regionId: regionId
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, designId )
                        .then( function ( designNode ) {
                            data.name = designNode.getAttribute( 'name' );
                            designNode.loadChildren( context )
                                .then( function ( childNodes ) {
                                    var i,
                                        childId,
                                        onUpdate = function ( id ) {
                                            var newName = this.getAttribute( 'name' );
                                            if ( newName !== data.configurationSets[ id ].name ) {
                                                data.configurationSets[ id ].name = newName;
                                                $timeout( function () {
                                                    updateListener( {
                                                        id: id,
                                                        type: 'update',
                                                        data: data
                                                    } );
                                                } );
                                            }
                                        },
                                        onUnload = function ( id ) {
                                            delete data.configurationSets[ id ];
                                            $timeout( function () {
                                                updateListener( {
                                                    id: id,
                                                    type: 'unload',
                                                    data: data
                                                } );
                                            } );
                                        };
                                    for ( i = 0; i < childNodes.length; i += 1 ) {
                                        if ( childNodes[ i ].isMetaTypeOf( meta.byName.DesertConfigurationSet ) ) {
                                            childId = childNodes[ i ].getId();
                                            data.configurationSets[ childId ] = {
                                                id: childId,
                                                name: childNodes[ i ].getAttribute( 'name' ),
                                                description: childNodes[ i ].getAttribute( 'INFO' )
                                            };
                                            childNodes[ i ].onUpdate( onUpdate );
                                            childNodes[ i ].onUnload( onUnload );
                                        }
                                    }

                                    designNode.onNewChildLoaded( function ( newNode ) {
                                        if ( newNode.isMetaTypeOf( meta.byName.DesertConfigurationSet ) ) {
                                            childId = newNode.getId();
                                            data.configurationSets[ childId ] = {
                                                id: childId,
                                                name: newNode.getAttribute( 'name' ),
                                                description: newNode.getAttribute( 'INFO' )
                                            };
                                            newNode.onUpdate( onUpdate );
                                            newNode.onUnload( onUnload );
                                            $timeout( function () {
                                                updateListener( {
                                                    id: childId,
                                                    type: 'load',
                                                    data: data
                                                } );
                                            } );
                                        }
                                    } );
                                    deferred.resolve( data );
                                } );
                        } );
                } );
            return deferred.promise;
        };

        /**
         *  Watches the generated DesertConfigurations inside a DesertConfigurationSets.
         * @param {object} parentContext - context of controller.
         * @param {string} configurationSetId - path to DesertConfigurationSet of which to watch.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchConfigurations = function ( parentContext, configurationSetId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchConfigurations_' + configurationSetId,
                data = {
                    regionId: regionId,
                    configurations: {} //configuration {id: <string>, name: <string>, alternativeAssignments: <string>}
                },
                context = {
                    db: parentContext.db,
                    regionId: regionId
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ regionId ] = context;

            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, configurationSetId )
                        .then( function ( cfgSetNode ) {
                            cfgSetNode.loadChildren( context )
                                .then( function ( childNodes ) {
                                    var i,
                                        childId,
                                        onUpdate = function ( id ) {
                                            var newName = this.getAttribute( 'name' ),
                                                newAltAss = this.getAttribute( 'AlternativeAssignments' ),
                                                hadChanges = false;

                                            if ( newName !== data.configurations[ id ].name ) {
                                                data.configurations[ id ].name = newName;
                                                hadChanges = true;
                                            }
                                            if ( newAltAss !== data.configurations[ id ].alternativeAssignments ) {
                                                data.configurations[ id ].alternativeAssignments =
                                                    newAltAss;
                                                hadChanges = true;
                                            }

                                            if ( hadChanges ) {
                                                $timeout( function () {
                                                    updateListener( {
                                                        id: id,
                                                        type: 'update',
                                                        data: data.configurations[ id ]
                                                    } );
                                                } );
                                            }
                                        },
                                        onUnload = function ( id ) {
                                            if ( data.configurations[ id ] ) {
                                                delete data.configurations[ id ];
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
                                        if ( childNodes[ i ].isMetaTypeOf( meta.byName.DesertConfiguration ) ) {
                                            data.configurations[ childId ] = {
                                                id: childId,
                                                name: childNodes[ i ].getAttribute( 'name' ),
                                                alternativeAssignments: childNodes[ i ].getAttribute(
                                                    'AlternativeAssignments' )
                                            };
                                            childNodes[ i ].onUpdate( onUpdate );
                                            childNodes[ i ].onUnload( onUnload );
                                        }
                                    }

                                    cfgSetNode.onNewChildLoaded( function ( newNode ) {
                                        if ( newNode.isMetaTypeOf( meta.byName.DesertConfiguration ) ) {
                                            childId = newNode.getId();
                                            data.configurations[ childId ] = {
                                                id: childId,
                                                name: newNode.getAttribute( 'name' ),
                                                alternativeAssignments: newNode.getAttribute(
                                                    'AlternativeAssignments' )
                                            };
                                            newNode.onUpdate( onUpdate );
                                            newNode.onUnload( onUnload );
                                            $timeout( function () {
                                                updateListener( {
                                                    id: childId,
                                                    type: 'load',
                                                    data: data.configurations[ childId ]
                                                } );
                                            } );
                                        }
                                    } );

                                    deferred.resolve( data );
                                } );
                        } );
                } );
            return deferred.promise;
        };

        /**
         *  Watches the generated DesertConfigurationSets inside a Design.
         * @param {object} parentContext - context of controller.
         * @param {object} configuration - Configuration of which to watch.
         * @param {string} configuration.id - path to Configuration of which to watch.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         */
        this.appendWatchResults = function ( parentContext, configuration ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchResults_' + configuration.id,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ regionId ] = context;
            configuration.regionId = regionId;
            configuration.results = {};

            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, configuration.id )
                        .then( function ( cfgNode ) {
                            cfgNode.loadChildren( context )
                                .then( function ( childNodes ) {
                                    var i,
                                        childId,
                                        hasResults = false,
                                        onUnload = function ( id ) {
                                            $timeout( function () {
                                                if ( configuration.results[ id ] ) {
                                                    delete configuration.results[ id ];
                                                }
                                            } );
                                        };
                                    for ( i = 0; i < childNodes.length; i += 1 ) {
                                        childId = childNodes[ i ].getId();
                                        if ( childNodes[ i ].isMetaTypeOf( meta.byName.Result ) ) {
                                            configuration.results[ childId ] = {
                                                id: childId
                                                //name: childNodes[i].getAttribute('name'),
                                            };
                                            //childNodes[i].onUpdate(onUpdate); TODO: When attributes are watch add this.
                                            childNodes[ i ].onUnload( onUnload );
                                            hasResults = true;
                                        }
                                    }

                                    cfgNode.onNewChildLoaded( function ( newNode ) {
                                        if ( newNode.isMetaTypeOf( meta.byName.Result ) ) {
                                            childId = newNode.getId();
                                            $timeout( function () {
                                                configuration.results[ childId ] = {
                                                    id: childId
                                                };
                                            } );
                                        }
                                    } );

                                    deferred.resolve( hasResults );
                                } );
                        } );
                } );

            return deferred.promise;
        };

        this.callSaveDesertConfigurations = function ( context, setName, setDesc, configurations, designId ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: designId,
                    runOnServer: false,
                    pluginConfig: {
                        setData: angular.toJson( {
                            name: setName,
                            description: setDesc || ''
                        } ),
                        configurations: angular.toJson( configurations )
                    }
                };

            pluginService.runPlugin( context, 'SaveDesertConfigurations', config )
                .then( function ( result ) {
                    if ( result.success ) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        /*
        this.saveConfigurationSet = function ( setName, setDesc, configurations, designNode, meta ) {
            var deferred = $q.defer(),
                context = designNode.context;
            nodeService.createNode( context, designNode, meta.DesertConfigurationSet,
                'web-cyphy saveConfigurationSet' )
                .then( function ( setNode ) {
                    var counter = configurations.length,
                        createConfig = function () {
                            var cfgNode;
                            counter -= 1;
                            nodeService.createNode( context, setNode, meta.DesertConfiguration,
                                'web-cyphy saveConfigurationSet' )
                                .then( function ( newNode ) {
                                    var name = configurations[ counter ].name;
                                    cfgNode = newNode;
                                    return cfgNode.setAttribute( 'name', name, 'web-cyphy set name to ' +
                                        name );
                                } )
                                .then( function () {
                                    var aaStr = JSON.stringify( configurations[ counter ].alternativeAssignments );
                                    return cfgNode.setAttribute( 'AlternativeAssignments', aaStr,
                                        'web-cyphy set AlternativeAssignments to ' + aaStr );
                                } )
                                .then( function () {
                                    if ( counter > 0 ) {
                                        createConfig();
                                    } else {
                                        deferred.resolve();
                                    }
                                } )
                                .
                            catch ( function ( reason ) {
                                deferred.reject( 'Problems creating configurations nodes' + reason.toString() );
                            } );

                        };

                    setNode.setAttribute( 'name', setName, 'web-cyphy set name to ' + setName )
                        .then( function () {
                            if ( setDesc ) {
                                setNode.setAttribute( 'INFO', setDesc, 'web-cyphy set INFO to ' + setDesc )
                                    .
                                then( function () {
                                    if ( counter > 0 ) {
                                        createConfig();
                                    } else {
                                        deferred.reject( 'No configurations given!' );
                                    }
                                } );
                            } else {
                                if ( counter > 0 ) {
                                    createConfig();
                                } else {
                                    deferred.reject( 'No configurations given!' );
                                }
                            }
                        } );
                } );

            return deferred.promise;
        };
        */

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
