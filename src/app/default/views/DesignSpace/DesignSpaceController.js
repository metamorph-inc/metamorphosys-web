/*globals angular, console */

angular.module('CyPhyApp')
    .controller('DesignSpaceController', function ($scope, $state, $window, growl, desertService) {
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
            desertInputAvaliable: false,
            configurationsAvaliable: false
        };
        $scope.dataModels = {
            avmIds: {},
            desertInput: {},
            configurations: []
        };

        $scope.$on('designTreeLoaded', function (event, data) {
            $scope.dataModels.avmIds = data;
            $scope.state.designTreeLoaded = true;
        });

        $scope.$on('selectedInstances', function (event, data) {
            growl.info(data.name + ' has ' + data.ids.length + ' instance(s).');
            $scope.$broadcast('setSelectedNodes', data.ids);
        });

        $scope.$on('configurationClicked', function (event, data) {
            var i,
                ids = [];
            for (i = 0; i < data.alternativeAssignments.length; i += 1) {
                ids.push(data.alternativeAssignments[i].selectedAlternative);
            }
            $scope.$broadcast('setSelectedNodes', ids);
        });

        $scope.$on('desertInputReady', function (event, data) {
            $scope.dataModels.desertInput = data;
            $scope.state.desertInputAvaliable = true;
            console.log(data);
        });

        $scope.calculateConfigurations = function () {
            desertService.calculateConfigurations($scope.dataModels.desertInput)
                .then(function (configurations) {
                    console.log(configurations);
                    //growl.warning('Configuration Table has dummy data!');
                    //$scope.state.configurationsAvaliable = true;
                    //$scope.dataModels.configurations = configurations;
                });
        };
    });