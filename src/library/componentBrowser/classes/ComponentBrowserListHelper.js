'use strict';

module.exports = function ($scope, $window, context, $modal, componentService, $log) {

    var config,
        data,

        addItem,
        removeItem,
        updateItemStats,

        domainModelsToStat,

        items,
        itemsById;

    items = [];
    itemsById = {};

    data = {
        items: items
    };

    config = {

        sortable: false,
        secondaryItemMenu: true,
        detailsCollapsible: true,
        showDetailsLabel: 'Show details',
        hideDetailsLabel: 'Hide details',

        // Event handlers

        itemSort: function (jQEvent, ui) {
            $log.debug('Sort happened', jQEvent, ui);
        },

        itemClick: function (event, item) {
            $scope.$emit('selectedInstances', {
                name: item.title,
                ids: item.data.instanceIds
            });
        },

        itemContextmenuRenderer: function (e, item) {
            return [
                {
                    items: [
                        {
                            id: 'openInEditor',
                            label: 'Open in Editor',
                            disabled: false,
                            iconClass: 'glyphicon glyphicon-edit',
                            action: function () {
                                $window.open('/?project=ADMEditor&activeObject=' + item.id, '_blank');
                            }
                        },
                        {
                            id: 'editComponent',
                            label: 'Edit',
                            disabled: false,
                            iconClass: 'glyphicon glyphicon-pencil',
                            actionData: {
                                description: item.description,
                                id: item.id
                            },
                            action: function (data) {
                                var editContext = {
                                        db: context.db,
                                        regionId: context.regionId + '_watchComponents'
                                    },
                                    modalInstance = $modal.open({
                                        templateUrl: '/cyphy-components/templates/ComponentEdit.html',
                                        controller: 'ComponentEditController',
                                        //size: size,
                                        resolve: {
                                            data: function () {
                                                return data;
                                            }
                                        }
                                    });

                                modalInstance.result.then(function (editedData) {
                                    var attrs = {
                                        'INFO': editedData.description
                                    };
                                    componentService.setComponentAttributes(editContext, data.id, attrs)
                                        .then(function () {
                                            console.log('Attribute updated');
                                        });
                                }, function () {
                                    console.log('Modal dismissed at: ' + new Date());
                                });
                            }
                        }
                    ]
                },
                {
                    items: [
                        {
                            id: 'delete',
                            label: 'Delete',
                            disabled: false,
                            iconClass: 'glyphicon glyphicon-remove',
                            actionData: {
                                id: item.id,
                                name: item.title
                            },
                            action: function (data) {
                                var modalInstance = $modal.open({
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
                                });

                                modalInstance.result.then(function () {
                                    componentService.deleteComponent(context, data.id);
                                }, function () {
                                    console.log('Modal dismissed at: ' + new Date());
                                });
                            }
                        }
                    ]
                }
            ];
        },

        detailsRenderer: function (/*item*/) {
            //                item.details = 'My details are here now!';
        },

        filter: {}

    };

    addItem = function (data) {
        var listItem;

        if (itemsById.hasOwnProperty(data.id)) {
            listItem = itemsById[ data.id ];
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
            if ($scope.avmIds) {
                listItem.data.instanceIds = $scope.avmIds[ data.avmId ];
            }
            // Add the list-item to the items list and the dictionary.
            items.push(listItem);
            itemsById[ listItem.id ] = listItem;
        }

    };

    removeItem = function (id) {

        var index;

        if (itemsById.hasOwnProperty(id)) {
            index = items.map(function (e) {
                return e.id;
            })
                .indexOf(id);
            if (index > -1) {
                items.splice(index, 1);
            }
            componentService.cleanUpRegion(context, context.regionId +
                '_watchComponentDomains_' + id);
            delete itemsById[ id ];
        }

    };

    domainModelsToStat = function ( domainModels ) {
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
                },
                EDA: {
                    value: 0,
                    toolTip: 'EDA',
                    iconClass: 'fa fa-laptop'
                },
                SPICE: {
                    value: 0,
                    toolTip: 'SPICE',
                    iconClass: 'fa fa-laptop'
                },
                SystemC: {
                    value: 0,
                    toolTip: 'SystemC',
                    iconClass: 'fa fa-laptop'
                }
            },
            key;
        for ( key in domainModels ) {
            if ( domainModels.hasOwnProperty( key ) ) {
                if ( labelMap[ domainModels[ key ].type ] ) {
                    labelMap[ domainModels[ key ].type ].value += 1;
                } else {
                    $log.error( 'Unexpected domain-model type', domainModels[ key ].type );
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


    updateItemStats = function(componentId, updateData) {

        var listItem = itemsById[ componentId ];

        if ( listItem ) {
            listItem.stats = domainModelsToStat( updateData.domainModels );
        } else {
            $log.warn( 'DomainModel data did not have matching componentData', componentId );
        }
        
    };
    
    this.config = config;
    this.data = data;

    this.addItem = addItem;
    this.removeItem = removeItem;
    this.updateItemStats = updateItemStats;

};
