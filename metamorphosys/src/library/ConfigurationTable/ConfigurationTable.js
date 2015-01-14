/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'ConfigurationTableController', function ( $scope ) {
        'use strict';
        $scope.dataModel = {
            changeInfo: [],
            selected: [],
            configurations: $scope.configurations,
            setName: $scope.setName
        };

        $scope.tableColumnDefinition = [ {
            columnHeaderDisplayName: 'Name',
            templateUrl: 'tableCell.html',
            sortKey: 'name'
        } ];

        $scope.$on( 'exposeSelection', function ( event, type ) {
            $scope.$emit( 'selectionExposed', $scope.dataModel.selected, type );
        } );

        $scope.cfgClicked = function ( cfg ) {
            $scope.$emit( 'configurationClicked', cfg );
        };
    } )
    .directive( 'configurationTable', function () {
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
    } );