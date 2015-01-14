/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.componentWire.corner', []
)

.directive(
    'componentWireCorner',

    function () {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/mmsApp/templates/componentWireCorner.html',
            templateNamespace: 'SVG'
        };
    }
);
