/*globals angular, console */

angular.module('CyPhyApp')
    .controller('MyViewController', function ($scope, DataStoreService) {
        'use strict';

        console.log('MyViewController');

        $scope.model = {
            name: 'listing projects [set from controller]',
            projectIds: []
        };

        DataStoreService.getProjects({db: 'my-db-connection-id'})
            .then(function (projectIds) {
                $scope.model.projectIds = projectIds;
            }).catch(function (reason) {
                console.error(reason);
            });
    });
