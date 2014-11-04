/*globals angular, console */

angular.module('CyPhyApp')
    .controller('DesignSpaceController', function ($scope, $state, $window, growl, designService) {
        'use strict';
        var self = this,
            workspaceId = $state.params.workspaceId.replace(/-/g, '/'),
            designId = $state.params.designId.replace(/-/g, '/');

        console.log('DesignSpaceController');
        $scope.connectionId = 'my-db-connection-id';
        $scope.workspaceId = workspaceId;
        $scope.designId = designId;
        $scope.state = {
            designTreeLoaded: false,
            avmIds: {}
        };

        $scope.$on('designTreeLoaded', function (event, data) {
            $scope.state.avmIds = data;
            $scope.state.designTreeLoaded = true;
        });

        $scope.$on('displayInstancesUp', function (event, data) {
            growl.info(data.name + ' has ' + data.ids.length + ' instance(s).');
            $scope.$broadcast('displayInstancesDown', data.ids);
        });

    });