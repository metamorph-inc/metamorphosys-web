/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('ComponentListController', function ($scope, $window, growl, ComponentService, FileService) {
        'use strict';
        var self = this,
            items = [],
            componentItems = {},
            serviceData2ComponentItem,
            addDomainWatcher,
            config,
            context;

        console.log('ComponentListController');

        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'ComponentListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                ComponentService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                console.log('Clicked: ' + item);
                document.location.hash = '/component/' + item.id.replace(/\//g, '-');
            },

            itemContextmenuRenderer: function (e, item) {
                console.log('Contextmenu was triggered for node:', item);

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
                                id: 'exportAsAdm',
                                label: 'Export ACM',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: {resource: item.resource},
                                action: function (data) {
                                    var hash = data.resource,
                                        url = FileService.getDownloadUrl(hash);
                                    if (url) {
                                        $window.open(url);
                                    } else {
                                        growl.warning('Component does not have a resource.');
                                    }
                                }
                            }
                        ]
                    },
                    {
                        //label: 'Extra',
                        items: [
                            {
                                id: 'delete',
                                label: 'Delete',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-remove',
                                actionData: { id: item.id },
                                action: function (data) {
                                    ComponentService.deleteWorkspace(context, data.id);
                                }
                            }
                        ]
                    }
                ];
            },

            detailsRenderer: function (item) {
                //                item.details = 'My details are here now!';
            },

            filter: {
            }

        };

        $scope.listData = {
            items: items,
            connectionId: $scope.connectionId // FIXME: This is probably not the right way to do it..
        };

        $scope.config = config;

        serviceData2ComponentItem = function (data) {
            var componentItem;

            if (componentItems.hasOwnProperty(data.id)) {
                componentItem = componentItems[data.id];
                componentItem.name = data.name;
                componentItem.description = data.description;
                componentItem.resource = data.resource;
            } else {
                componentItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open item',
                    description: data.description,
                    lastUpdated: {
                        time: new Date(), // TODO: get this
                        user: 'N/A' // TODO: get this
                    },
                    stats: [
                        {
                            value: 0,
                            toolTip: 'Domain Models (not final)',
                            iconClass: 'glyphicon glyphicon-tint'
                        }
                    ],
                    details    : 'Content',
                    detailsTemplateUrl: 'details.html',
                    resource: data.resource
                };

                componentItems[componentItem.id] = componentItem;
                items.push(componentItem);
            }
        };

        addDomainWatcher = function (componentId) {
            ComponentService.watchComponentDomains(context, componentId, function (updateData) {
                //TODO: Implement the updating functionality.
            })
                .then(function (data) {
                    var componentData = componentItems[componentId],
                        key;
                    if (componentData) {
                        for (key in data.domainModels) {
                            if (data.domainModels.hasOwnProperty(key)) {
                                componentData.stats[0].value += 1;
                            }
                        }
                    }
                });
        };

        ComponentService.registerWatcher(context, function (destroyed) {
            items = [];
            $scope.listData.items = items;
            componentItems = {};

            if (destroyed) {
                console.info('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            ComponentService.watchComponents(context, $scope.workspaceId, function (updateObj) {
                //TODO: Implement the updating functionality.
            })
                .then(function (data) {
                    var componentId;
                    //debugger;
                    for (componentId in data.components) {
                        if (data.components.hasOwnProperty(componentId)) {
                            serviceData2ComponentItem(data.components[componentId]);
                            addDomainWatcher(componentId);
                        }
                    }
                });
        });
    })
    .directive('componentList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ComponentList.html',
            controller: 'ComponentListController'
        };
    });
