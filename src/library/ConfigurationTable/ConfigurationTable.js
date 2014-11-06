/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('ConfigurationTableController', function ($scope, growl) {
        'use strict';
        $scope.dataModel = {
            changeInfo: [],
            selected: [],
            configurations: $scope.configurations,
            setName: $scope.setName
        };

//        $scope.$watch(function (scope) { return scope.dataModel.configurations; },
//            function () { console.info('Watch triggered configurations!', $scope.dataModel.configurations); });

        $scope.tableColumnDefinition = [
            {
                columnHeaderDisplayName: 'Name',
                templateUrl: 'tableCell.html',
                sortKey: 'name'
            }
        ];

        $scope.$on('newConfigurations', function (event, data) {
            $scope.dataModel.configurations = data.configurations;
            $scope.dataModel.setName = data.setName;
            console.log('newConfigurations', data);
        });

        $scope.$on('exposeSelection', function (event, data) {
            $scope.$emit('selectionExposed', $scope.dataModel.selected);
        });

        $scope.cfgClicked = function (cfg) {
            $scope.$emit('configurationClicked', cfg);
        };
    })
    .directive('configurationTable', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                configurations: '=configurations',
                setName: '=setName'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ConfigurationTable.html',
            controller: 'ConfigurationTableController'
        };
    });
