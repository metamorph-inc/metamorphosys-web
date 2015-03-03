/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module( 'cyphy.components' )
    .controller( 'TestBenchListController', function ( $scope, $window, $location, $modal, growl, testBenchService ) {
        'use strict';
        var
        items = [], // Items that are passed to the item-list ui-component.
            testBenchItems = {}, // Same items are stored in a dictionary.
            serviceData2ListItem,
            config,
            context;

        console.log( 'TestBenchListController' );

        this.getConnectionId = function () {
            return $scope.connectionId;
        };

        // Check for valid connectionId and register clean-up on destroy event.
        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'TestBenchListController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                testBenchService.unregisterWatcher( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }

        // Configuration for the item list ui component.
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
                var newUrl = '/testBench/' + $scope.workspaceId.replace( /\//g, '-' ) + '/' + item.id.replace(
                    /\//g, '-' );
                console.log( newUrl );
                $location.path( newUrl );
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
                        id: 'editTestBench',
                        label: 'Edit',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-pencil',
                        actionData: {
                            id: item.id,
                            description: item.description,
                            name: item.title,
                            files: item.data.files,
                            path: item.data.path,
                            editContext: {
                                db: context.db,
                                regionId: context.regionId + '_watchTestBenches'
                            },
                            testBench: item,
                            modal: $modal
                        },
                        action: testBenchService.editTestBenchFn
                    } ]
                }, {
                    items: [ {
                        id: 'delete',
                        label: 'Delete',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-remove',
                        actionData: {
                            id: item.id,
                            name: item.title,
                            context: context,
                            modal: $modal
                        },
                        action: testBenchService.deleteFn
                    } ]
                } ];
            },

            detailsRenderer: function ( /*item*/) {
                //                item.details = 'My details are here now!';
            },

            filter: {}

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function ( data ) {
            var listItem;

            if ( testBenchItems.hasOwnProperty( data.id ) ) {
                listItem = testBenchItems[ data.id ];
                listItem.title = data.name;
                listItem.description = data.description;
                listItem.data.files = data.files;
                listItem.data.path = data.path;
                listItem.data.results = data.results;
            } else {
                listItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open Test-Bench View',
                    description: data.description,
                    lastUpdated: {
                        time: 'N/A', // TODO: get this in the future.
                        user: 'N/A' // TODO: get this in the future.
                    },
                    stats: [],
                    details: 'Content',
                    detailsTemplateUrl: 'testBenchDetails.html',
                    data: {
                        files: data.files,
                        path: data.path,
                        results: data.results
                    }
                };
                // Add the list-item to the items list and the dictionary.
                items.push( listItem );
                testBenchItems[ listItem.id ] = listItem;
            }
        };

        testBenchService.registerWatcher( context, function ( destroyed ) {
            items = [];
            $scope.listData.items = items;
            testBenchItems = {};

            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'initialize event raised' );

            testBenchService.watchTestBenches( context, $scope.workspaceId, function ( updateObject ) {
                var index;
                //console.warn(updateObject);
                if ( updateObject.type === 'load' ) {
                    serviceData2ListItem( updateObject.data );
                } else if ( updateObject.type === 'update' ) {
                    serviceData2ListItem( updateObject.data );
                } else if ( updateObject.type === 'unload' ) {
                    if ( testBenchItems.hasOwnProperty( updateObject.id ) ) {
                        index = items.map( function ( e ) {
                            return e.id;
                        } )
                            .indexOf( updateObject.id );
                        if ( index > -1 ) {
                            items.splice( index, 1 );
                        }
                        delete testBenchItems[ updateObject.id ];
                    }
                } else {
                    throw new Error( updateObject );
                }
            } )
                .then( function ( data ) {
                    var testBenchId;
                    for ( testBenchId in data.testBenches ) {
                        if ( data.testBenches.hasOwnProperty( testBenchId ) ) {
                            serviceData2ListItem( data.testBenches[ testBenchId ] );
                        }
                    }
                } );
        } );
    } )
    .controller( 'TestBenchEditController', function ( $scope, $modalInstance, growl, data, fileService ) {
        'use strict';
        var fileInfo;
        $scope.data = {
            description: data.description,
            name: data.name,
            fileInfo: {
                hash: data.files,
                name: null,
                url: fileService.getDownloadUrl( data.files )
            },
            path: data.path
        };
        fileInfo = $scope.data.fileInfo;
        if ( fileInfo.hash ) {
            fileService.getMetadata( fileInfo.hash )
                .then( function ( metadata ) {
                    fileInfo.name = metadata.name;
                } )
                .
            catch ( function () {
                console.error( 'Could not get meta-data for hash', fileInfo.hash );
            } );
        }

        $scope.dragOverClass = function ( $event ) {
            var draggedItems = $event.dataTransfer.items,
                hasFile;
            //console.warn(draggedItems);
            hasFile = draggedItems && draggedItems.length === 1 && draggedItems[ 0 ].kind === 'file';

            return hasFile ? 'bg-success dragover' : 'bg-danger dragover';
        };

        $scope.onDroppedFiles = function ( $files ) {
            fileService.saveDroppedFiles( $files, {
                zip: true
            } )
                .then( function ( fInfos ) {
                    if ( fInfos.length !== 1 ) {
                        growl.error( 'One zip file must be dropped!' );
                    } else {
                        fileInfo.name = fInfos[ 0 ].name;
                        fileInfo.url = fInfos[ 0 ].name;
                        fileInfo.hash = fInfos[ 0 ].hash;
                    }
                } );
        };

        $scope.ok = function () {
            $modalInstance.close( $scope.data );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };
    } )
    .directive( 'testBenchList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/TestBenchList.html',
            controller: 'TestBenchListController'
        };
    } );
