/*globals angular, console */

angular.module('CyPhyApp')
    .controller('DesignSpaceController', function ($scope, $state, designService) {
        'use strict';
        var workspaceId = $state.params.workspaceId.replace(/-/g, '/'),
            designId = $state.params.designId.replace(/-/g, '/');
        console.log('DesignSpaceController', workspaceId, designId);
        $scope.dataModel = {
            designId: designId
        };
        //debugger;
    });