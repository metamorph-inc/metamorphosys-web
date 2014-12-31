/*globals angular*/
'use strict';

angular.module('cyphy.components')
    .directive('propertyList', function () {

        return {
            restrict: 'E',
            scope: {
                properties: '='
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/propertyList.html'
        };
    });