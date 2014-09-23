/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

require('../WorkspaceList/WorkspaceList');

angular.module('cyphy.components')
    .service('DesignService', function ($q, NodeService) {
        'use strict';
        var watchers = {};

        this.deleteDesign = function (designId) {
            throw new Error('Not implemented yet.');
        };

        this.exportDesign = function (designId) {
            throw new Error('Not implemented yet.');
        };

        this.calculateConfigurations = function (data) {
            throw new Error('Not implemented yet.');
        };

        this.saveConfigurationSet = function (designId, data) {
            throw new Error('Not implemented yet.');
        };

        /**
         *  Watches all designs (existence and their attributes) of a workspace.
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchDesigns = function (parentContext, workspaceId, updateListener) {
            throw new Error('Not implemented yet.');
        };

        /**
         *  Watches a design w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchDesignDetails = function (parentContext, designId, updateListener) {
            throw new Error('Not implemented yet.');
        };

        /**
         *  Watches the full hierarchy of a design w.r.t. containers and components.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchDesignStructure = function (parentContext, designId, updateListener) {
            throw new Error('Not implemented yet.');
        };

        // FIXME: watchConfigurationSets and watchConfigurations should probably go to a DesertConfiguration-Service,
        // with a related controller DesertConfigurationSetList, where details are configurations.
        /**
         *  Watches the generated DesertConfigurationSets inside a Design.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchConfigurationSets = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                data = {
                    name: null,
                    id: designId,
                    regionId: null,
                    cfgSets: {}
                },
                context = {
                    db: parentContext.db,
                    projectId: parentContext.projectId,
                    branchId: parentContext.branchId,
                    regionId: parentContext.regionId + '_watchConfigurationSets_' + designId
                };
            data.regionId = context.regionId;
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            console.log('Added new watcher: ', watchers);
            NodeService.logContext(context);
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, designId)
                    .then(function (designNode) {
                        data.name = designNode.getAttribute('name');
                        designNode.loadChildren(context)
                            .then(function (childNodes) {
                                var i,
                                    onUpdate = function (id) {
                                        var newName = this.getAttribute('name'),
                                            newDesc = this.getAttribute('INFO');
                                        console.warn(newName);
                                        if (newName !== data.cfgSets[id].name ||
                                                newDesc !== data.cfgSets[id].description) {
                                            //data.cfgSets[id].name = newName;
                                            //console.warn('changed');
                                            updateListener(true);
                                        }
                                    },
                                    onUnload = function (id) {
                                        updateListener(true);
                                    };
                                for (i = 0; i < childNodes.length; i += 1) {
                                    if (childNodes[i].isMetaTypeOf(meta.DesertConfigurationSet)) {
                                        data.cfgSets[childNodes[i].getId()] = {
                                            id: childNodes[i].getId(),
                                            name: childNodes[i].getAttribute('name'),
                                            description: childNodes[i].getAttribute('INFO')
                                        };
                                        childNodes[i].onUpdate(onUpdate);
                                        childNodes[i].onUnload(onUnload);
                                    }
                                }
                                //console.log('cfgSets', cfgSets);
                                designNode.onNewChildLoaded(function (newNode) {
                                    if (newNode.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                        updateListener(true);
                                    }
                                });
                                deferred.resolve(data);
                            });
                        designNode.onUpdate(function (id) {
                            var newName = this.getAttribute('name');
                            if (newName !== data.name) {
                                data.name = newName;
                                updateListener(true);
                            }
                        });
                    });
            });
            return deferred.promise;
        };

        // FIXME: Watching configurations inside a configuration-set does probably not belong here.
//        /**
//         *  Watches the DesertConfiguration (w.r.t. existence and attributes) inside a DesertConfigurationSet.
//         * @param parentContext - context of controller.
//         * @param configurationSetId
//         * @param updateListener - invoked when there are (filtered) changes in data.
//         */
//        this.watchConfigurations = function (parentContext, configurationSetId, updateListener) {
//            throw new Error('Not implemented yet.');
//        };

        /**
         * Removes all watchers spawned from parentContext.
         * @param parentContext - context of controller.
         */
        this.cleanUpAllRegions = function (parentContext) {
            var childWatchers,
                key;
            if (watchers[parentContext.regionId]) {
                childWatchers = watchers[parentContext.regionId];
                for (key in childWatchers) {
                    if (childWatchers.hasOwnProperty(key)) {
                        NodeService.cleanUpRegion(childWatchers[key]);
                    }
                }
                delete watchers[parentContext.regionId];
            } else {
                console.log('Nothing to clean-up..');
            }
        };

        /**
         * Removes specified watcher (regionId)
         * @param parentContext
         * @param regionId
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            if (watchers[parentContext.regionId]) {
                if (watchers[parentContext.regionId][regionId]) {
                    NodeService.cleanUpRegion(regionId);
                    delete watchers[parentContext.regionId][regionId];
                } else {
                    console.log('Nothing to clean-up..');
                }
            } else {
                console.log('Cannot clean-up region since parentContext is not registered..', parentContext);
            }
        };
    })
    .controller('DesignListController', function ($scope, DesignService) {
        'use strict';
        var self = this,
            items = [],
            config;

        console.log('DesignListController');
        console.log($scope.workspaceId);

//        config = {
//
//            sortable: false,
//            secondaryItemMenu: true,
//            detailsCollapsible: true,
//            showDetailsLabel: 'Show details',
//            hideDetailsLabel: 'Hide details',
//
//            // Event handlers
//
//            itemSort: function (jQEvent, ui) {
//                console.log('Sort happened', jQEvent, ui);
//            },
//
//            itemClick: function (event, item) {
//                console.log('Clicked: ' + item);
//                document.location.hash =
//                    '/workspaceDetails//' + item.id;
//            },
//
//            itemContextmenuRenderer: function (e, item) {
//                console.log('Contextmenu was triggered for node:', item);
//
//                return [
//                    {
//                        items: [
//
//                            {
//                                id: 'openInEditor',
//                                label: 'Open in Editor',
//                                disabled: false,
//                                iconClass: 'glyphicon glyphicon-edit'
//                            },
//                            {
//                                id: 'duplicateWorkspace',
//                                label: 'Duplicate',
//                                disabled: false,
//                                iconClass: 'fa fa-copy copy-icon'
//                            },
//                            {
//                                id: 'editWorkspace',
//                                label: 'Edit',
//                                disabled: true,
//                                iconClass: 'glyphicon glyphicon-pencil'
//                            },
//                            {
//                                id: 'exportAsXME',
//                                label: 'Export as XME',
//                                disabled: false,
//                                iconClass: 'glyphicon glyphicon-share-alt',
//                                actionData: { id: item.id },
//                                action: function (data) {
//                                    console.log(data);
//                                }
//                            }
//                        ]
//                    },
//                    {
//                        //label: 'Extra',
//                        items: [
//
//                            {
//                                id: 'delete',
//                                label: 'Delete',
//                                disabled: false,
//                                iconClass: 'fa fa-plus',
//                                actionData: { id: item.id },
//                                action: function (data) {
//                                    WorkspaceService.deleteWorkspace(data.id);
//                                }
//                            }
//                        ]
//                    }
//                ];
//            },
//
//            detailsRenderer: function (item) {
//                //                item.details = 'My details are here now!';
//            },
//
//            newItemForm: {
//                title: 'Create new item',
//                itemTemplateUrl: '/cyphy-components/templates/WorkspaceNewItem.html',
//                expanded: false,
//                controller: function ($scope) {
//                    $scope.createItem = function (newItem) {
//
//                        WorkspaceService.createWorkspace(newItem);
//
//                        $scope.newItem = {};
//
//                        config.newItemForm.expanded = false; // this is how you close the form itself
//
//                    };
//                }
//            },
//
//            filter: {
//            }
//
//        };

        $scope.listData = {
            items: items
        };

//        $scope.config = config;
    })
    .directive('designList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/DesignList.html',
            controller: 'DesignListController'
        };
    });
