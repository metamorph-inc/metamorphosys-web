/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.processingCover', [] )
    .directive( 'processingCover', [ '$rootScope', '$timeout',
        function ($rootScope) {

            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/processingCover.html',
                link: function (/*scope, element*/) {

                    $rootScope.setProcessing = function() {
                        $rootScope.processing = true;
                    };

                    $rootScope.stopProcessing = function() {
                        $rootScope.processing = false;
                    };

                }

            };
        }] );
