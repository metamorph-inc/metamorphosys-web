/*globals angular, console */

angular.module('CyPhyApp')
    .controller('SampleController', function ($scope, dataStoreService, projectService) {
        'use strict';

        $scope.model = {
            name: 'listing projects [set from controller]',
            projectIds: []
        };

        dataStoreService.connectToDatabase('my-db-connection-id', {host: window.location.basename})
            .then(function () {
                console.log('connected');

                projectService.getProjects('my-db-connection-id')
                    .then(function (projectIds) {
                        $scope.model.projectIds = projectIds;
                    })
                    .catch(function (reason) {
                        console.error(reason);
                    });
            })
            .catch(function (reason) {
                console.error(reason);
            });

    });
