/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.drawingGrid', [] )
    .directive( 'drawingGrid',
        function () {

            return {

                scope: {
                    id: '@'
                },
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/drawingGrid.html'

            };
        } );