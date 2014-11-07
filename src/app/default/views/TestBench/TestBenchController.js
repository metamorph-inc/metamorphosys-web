/*globals angular, console */

angular.module('CyPhyApp')
    .controller('TestBenchController', function ($scope, $state, $timeout, growl, testBenchService) {
        'use strict';
        var self = this,
            context = {
                db: 'my-db-connection-id'
            },
            workspaceId = $state.params.workspaceId.replace(/-/g, '/'),
            testBenchId = $state.params.testBenchId.replace(/-/g, '/');

        console.log('TestBenchController');
        $scope.connectionId = context.db;

        $scope.workspaceId = workspaceId;
        $scope.testBenchId = testBenchId;
        $scope.state = {
            configurationStatus: 'Select a Top Level System Under Test...',
            designId: null
        };

        $scope.dataModels = {
            configurations: [],
            setName: null
        };

        $scope.$on('configurationsLoaded', function (event, data) {
            $scope.dataModels.configurations = [];
            $timeout(function () {
                $scope.dataModels.configurations = data.configurations;
                $scope.dataModels.setName = data.setName;
                if (data.configurations.length === 0) {
                    growl.warning('There were no configurations in ' + data.setName);
                    $scope.state.configurationStatus = 'Select an action above...';
                }
            });
        });

        $scope.$on('topLevelSystemUnderTestSet', function (event, listItem) {
            $scope.state.designId = listItem.id;
            console.log('topLevelSystemUnderTestSet', listItem);
        });

        $scope.$on('selectionExposed', function (event, configurations) {
            var configurationId;
            if (configurations.length < 1) {
                growl.warning('No selected configurations!');
                return;
            }
            configurationId = configurations[0].id;
            growl.info('Test-bench running on ' + configurations[0].name);
            testBenchService.runTestBench(context, testBenchId, configurationId)
                .then(function (result) {
                    growl.success('TestBench run successful!');
                })
                .catch(function (reason) {
                    console.error(reason);
                    growl.error("Running test-bench failed.");
                });
        });

        $scope.runTestBench = function () {
            $scope.$broadcast('exposeSelection');
        };
    });