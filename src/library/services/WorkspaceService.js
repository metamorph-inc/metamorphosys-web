/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module( 'cyphy.services' )
    .service( 'workspaceService', function ( $q, $timeout, nodeService, baseCyPhyService, pluginService, fileService ) {
        'use strict';
        var self = this,
            watchers = {};

        this.callCreateWorkspace = function ( /*context, name, desc*/) {

        };

        this.createWorkspace = function ( context, name, desc ) {
            var deferred = $q.defer(),
                meta;
            nodeService.getMetaNodes( context )
                .then( function ( metaNodes ) {
                    meta = metaNodes;
                    return nodeService.createNode( context, '', meta.byName.WorkSpace,
                        '[WebCyPhy] - WorkspaceService.createWorkspace' );
                } )
                .then( function ( wsNode ) {
                    var acmFolderId,
                        admFolderId,
                        atmFolderId,
                        createFolderNodes = function () {
                            var parentId = wsNode.getId(),
                                baseId = meta.byName.ACMFolder.getId();
                            nodeService.createNode( context, parentId, baseId, '[WebCyPhy] - create ACMFolder' )
                                .then( function ( acmNode ) {
                                    acmFolderId = acmNode.getId();
                                    baseId = meta.byName.ADMFolder.getId();
                                    return nodeService.createNode( context, parentId, baseId,
                                        '[WebCyPhy] - create ADMFolder' );
                                } )
                                .then( function ( admNode ) {
                                    admFolderId = admNode.getId();
                                    baseId = meta.byName.ATMFolder.getId();
                                    return nodeService.createNode( context, parentId, baseId,
                                        '[WebCyPhy] - create ATMFolder' );
                                } )
                                .then( function ( atmNode ) {
                                    atmFolderId = atmNode.getId();
                                    deferred.resolve( {
                                        acm: acmFolderId,
                                        adm: admFolderId,
                                        atm: atmFolderId
                                    } );
                                } )
                                .
                            catch ( function ( reason ) {
                                deferred.reject( reason );
                            } );
                        };

                    wsNode.setAttribute( 'name', name, '[WebCyPhy] - set name to ' + name );
                    if ( desc ) {
                        wsNode.setAttribute( 'INFO', desc, '[WebCyPhy] - set INFO to ' + desc );
                    }
                    createFolderNodes();
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( reason );
            } );

            return deferred.promise;
        };

        this.importFiles = function ( context, folderIds, files ) {
            var deferred = $q.defer(),
                i,
                counter,
                total,
                fs = {
                    acms: [],
                    adms: [],
                    atms: []
                },
                importAcmRec,
                importAdmRec,
                importAtmRec,
                getNotify;

            importAcmRec = function () {
                counter -= 1;
                if ( counter >= 0 ) {
                    self.callAcmImporter( context, folderIds.acm, fs.acms[ counter ] )
                        .then( getNotify( fs.acms[ counter ], 'acm' ), getNotify( fs.acms[ counter ] ), 'acm' );
                } else {
                    total = fs.adms.length;
                    counter = total;
                    importAdmRec();
                }
            };
            importAdmRec = function () {
                counter -= 1;
                if ( counter >= 0 ) {
                    self.callAdmImporter( context, folderIds.adm, fs.adms[ counter ] )
                        .then( getNotify( fs.adms[ counter ], 'adm' ), getNotify( fs.adms[ counter ] ), 'adm' );
                } else {
                    total = fs.atms.length;
                    counter = total;
                    importAtmRec();
                }
            };
            importAtmRec = function () {
                counter -= 1;
                if ( counter >= 0 ) {
                    self.callAtmImporter( context, folderIds.atm, fs.atms[ counter ] )
                        .then( getNotify( fs.atms[ counter ], 'atm' ), getNotify( fs.atms[ counter ], 'atm' ) );
                } else {
                    deferred.resolve();
                }
            };
            getNotify = function ( fInfo, type ) {
                return function ( result ) {
                    if ( angular.isString( result ) === false && result.success === true ) {
                        deferred.notify( {
                            type: 'success',
                            message: '<a href="' + fInfo.url + '">' + fInfo.name +
                                '</a>' + ' imported. ' + '[' + ( total - counter ) + '/' + total + ']'
                        } );
                    } else {
                        deferred.notify( {
                            type: 'error',
                            message: '<a href="' + fInfo.url + '">' + fInfo.name +
                                '</a>' + ' failed to be imported, see console details.' +
                                '[' + ( total - counter ) + '/' + total + ']'
                        } );
                        if ( angular.isString( result ) ) {
                            console.error( result );
                        } else {
                            console.error( angular.toJson( result.messages, true ) );
                        }
                    }
                    if ( type === 'acm' ) {
                        importAcmRec();
                    } else if ( type === 'adm' ) {
                        importAdmRec();
                    } else if ( type === 'atm' ) {
                        importAtmRec();
                    } else {
                        deferred.reject( 'Unexpected import type ' + type );
                    }
                };
            };
            // hash: "3636ead0785ca166f3b11193c4b2e5a670801eb1" name: "Damper.zip" size: "1.4 kB" type: "zip"
            // url: "/rest/blob/download/3636ead0785ca166f3b11193c4b2e5a670801eb1"
            for ( i = 0; i < files.length; i += 1 ) {
                if ( files[ i ].type === 'zip' ) {
                    fs.acms.push( files[ i ] );
                } else if ( files[ i ].type === 'adm' ) {
                    fs.adms.push( files[ i ] );
                } else if ( files[ i ].type === 'atm' ) {
                    fs.atms.push( files[ i ] );
                }
            }

            total = fs.acms.length;
            counter = total;
            importAcmRec();

            return deferred.promise;
        };

        this.callAcmImporter = function ( context, folderId, fileInfo ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: folderId,
                    runOnServer: false,
                    pluginConfig: {
                        UploadedFile: fileInfo.hash,
                        DeleteExisting: true
                    }
                };

            pluginService.runPlugin( context, 'AcmImporter', config )
                .then( function ( result ) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ACM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    deferred.resolve( result );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        this.callAdmImporter = function ( context, folderId, fileInfo ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: folderId,
                    runOnServer: false,
                    pluginConfig: {
                        admFile: fileInfo.hash
                    }
                };

            pluginService.runPlugin( context, 'AdmImporter', config )
                .then( function ( result ) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ADM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    deferred.resolve( result );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        this.callAtmImporter = function ( context, folderId, fileInfo ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: folderId,
                    runOnServer: false,
                    pluginConfig: {
                        atmFile: fileInfo.hash
                    }
                };

            pluginService.runPlugin( context, 'AtmImporter', config )
                .then( function ( result ) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ATM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    deferred.resolve( result );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        /**
         * Calls ExportWorkspace.
         * @param {object} context - Context for plugin.
         * @param {string} context.db - Database connection to pull model from.
         * @param {string} workspaceId
         * @returns {Promise} - resolves to download url if successful.
         */
        this.exportWorkspace = function ( context, workspaceId ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: workspaceId,
                    runOnServer: false,
                    pluginConfig: {}
                };

            pluginService.runPlugin( context, 'ExportWorkspace', config )
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

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the design.
         * @param {string} context.db - Must exist within watchers and contain the design.
         * @param {string} context.regionId - Must exist within watchers and contain the design.
         * @param {string} workspaceId - Path to workspace.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setWorkspaceAttributes = function ( context, workspaceId, attrs ) {
            return baseCyPhyService.setNodeAttributes( context, workspaceId, attrs );
        };

        /**
         * Removes the workspace from the context.
         * @param {object} context - context of controller.
         * @param {string} context.db - data-base connection.
         * @param {string} workspaceId - Path to workspace.
         * @param [msg] - Commit message.
         */
        this.deleteWorkspace = function ( context, workspaceId, msg ) {
            var message = msg || 'WorkspaceService.deleteWorkspace ' + workspaceId;
            nodeService.destroyNode( context, workspaceId, message );
        };

        // TODO: make sure the methods below gets resolved at error too.
        /**
         * Keeps track of the work-spaces defined in the root-node w.r.t. existence and attributes.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} parentContext.db - data-base connection.
         * @param {string} parentContext.regionId - regionId (of group).
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is an object in data.workspaces.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchWorkspaces = function ( parentContext, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchWorkspaces',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    workspaces: {} // workspace = {id: <string>, name: <string>, description: <string>}
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
                addNewWorkspace = function ( id, node ) {
                    data.workspaces[ id ] = {
                        id: id,
                        name: node.getAttribute( 'name' ),
                        description: node.getAttribute( 'INFO' )
                    };
                    node.onUpdate( onUpdate );
                    node.onUnload( onUnload );
                },
                onUpdate = function ( id ) {
                    var keyToAttr = {
                        name: 'name',
                        description: 'INFO'
                    },
                        hadChanges = self.checkForAttributeUpdates( data.workspaces[ id ], this, keyToAttr );

                    if ( hadChanges ) {
                        triggerUpdateListener( id, data.workspaces[ id ], 'update' );
                    }
                },
                onUnload = function ( id ) {
                    delete data.workspaces[ id ];
                    triggerUpdateListener( id, null, 'unload' );
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, '' )
                        .then( function ( rootNode ) {
                            rootNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        childNode,
                                        wsId;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.byName.WorkSpace ) ) {
                                            wsId = childNode.getId();
                                            addNewWorkspace( wsId, childNode );
                                        }
                                    }
                                    rootNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.byName.WorkSpace ) ) {
                                            wsId = newChild.getId();
                                            addNewWorkspace( wsId, newChild );
                                            triggerUpdateListener( wsId, data.workspaces[ wsId ],
                                                'load' );
                                        }
                                    } );
                                    deferred.resolve( data );
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         * Keeps track of the number of components (defined in ACMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfComponents = function ( parentContext, workspaceId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNumberOfComponents_' + workspaceId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    count: 0
                },
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                queueList = [],
                                childNode,
                                onUnload = function ( id ) {
                                    data.count -= 1;
                                    $timeout( function () {
                                        updateListener( {
                                            id: id,
                                            type: 'unload',
                                            data: data.count
                                        } );
                                    } );
                                };
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.byName.ACMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.byName.AVMComponentModel ) ) {
                                    data.count += 1;
                                    childNode.onUnload( onUnload );
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.byName.ACMFolder ) ) {
                                    watchFromFolderRec( newChild, meta )
                                        .then( function () {
                                            $timeout( function () {
                                                updateListener( {
                                                    id: newChild.getId(),
                                                    type: 'load',
                                                    data: data.count
                                                } );
                                            } );
                                        } );
                                } else if ( newChild.isMetaTypeOf( meta.byName.AVMComponentModel ) ) {
                                    data.count += 1;
                                    newChild.onUnload( onUnload );
                                    $timeout( function () {
                                        updateListener( {
                                            id: newChild.getId(),
                                            type: 'load',
                                            data: data.count
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
                                        if ( childNode.isMetaTypeOf( meta.byName.ACMFolder ) ) {
                                            queueList.push( watchFromFolderRec( childNode, meta ) );
                                        }
                                    }
                                    workspaceNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.byName.ACMFolder ) ) {
                                            watchFromFolderRec( newChild, meta )
                                                .then( function () {
                                                    $timeout( function () {
                                                        updateListener( {
                                                            id: newChild.getId(),
                                                            type: 'load',
                                                            data: data.count
                                                        } );
                                                    } );
                                                } );
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
         * Keeps track of the number of containers (defined in ADMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfDesigns = function ( parentContext, workspaceId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNumberOfDesigns_' + workspaceId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    count: 0
                },
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                queueList = [],
                                childNode,
                                onUnload = function ( id ) {
                                    data.count -= 1;
                                    $timeout( function () {
                                        updateListener( {
                                            id: id,
                                            type: 'unload',
                                            data: data.count
                                        } );
                                    } );
                                };
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.byName.ADMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.byName.Container ) ) {
                                    data.count += 1;
                                    childNode.onUnload( onUnload );
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.byName.ADMFolder ) ) {
                                    watchFromFolderRec( newChild, meta )
                                        .then( function () {
                                            $timeout( function () {
                                                updateListener( {
                                                    id: newChild.getId(),
                                                    type: 'load',
                                                    data: data.count
                                                } );
                                            } );
                                        } );
                                } else if ( newChild.isMetaTypeOf( meta.byName.Container ) ) {
                                    data.count += 1;
                                    newChild.onUnload( onUnload );
                                    $timeout( function () {
                                        updateListener( {
                                            id: newChild.getId(),
                                            type: 'load',
                                            data: data.count
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

            if ( watchers.hasOwnProperty( parentContext.regionId ) === false ) {
                console.error( parentContext.regionId + ' is not a registered watcher! ' +
                    'Use "this.registerWatcher" before trying to access Node Objects.' );
            }
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
                                            watchFromFolderRec( newChild, meta )
                                                .then( function () {
                                                    $timeout( function () {
                                                        updateListener( {
                                                            id: newChild.getId(),
                                                            type: 'load',
                                                            data: data.count
                                                        } );
                                                    } );
                                                } );
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
         * Keeps track of the number of test-benches (defined in ATMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfTestBenches = function ( parentContext, workspaceId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNumberOfTestBenches_' + workspaceId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    count: 0
                },
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                queueList = [],
                                childNode,
                                onUnload = function ( id ) {
                                    data.count -= 1;
                                    $timeout( function () {
                                        updateListener( {
                                            id: id,
                                            type: 'unload',
                                            data: data.count
                                        } );
                                    } );
                                };
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.byName.ATMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.byName.AVMTestBenchModel ) ) {
                                    data.count += 1;
                                    childNode.onUnload( onUnload );
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.byName.ATMFolder ) ) {
                                    watchFromFolderRec( newChild, meta )
                                        .then( function () {
                                            $timeout( function () {
                                                updateListener( {
                                                    id: newChild.getId(),
                                                    type: 'load',
                                                    data: data.count
                                                } );
                                            } );
                                        } );
                                } else if ( newChild.isMetaTypeOf( meta.byName.AVMTestBenchModel ) ) {
                                    data.count += 1;
                                    newChild.onUnload( onUnload );
                                    $timeout( function () {
                                        updateListener( {
                                            id: newChild.getId(),
                                            type: 'load',
                                            data: data.count
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
                                        if ( childNode.isMetaTypeOf( meta.byName.ATMFolder ) ) {
                                            queueList.push( watchFromFolderRec( childNode, meta ) );
                                        }
                                    }
                                    workspaceNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.byName.ATMFolder ) ) {
                                            watchFromFolderRec( newChild, meta )
                                                .then( function () {
                                                    $timeout( function () {
                                                        updateListener( {
                                                            id: newChild.getId(),
                                                            type: 'load',
                                                            data: data.count
                                                        } );
                                                    } );
                                                } );
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

        this.checkForAttributeUpdates = function ( data, node, keyToAttr ) {
            return baseCyPhyService.checkForAttributeUpdates( data, node, keyToAttr );
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

        this.logContext = function ( context ) {
            nodeService.logContext( context );
        };
    } );
