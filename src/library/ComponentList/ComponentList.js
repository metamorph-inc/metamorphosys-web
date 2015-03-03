/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module( 'cyphy.components' )
    .controller( 'ComponentListController', function ( $scope, $window, $modal, growl, componentService, fileService ) {
        'use strict';
        var
        items = [], // Items that are passed to the item-list ui-component.
            componentItems = {}, // Same items are stored in a dictionary.
            serviceData2ListItem,
            addDomainWatcher,
            config,
            context;

        console.log( 'ComponentListController', $scope.avmIds );
        this.getConnectionId = function () {
            return $scope.connectionId;
        };
        // Check for valid connectionId and register clean-up on destroy event.
        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'ComponentListController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                componentService.unregisterWatcher( context );
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
                $scope.$emit( 'selectedInstances', {
                    name: item.title,
                    ids: item.data.instanceIds
                } );
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
                        id: 'editComponent',
                        label: 'Edit',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-pencil',
                        actionData: {
                            description: item.description,
                            id: item.id
                        },
                        action: function ( data ) {
                            var editContext = {
                                db: context.db,
                                regionId: context.regionId + '_watchComponents'
                            },
                                modalInstance = $modal.open( {
                                    templateUrl: '/cyphy-components/templates/ComponentEdit.html',
                                    controller: 'ComponentEditController',
                                    //size: size,
                                    resolve: {
                                        data: function () {
                                            return data;
                                        }
                                    }
                                } );

                            modalInstance.result.then( function ( editedData ) {
                                var attrs = {
                                    'INFO': editedData.description
                                };
                                componentService.setComponentAttributes( editContext, data.id, attrs )
                                    .then( function () {
                                        console.log( 'Attribute updated' );
                                    } );
                            }, function () {
                                console.log( 'Modal dismissed at: ' + new Date() );
                            } );
                        }
                    }, {
                        id: 'exportAsAcm',
                        label: 'Export ACM',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-share-alt',
                        actionData: {
                            resource: item.data.resource,
                            name: item.title
                        },
                        action: function ( data ) {
                            var hash = data.resource,
                                url = fileService.getDownloadUrl( hash );
                            if ( url ) {
                                growl.success( 'ACM file for <a href="' + url + '">' + data.name +
                                    '</a> exported.' );
                            } else {
                                growl.warning( data.name + ' does not have a resource.' );
                            }
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
                                            title: 'Delete Component',
                                            details: 'This will delete ' + data.name +
                                                ' from the workspace.'
                                        };
                                    }
                                }
                            } );

                            modalInstance.result.then( function () {
                                componentService.deleteComponent( context, data.id );
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

            filter: {}

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function ( data ) {
            var listItem;

            if ( componentItems.hasOwnProperty( data.id ) ) {
                listItem = componentItems[ data.id ];
                listItem.title = data.name;
                listItem.description = data.description;
                listItem.data.resource = data.resource;
            } else {
                listItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: $scope.avmIds ? 'Highlight instances' : '',
                    description: data.description,
                    lastUpdated: {
                        time: 'N/A', // TODO: get this in the future.
                        user: 'N/A' // TODO: get this in the future.
                    },
                    stats: [],
                    details: 'Content',
                    detailsTemplateUrl: 'componentDetails.html',
                    data: {
                        resource: data.resource
                    }
                };
                if ( $scope.avmIds ) {
                    listItem.data.instanceIds = $scope.avmIds[ data.avmId ];
                }
                // Add the list-item to the items list and the dictionary.
                items.push( listItem );
                componentItems[ listItem.id ] = listItem;
            }
        };

        addDomainWatcher = function ( componentId ) {
            var domainModelsToStat = function ( domainModels ) {
                var stats = [],
                    labelMap = {
                        CAD: {
                            value: 0,
                            toolTip: 'CAD',
                            iconClass: 'fa fa-codepen'
                        },
                        Cyber: {
                            value: 0,
                            toolTip: 'Cyber',
                            iconClass: 'fa fa-laptop'
                        },
                        Manufacturing: {
                            value: 0,
                            toolTip: 'Manufacturing',
                            iconClass: 'fa fa-wrench'
                        },
                        Modelica: {
                            value: 0,
                            toolTip: 'Modelica',
                            iconClass: 'fa fa-gears'
                        }
                    },
                    key;
                for ( key in domainModels ) {
                    if ( domainModels.hasOwnProperty( key ) ) {
                        if ( labelMap[ domainModels[ key ].type ] ) {
                            labelMap[ domainModels[ key ].type ].value += 1;
                        } else {
                            console.error( 'Unexpected domain-model type', domainModels[ key ].type );
                        }
                    }
                }
                for ( key in labelMap ) {
                    if ( labelMap.hasOwnProperty( key ) ) {
                        if ( labelMap[ key ].value > 0 ) {
                            stats.push( labelMap[ key ] );
                        }
                    }
                }
                return stats;
            };

            componentService.watchComponentDomains( context, componentId, function ( updateData ) {
                var listItem = componentItems[ componentId ];
                console.log( 'DomainModels updated, event type:', updateData.type );
                if ( listItem ) {
                    listItem.stats = domainModelsToStat( updateData.domainModels );
                } else {
                    console.warn( 'DomainModel data did not have matching componentData', componentId );
                }
            } )
                .then( function ( data ) {
                    var listItem = componentItems[ componentId ];
                    if ( listItem ) {
                        listItem.stats = domainModelsToStat( data.domainModels );
                    } else {
                        console.warn( 'DomainModel data did not have matching componentData', componentId );
                    }
                } );
        };

        componentService.registerWatcher( context, function ( destroyed ) {
            items = [];
            $scope.listData.items = items;
            componentItems = {};

            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'initialize event raised' );

            componentService.watchComponents( context, $scope.workspaceId, $scope.avmIds, function (
                updateObject ) {
                var index;
                //console.warn(updateObject);
                if ( updateObject.type === 'load' ) {
                    serviceData2ListItem( updateObject.data );
                    addDomainWatcher( updateObject.id );
                } else if ( updateObject.type === 'update' ) {
                    serviceData2ListItem( updateObject.data );
                    //$scope.$apply();
                } else if ( updateObject.type === 'unload' ) {
                    if ( componentItems.hasOwnProperty( updateObject.id ) ) {
                        index = items.map( function ( e ) {
                            return e.id;
                        } )
                            .indexOf( updateObject.id );
                        if ( index > -1 ) {
                            items.splice( index, 1 );
                        }
                        componentService.cleanUpRegion( context, context.regionId +
                            '_watchComponentDomains_' + updateObject.id );
                        delete componentItems[ updateObject.id ];
                    }
                    //$scope.$apply();
                } else {
                    throw new Error( updateObject );
                }
            } )
                .then( function ( data ) {
                    var componentId;
                    for ( componentId in data.components ) {
                        if ( data.components.hasOwnProperty( componentId ) ) {
                            serviceData2ListItem( data.components[ componentId ] );
                            addDomainWatcher( componentId );
                        }
                    }
                } );
        } );
    } )
    .controller( 'ComponentEditController', function ( $scope, $modalInstance, data ) {
        'use strict';
        $scope.data = {
            description: data.description
        };

        $scope.ok = function () {
            $modalInstance.close( $scope.data );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };
    } )
    .directive( 'componentList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId',
                avmIds: '=avmIds'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ComponentList.html',
            controller: 'ComponentListController'
        };
    } );
