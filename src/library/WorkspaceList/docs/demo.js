/*globals console, angular*/

'use strict';

var demoApp = angular.module('cyphy.ui.WorkspaceList.demo', []);

demoApp.controller('WorkspaceListDemoController', function ($scope) {
    $scope.configurations = [
        {
            name: 'some name comes here...'
        },
        {
            name: 'config 2'
        }
    ];
});