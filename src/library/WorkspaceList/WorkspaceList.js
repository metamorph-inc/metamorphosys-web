/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module( 'cyphy.components' )
    .controller( 'WorkspaceListController', function ( $scope, $window, $location, $modal, growl, workspaceService,
        fileService ) {
        'use strict';
        var
        items = [],
            workspaceItems = {},
            config,
            context,
            serviceData2ListItem,
            addCountWatchers;

        console.log( 'WorkspaceListController' );

        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'WorkspaceListController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                workspaceService.unregisterWatcher( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }

        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function ( jQEvent, ui ) {
                console.log( 'Sort happened', jQEvent, ui );
            },

            itemClick: function ( event, item ) {
                $location.path( '/workspaceDetails/' + item.id.replace( /\//g, '-' ) );
            },

            itemContextmenuRenderer: function ( e, item ) {
                return [ {
                    items: [ {
                        id: 'openInEditor',
                        label: 'Open in Editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        action: function () {
                            $window.open( '/?project=ADMEditor&activeObject=' + item.id, '_blank' );
                        }
                    }, {
                        id: 'editWorkspace',
                        label: 'Edit',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-pencil',
                        actionData: {
                            id: item.id,
                            description: item.description,
                            name: item.title
                        },
                        action: function ( data ) {
                            var editContext = {
                                db: context.db,
                                regionId: context.regionId + '_watchWorkspaces'
                            },
                                modalInstance = $modal.open( {
                                    templateUrl: '/cyphy-components/templates/WorkspaceEdit.html',
                                    controller: 'WorkspaceEditController',
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
                                workspaceService.setWorkspaceAttributes( editContext, data.id, attrs )
                                    .then( function () {
                                        console.log( 'Attribute updated' );
                                    } );
                            }, function () {
                                console.log( 'Modal dismissed at: ' + new Date() );
                            } );
                        }
                    }, {
                        id: 'exportAsXME',
                        label: 'Export as XME',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-share-alt',
                        actionData: {
                            id: item.id,
                            name: item.title
                        },
                        action: function ( data ) {
                            workspaceService.exportWorkspace( context, data.id )
                                .then( function ( downloadUrl ) {
                                    growl.success( 'Workspace package for <a href="' + downloadUrl +
                                        '">' +
                                        data.name + '</a> exported.' );
                                } )
                                .
                            catch ( function ( reason ) {
                                console.error( reason );
                                growl.error( 'Export failed, see console for details.' );
                            } );
                        }
                    } ]
                }, {
                    items: [ {
                        id: 'delete',
                        label: 'Delete',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-remove',
                        actionData: {
                            id: item.id,
                            name: item.title
                        },
                        action: function ( data ) {
                            var modalInstance = $modal.open( {
                                templateUrl: '/cyphy-components/templates/SimpleModal.html',
                                controller: 'SimpleModalController',
                                resolve: {
                                    data: function () {
                                        return {
                                            title: 'Delete Workspace',
                                            details: 'This will delete ' + data.name +
                                                ' from the project.'
                                        };
                                    }
                                }
                            } );

                            modalInstance.result.then( function () {
                                workspaceService.deleteWorkspace( context, data.id );
                            }, function () {
                                console.log( 'Modal dismissed at: ' + new Date() );
                            } );
                        }
                    } ]
                } ];
            },

            detailsRenderer: function ( /*item*/) {
                //                item.details = 'My details are here now!';
            },

            newItemForm: {
                title: 'Create new workspace',
                itemTemplateUrl: '/cyphy-components/templates/WorkspaceNewItem.html',
                expanded: false,
                controller: function ( $scope ) {
                    $scope.model = {
                        droppedFiles: []
                    };
                    $scope.dragOverClass = function ( $event ) {
                        var draggedItems = $event.dataTransfer.items,
                            i,
                            hasFile = false;
                        //                        console.warn(draggedItems);
                        if ( draggedItems === null ) {
                            hasFile = false;
                        } else {
                            for ( i = 0; i < draggedItems.length; i += 1 ) {
                                if ( draggedItems[ i ].kind === 'file' ) {
                                    hasFile = true;
                                    break;
                                }
                            }
                        }

                        return hasFile ? 'bg-success dragover' : 'bg-danger dragover';
                    };

                    $scope.onDroppedFiles = function ( $files ) {
                        fileService.saveDroppedFiles( $files, {
                            zip: true,
                            adm: true,
                            atm: true
                        } )
                            .then( function ( fInfos ) {
                                var i;
                                console.log( fInfos );
                                for ( i = 0; i < fInfos.length; i += 1 ) {
                                    $scope.model.droppedFiles.push( fInfos[ i ] );
                                }
                            } );
                    };

                    $scope.createItem = function ( newItem ) {
                        var newItemContext = {
                            db: context.db,
                            regionId: context.regionId + '_watchWorkspaces'
                        };
                        if ( !newItem || !newItem.name ) {
                            growl.warning( 'Provide a name' );
                            return;
                        }
                        workspaceService.createWorkspace( newItemContext, newItem.name, newItem.description )
                            .then( function ( folderIds ) {
                                growl.success( newItem.name + ' created.' );
                                if ( $scope.model.droppedFiles.length > 0 ) {
                                    growl.info( 'Importing files..' );
                                    workspaceService.importFiles( newItemContext, folderIds, $scope.model.droppedFiles )
                                        .then( function () {
                                            growl.info( 'Finished importing files!', {
                                                ttl: 100
                                            } );
                                        }, function ( reason ) {
                                            growl.error( reason );
                                        }, function ( info ) {
                                            growl[ info.type ]( info.message );
                                        } )
                                        .
                                    finally( function () {
                                        config.newItemForm.expanded = false;
                                        $scope.model.droppedFiles = [];
                                    } );
                                } else {
                                    config.newItemForm.expanded = false;
                                    $scope.model.droppedFiles = [];
                                }
                            } );
                    };
                }
            },

            filter: {}

        };

        $scope.listData = {
            items: items
        };

        $scope.config = config;

        serviceData2ListItem = function ( data ) {
            var workspaceItem;

            if ( workspaceItems.hasOwnProperty( data.id ) ) {
                workspaceItem = workspaceItems[ data.id ];
                workspaceItem.title = data.name;
                workspaceItem.description = data.description;
            } else {
                workspaceItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open Workspace',
                    description: data.description,
                    lastUpdated: {
                        time: new Date(), // TODO: get this
                        user: 'N/A' // TODO: get this
                    },
                    stats: [ {
                        value: 0,
                        toolTip: 'Components',
                        iconClass: 'fa fa-puzzle-piece'
                    }, {
                        value: 0,
                        toolTip: 'Design Spaces',
                        iconClass: 'fa fa-cubes'
                    }, {
                        value: 0,
                        toolTip: 'Test benches',
                        iconClass: 'glyphicon glyphicon-saved'
                    }, {
                        value: 0,
                        toolTip: 'Requirements',
                        iconClass: 'fa fa-bar-chart-o'
                    } ]
                };

                workspaceItems[ workspaceItem.id ] = workspaceItem;
                items.push( workspaceItem );
            }
        };

        addCountWatchers = function ( workspaceId ) {
            workspaceService.watchNumberOfComponents( context, workspaceId, function ( updateData ) {
                var workspaceData = workspaceItems[ workspaceId ];
                if ( workspaceData ) {
                    workspaceData.stats[ 0 ].value = updateData.data;
                }
            } )
                .then( function ( data ) {
                    var workspaceData = workspaceItems[ workspaceId ];
                    if ( workspaceData ) {
                        workspaceData.stats[ 0 ].value = data.count;
                    }
                } );
            workspaceService.watchNumberOfDesigns( context, workspaceId, function ( updateData ) {
                var workspaceData = workspaceItems[ workspaceId ];
                if ( workspaceData ) {
                    workspaceData.stats[ 1 ].value = updateData.data;
                }
            } )
                .then( function ( data ) {
                    var workspaceData = workspaceItems[ workspaceId ];
                    if ( workspaceData ) {
                        workspaceData.stats[ 1 ].value = data.count;
                    }
                } );
            workspaceService.watchNumberOfTestBenches( context, workspaceId, function ( updateData ) {
                var workspaceData = workspaceItems[ workspaceId ];
                if ( workspaceData ) {
                    workspaceData.stats[ 2 ].value = updateData.data;
                }
            } )
                .then( function ( data ) {
                    var workspaceData = workspaceItems[ workspaceId ];
                    if ( workspaceData ) {
                        workspaceData.stats[ 2 ].value = data.count;
                    }
                } );
        };

        workspaceService.registerWatcher( context, function ( destroyed ) {
            // initialize all variables
            items = [];
            $scope.listData = {
                items: items
            };
            workspaceItems = {};

            if ( destroyed ) {
                console.info( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'WorkspaceListController - initialize event raised' );
            workspaceService.watchWorkspaces( context, function ( updateObject ) {
                var index;

                if ( updateObject.type === 'load' ) {
                    serviceData2ListItem( updateObject.data );
                    addCountWatchers( updateObject.id );

                } else if ( updateObject.type === 'update' ) {
                    serviceData2ListItem( updateObject.data );

                } else if ( updateObject.type === 'unload' ) {
                    if ( workspaceItems.hasOwnProperty( updateObject.id ) ) {
                        index = items.map( function ( e ) {
                            return e.id;
                        } )
                            .indexOf( updateObject.id );
                        if ( index > -1 ) {
                            items.splice( index, 1 );
                        }
                        workspaceService.cleanUpRegion( context, context.regionId +
                            '_watchNumberOfComponents_' + updateObject.id );
                        workspaceService.cleanUpRegion( context, context.regionId +
                            '_watchNumberOfDesigns_' + updateObject.id );
                        workspaceService.cleanUpRegion( context, context.regionId +
                            '_watchNumberOfTestBenches_' + updateObject.id );
                        delete workspaceItems[ updateObject.id ];
                    }

                } else {
                    throw new Error( updateObject );

                }
            } )
                .then( function ( data ) {
                    var workspaceId;

                    for ( workspaceId in data.workspaces ) {
                        if ( data.workspaces.hasOwnProperty( workspaceId ) ) {
                            serviceData2ListItem( data.workspaces[ workspaceId ] );
                            addCountWatchers( workspaceId );
                        }
                    }
                } );
        } );
    } )
    .controller( 'WorkspaceEditController', function ( $scope, $modalInstance, data ) {
        'use strict';
        $scope.data = {
            description: data.description,
            name: data.name
        };

        $scope.ok = function () {
            $modalInstance.close( $scope.data );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };
    } )
    .directive( 'workspaceList', function () {
        'use strict';
        return {
            restrict: 'E',
            replace: true,
            scope: {
                connectionId: '=connectionId'
            },
            templateUrl: '/cyphy-components/templates/WorkspaceList.html',
            controller: 'WorkspaceListController'
        };
    } );
