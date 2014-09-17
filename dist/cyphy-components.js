(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components', []);

require('./WorkspaceList/WorkspaceList');




},{"./WorkspaceList/WorkspaceList":2}],2:[function(require,module,exports){
/*globals angular, console, document*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.components')
    .controller('WorkspaceListController', function ($scope, Chance) {
        'use strict';

        var self = this,
            i,
            items = [],
            itemGenerator,
            config;

        self.chance = Chance ? new Chance() : null;

        itemGenerator = function (id) {
            return {
                id: id,
                title: self.chance.name(),
                toolTip: 'Open item',
                description: self.chance.sentence(),
                lastUpdated: {
                    time: self.chance.date({year: (new Date()).getFullYear()}),
                    user: self.chance.name()

                },
                stats: [
                    {
                        value: self.chance.integer({min: 0, max: 5000}),
                        toolTip: 'Components',
                        iconClass: 'fa fa-puzzle-piece'
                    },
                    {
                        value: self.chance.integer({min: 0, max: 50}),
                        toolTip: 'Design Spaces',
                        iconClass: 'fa fa-cubes'
                    },
                    {
                        value: self.chance.integer({min: 0, max: 500}),
                        toolTip: 'Test benches',
                        iconClass: 'glyphicon glyphicon-saved'
                    },
                    {
                        value: self.chance.integer({min: 0, max: 20}),
                        toolTip: 'Requirements',
                        iconClass: 'fa fa-bar-chart-o'
                    }
                ]
                //details    : 'Some detailed text. Lorem ipsum ama fea rin the poc ketofmyja cket.'
            };
        };


        for (i = 0; i < self.chance.integer({min: 0, max: 30}); i += 1) {
            items.push(itemGenerator(i));
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
                document.location.hash =
                    '/workspaceDetails//' + item.id;
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
                                iconClass: 'glyphicon glyphicon-edit'
                            },
                            {
                                id: 'duplicateWorkspace',
                                label: 'Duplicate',
                                disabled: false,
                                iconClass: 'fa fa-copy copy-icon'
                            },
                            {
                                id: 'editWorkspace',
                                label: 'Edit',
                                disabled: true,
                                iconClass: 'glyphicon glyphicon-pencil'
                            },
                            {
                                id: 'exportAsXME',
                                label: 'Export as XME',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: { id: item.id },
                                action: function (id) {
                                    console.log(id);
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
                title: 'Create new item',
                itemTemplateUrl: 'app/WorkspaceList/views/WorkspaceNewItemTemplate.html',
                expanded: false,
                controller: function ($scope) {
                    $scope.createItem = function (newItem) {

                        newItem.url = 'something';
                        newItem.toolTip = newItem.title;

                        items.push(newItem);

                        $scope.newItem = {};

                        config.newItemForm.expanded = false; // this is how you close the form itself

                    };
                }
            },

            filter: {
            }

        };

        $scope.listData = {
            items: items
        };

        $scope.config = config;
    });

},{}]},{},[1]);
