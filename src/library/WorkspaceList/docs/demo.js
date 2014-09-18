/*globals console, angular, Chance*/

'use strict';

var demoApp = angular.module('cyphy.ui.WorkspaceList.demo', [
    'cyphy.components',
    'cyphy.components.templates'
]);

demoApp.controller('WorkspaceListDemoController', function ($scope) {
    var self = this,
        numItems,
        itemGenerator,
        i;

    console.log('WorkspaceListDemoController');

    self.chance = new Chance();
    numItems = self.chance.integer({min: 2, max: 15});

    // this element
    $scope.workspaces = [];

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
        $scope.workspaces.push(itemGenerator(i));
    }


});