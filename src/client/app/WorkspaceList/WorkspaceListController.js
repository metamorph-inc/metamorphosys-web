/*globals define, console, document*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

define([], function () {
    'use strict';

    var WorkspaceListController = function ($scope) {


        var i, items2 = [], itemGenerator2, config;

        itemGenerator2 = function (id) {
            return {
                id         : id,
                title      : 'List sub-item ' + id,
                toolTip    : 'Open item',
                description: 'This is description here',
                lastUpdated: {
                    time: Date.now(),
                    user: 'N/A'

                },
                stats      : [
                    {
                        value    : id,
                        tooltip  : 'Components',
                        iconClass: 'fa fa-puzzle-piece'
                    },
                    {
                        value    : id,
                        tooltip  : 'Design Spaces',
                        iconClass: 'fa fa-cubes'
                    },
                    {
                        value    : id,
                        tooltip  : 'Test benches',
                        iconClass: 'glyphicon glyphicon-saved'
                    },
                    {
                        value    : id,
                        tooltip  : 'Requirements',
                        iconClass: 'fa fa-bar-chart-o'
                    }
                ]
                //details    : 'Some detailed text. Lorem ipsum ama fea rin the poc ketofmyja cket.'
            };
        };


        for (i = 0; i < 20; i += 1) {
            items2.push(itemGenerator2(i));
        }

        config = {

            sortable          : false,
            secondaryItemMenu : true,
            detailsCollapsible: true,
            showDetailsLabel  : 'Show details',
            hideDetailsLabel  : 'Hide details',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                console.log('Clicked: ' + item);
                document.location.hash = '/workspaceDetails//' + item.id;
            },

            itemContextmenuRenderer: function (e, item) {
                console.log('Contextmenu was triggered for node:', item);

                return [
                    {
                        items: [

                            {
                                id       : 'openInEditor',
                                label    : 'Open in Editor',
                                disabled : false,
                                iconClass: 'glyphicon glyphicon-edit'
                            },
                            {
                                id       : 'duplicateWorkspace',
                                label    : 'Duplicate',
                                disabled : false,
                                iconClass: 'fa fa-copy copy-icon'
                            },
                            {
                                id       : 'editWorkspace',
                                label    : 'Edit',
                                disabled : true,
                                iconClass: 'glyphicon glyphicon-pencil'
                            },
                            {
                                id       : 'exportAsXME',
                                label    : 'Export as XME',
                                disabled : false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: { id: item.id },
                                action   : function (id) {
                                    console.log(id);
                                }
                            }
                        ]
                    },
                    {
                        items: [

                            {
                                id       : 'delete',
                                label    : 'Delete',
                                disabled : false,
                                iconClass: 'fa fa-plus'
                            }
                        ]
                    }
                ];
            },

            detailsRenderer: function (item) {
                //                item.details = 'My details are here now!';
            },

            newItemForm: {
                title          : 'Create new item',
                itemTemplateUrl: 'app/WorkspaceList/views/WorkspaceNewItemTemplate.html',
                expanded       : false,
                controller     : function ($scope) {
                    $scope.createItem = function (newItem) {

                        newItem.url = 'something';
                        newItem.toolTip = newItem.title;

                        items2.push(newItem);

                        $scope.newItem = {};

                        config.newItemForm.expanded = false; // this is how you close the form itself

                    };
                }
            },

            filter: {
            }

        };

        $scope.listData = {
            items: items2
        };

        $scope.config = config;
    }

    return WorkspaceListController;
}
);