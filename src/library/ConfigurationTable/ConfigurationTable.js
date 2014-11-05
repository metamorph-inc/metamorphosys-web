/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('ConfigurationTableController', function ($scope) {
        'use strict';
        $scope.dataModel = {
            changeInfo: [],
            selected: [],
            configurations: $scope.configurations
        };

        $scope.tableColumnDefinition = [
            {
                columnHeaderDisplayName: 'Name',
                templateUrl: 'tableCell.html',
                sortKey: 'name'
            }
        ];

        $scope.cfgClicked = function (cfg) {
            $scope.$emit('configurationClicked', cfg);
        };
    })
    .directive('configurationTable', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                configurations: '=configurations'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ConfigurationTable.html',
            controller: 'ConfigurationTableController'
        };
    });
