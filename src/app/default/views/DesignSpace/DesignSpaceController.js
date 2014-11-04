/*globals angular, console */

angular.module('CyPhyApp')
    .controller('DesignSpaceController', function ($scope, $state, $window, growl) {
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
            avmIds: {},
            configurationsAvaliable: false,
            configurations: []
        };
        growl.warning('Configuration Table has dummy data!');
        $scope.$on('designTreeLoaded', function (event, data) {
            $scope.state.avmIds = data.avmIds;
            $scope.state.desertInput = data.desertInput;
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
            console.log(data);
        });

        $scope.calculateConfigurations = function () {
        };
    });