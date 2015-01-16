/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.busyCover', [] )
    .directive( 'busyCover', [ '$rootScope',
        function ($rootScope) {

            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/busyCover.html',
                link: function (scope, element) {

                    scope.$watch(function() {

                        var isBusy;

                        if ($rootScope.loading) {

                            scope.busyMessage = 'Loading...';

                        } else if ( $rootScope.initializing ){

                            scope.busyMessage = 'Initializing...';

                        } else if ( $rootScope.busy ){

                            if (!scope.busyMessage) {
                                scope.busyMessage = 'Just a second...';
                            }

                        } else {
                            scope.busyMessage = '';
                        }

                        isBusy = $rootScope.loading ||
                            $rootScope.initializing ||
                            $rootScope.busy;

                        return isBusy;

                    }, function(isBusy) {

                        scope.busy = isBusy;

                        if (!isBusy) {

                            element.removeClass('busy');

                        } else {

                            element.addClass('busy');

                        }

                    });

                    scope.$watch(function() {

                        var isCovered;

                        isCovered = ( $rootScope.unCovered !== true );

                        return isCovered;

                    }, function(isCovered) {

                        if (isCovered) {

                            element.removeClass('off');

                        } else {

                            element.addClass('off');

                        }

                    });


                    $rootScope.stopBusy = function() {

                        $rootScope.loading = false;
                        $rootScope.initializing = false;
                        $rootScope.busy = false;

                        document.body.style.display = 'none';
                        document.body.offsetHeight = document.body.offsetHeight;
                        document.body.style.display = '';
                    };

                    $rootScope.unCover = function() {

                        $rootScope.unCovered = true;

                    };
                }


            };
        }] );
