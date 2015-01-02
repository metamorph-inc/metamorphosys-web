/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.designEditor', [] )
    .directive( 'designEditor', [
        function () {

            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/designEditor.html'

            };
        }] );