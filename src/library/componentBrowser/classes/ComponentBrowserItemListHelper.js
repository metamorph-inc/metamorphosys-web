'use strict';

module.exports = function($scope, $window, context, $modal, componentService, $log) {

    var config;

    config = {

        sortable: false,
        secondaryItemMenu: true,
        detailsCollapsible: true,
        showDetailsLabel: 'Show details',
        hideDetailsLabel: 'Hide details',

        // Event handlers

        itemSort: function ( jQEvent, ui ) {
            $log.debug( 'Sort happened', jQEvent, ui );
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
                }  ]
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

    this.config = config;

};
