/*globals console, angular*/

'use strict';

var demoApp = angular.module('cyphy.ui.WorkspaceList.demo', []);

demoApp.controller('WorkspaceListDemoController', function ($scope) {
    var chance = new Chance(),
        numItems = chance.integer({min: 2, max: 15}),
        i;

    $scope.configurations = [];

    for (i = 0; i < numItems; i += 1) {
        $scope.configurations.push({
            id: i,
            name: chance.word()
        });
    }
});