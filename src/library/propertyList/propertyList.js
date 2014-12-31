/*globals angular*/
'use strict';

angular.module('cyphy.components')
    .directive('componentProperties', function () {

        return {
            restrict: 'E',
            scope: {
                properties: '='
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/componentProperties.html'
        };
    });