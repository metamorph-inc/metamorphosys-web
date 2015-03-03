/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module( 'cyphy.services' )
    .service( 'testBenchService', function ( $q, $timeout, nodeService, baseCyPhyService, pluginService ) {
        'use strict';
        var self = this,
            watchers = {};

        this.editTestBenchFn = function ( data ) {
            var modalInstance = data.modal.open( {
                templateUrl: '/cyphy-components/templates/TestBenchEdit.html',
                controller: 'TestBenchEditController',
                //size: size,
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            } );

            modalInstance.result.then( function ( editedData ) {
                var attrs = {};
                if ( editedData.description !== data.testBench.description ) {
                    attrs.INFO = editedData.description;
                }
                if ( editedData.name !== data.testBench.title ) {
                    attrs.name = editedData.name;
                }
                if ( editedData.fileInfo.hash !== data.testBench.data.files ) {
                    attrs.TestBenchFiles = editedData.fileInfo.hash;
                }
                if ( editedData.path !== data.testBench.data.path ) {
                    attrs.ID = editedData.path;
                }

                self.setTestBenchAttributes( data.editContext, data.id, attrs )
                    .then( function () {
                        console.log( 'Attribute(s) updated' );
                    } );
            }, function () {
                console.log( 'Modal dismissed at: ' + new Date() );
            } );
        };

        this.deleteFn = function ( data ) {
            var modalInstance = data.modal.open( {
                templateUrl: '/cyphy-components/templates/SimpleModal.html',
                controller: 'SimpleModalController',
                resolve: {
                    data: function () {
                        return {
                            title: 'Delete Test Bench',
                            details: 'This will delete ' + data.name + ' from the workspace.'
                        };
                    }
                }
            } );

            modalInstance.result.then( function () {
                self.deleteTestBench( data.context, data.id );
            }, function () {
                console.log( 'Modal dismissed at: ' + new Date() );
            } );
        };

        /**
         * Removes the test bench from the context.
         * @param {object} context - context of controller.
         * @param {string} context.db - data-base connection.
         * @param {string} testBenchId - Path to design-space.
         * @param [msg] - Commit message.
         */
        this.deleteTestBench = function ( context, testBenchId, msg ) {
            var message = msg || 'testBenchService.deleteTestBench ' + testBenchId;
            nodeService.destroyNode( context, testBenchId, message );
        };

        this.exportTestBench = function ( /*testBenchId*/) {
            throw new Error( 'Not implemented.' );
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the test bench.
         * @param {string} context.db - Must exist within watchers and contain the test bench.
         * @param {string} context.regionId - Must exist within watchers and contain the test bench.
         * @param {string} testBenchId - Path to test bench.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setTestBenchAttributes = function ( context, testBenchId, attrs ) {
            return baseCyPhyService.setNodeAttributes( context, testBenchId, attrs );
        };

        this.runTestBench = function ( context, testBenchId, configurationId ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: testBenchId,
                    runOnServer: true,
                    pluginConfig: {
                        run: true,
                        save: true,
                        configurationPath: configurationId
                    }
                };
            //console.log(JSON.stringify(config));
            pluginService.runPlugin( context, 'TestBenchRunner', config )
                .then( function ( result ) {
                    var extendedResult = {
                        success: result.success,
                        messages: result.messages,
                        unparsedResult: result
                    };
                    //console.log( 'Result', result );
                    pluginService.getPluginArtifacts( result.artifacts )
                        .then( function ( artifactsByName ) {
                            extendedResult.artifacts = artifactsByName;
                            deferred.resolve( extendedResult );
                        } );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        this.watchTestBenchNode = function ( parentContext, testBenchId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBench',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    meta: null, // META nodes - needed when creating new nodes...
                    testBench: {} // {id: <string>, name: <string>, description: <string>, node <NodeObj>,
                    //  tlsutId: <string>, path: <string>, results: <string>, file: <string>}
                },
                onUpdate = function ( id ) {
                    var keyToAttr = {
                        name: 'name',
                        description: 'INFO',
                        path: 'ID',
                        results: 'Results',
                        file: 'TestBenchFiles'
                    },
                        newTlsut = this.getPointer( 'TopLevelSystemUnderTest' )
                            .to,
                        tlsutChanged = false,
                        hadChanges = self.checkForAttributeUpdates( data.testBench, this, keyToAttr );

                    if ( newTlsut !== data.testBench.tlsutId ) {
                        data.testBench.tlsutId = newTlsut;
                        hadChanges = true;
                        tlsutChanged = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data.testBench,
                                tlsutChanged: tlsutChanged
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
                    nodeService.loadNode( context, testBenchId )
                        .then( function ( testBenchNode ) {
                            data.meta = meta;
                            data.testBench = {
                                id: testBenchId,
                                name: testBenchNode.getAttribute( 'name' ),
                                description: testBenchNode.getAttribute( 'INFO' ),
                                path: testBenchNode.getAttribute( 'ID' ),
                                results: testBenchNode.getAttribute( 'Results' ),
                                files: testBenchNode.getAttribute( 'TestBenchFiles' ),
                                tlsutId: testBenchNode.getPointer( 'TopLevelSystemUnderTest' )
                                    .to,
                                node: testBenchNode
                            };
                            testBenchNode.onUpdate( onUpdate );
                            testBenchNode.onUnload( onUnload );
                            deferred.resolve( data );
                        } );
                } );

            return deferred.promise;
        };

        /**
         *  Watches all test-benches (existence and their attributes) of a workspace.
         * @param {object} parentContext - context of controller.
         * @param {string} workspaceId - Path to workspace that should be watched.
         * @param {function} updateListener - invoked when there are (filtered) changes in data. Data is an object in data.testBenches.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchTestBenches = function ( parentContext, workspaceId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBenches',
                context = {
                    db: parentContext.db,
                    projectId: parentContext.projectId,
                    branchId: parentContext.branchId,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    testBenches: {} // testBench {id: <string>, name: <string>, description: <string>,
                    //            path: <string>, results: <hash|string>, files: <hash|string> }
                },
                triggerUpdateListener = function ( id, data, eventType ) {
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            data: data,
                            type: eventType
                        } );
                    } );
                },
                addNewTestBench = function ( id, node ) {
                    data.testBenches[ id ] = {
                        id: id,
                        name: node.getAttribute( 'name' ),
                        description: node.getAttribute( 'INFO' ),
                        path: node.getAttribute( 'ID' ),
                        results: node.getAttribute( 'Results' ),
                        files: node.getAttribute( 'TestBenchFiles' )
                    };
                    node.onUnload( onUnload );
                    node.onUpdate( onUpdate );
                },
                onUpdate = function ( id ) {
                    var keyToAttr = {
                        name: 'name',
                        description: 'INFO',
                        path: 'ID',
                        results: 'Results',
                        file: 'TestBenchFiles'
                    },
                        hadChanges = self.checkForAttributeUpdates( data.testBenches[ id ], this, keyToAttr );

                    if ( hadChanges ) {
                        triggerUpdateListener( id, data.testBenches[ id ], 'update' );
                    }
                },
                onUnload = function ( id ) {
                    delete data.testBenches[ id ];
                    triggerUpdateListener( id, null, 'unload' );
                },
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                testBenchId,
                                queueList = [],
                                childNode;
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.byName.ATMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.byName.AVMTestBenchModel ) ) {
                                    testBenchId = childNode.getId();
                                    addNewTestBench( testBenchId, childNode );
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.byName.ATMFolder ) ) {
                                    watchFromFolderRec( newChild, meta );
                                } else if ( newChild.isMetaTypeOf( meta.byName.AVMTestBenchModel ) ) {
                                    testBenchId = newChild.getId();
                                    addNewTestBench( testBenchId, newChild );
                                    triggerUpdateListener( testBenchId, data.testBenches[ testBenchId ],
                                        'load' );
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
                                        if ( childNode.isMetaTypeOf( meta.byName.ATMFolder ) ) {
                                            queueList.push( watchFromFolderRec( childNode, meta ) );
                                        }
                                    }
                                    workspaceNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.byName.ATMFolder ) ) {
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
         *  Watches a test-bench w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param testBenchId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchTestBenchDetails = function ( parentContext, testBenchId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBenchDetails_' + testBenchId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    containerIds: [],
                    tlsut: null
                },
                onUnload = function ( id ) {
                    var index = data.containerIds.indexOf( id );
                    if ( index > -1 ) {
                        data.containerIds.splice( index, 1 );
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'unload',
                                data: data
                            } );
                        } );
                    }
                };
            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, testBenchId )
                        .then( function ( testBenchNode ) {
                            testBenchNode.loadChildren()
                                .then( function ( children ) {
                                    var i;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        if ( children[ i ].isMetaTypeOf( meta.byName.Container ) ) {
                                            data.containerIds.push( children[ i ].getId() );
                                            children[ i ].onUnload( onUnload );
                                        }
                                    }
                                    testBenchNode.onNewChildLoaded( function ( newChild ) {
                                        data.containerIds.push( newChild.getId() );
                                        newChild.onUnload( onUnload );
                                        $timeout( function () {
                                            updateListener( {
                                                id: newChild.getId(),
                                                type: 'load',
                                                data: data
                                            } );
                                        } );
                                    } );
                                    deferred.resolve( data );
                                } );
                        } );
                } );

            return deferred.promise;
        };

        this.checkForAttributeUpdates = function ( data, node, keyToAttr ) {
            return baseCyPhyService.checkForAttributeUpdates( data, node, keyToAttr );
        };

        /**
         *  Watches a test-bench w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param containerId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchInterfaces = function ( parentContext, containerId, updateListener ) {
            return baseCyPhyService.watchInterfaces( watchers, parentContext, containerId, updateListener );
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
