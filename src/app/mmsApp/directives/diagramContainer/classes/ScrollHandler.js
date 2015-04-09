/*globals angular*/

'use strict';

module.exports = function($scope, $timeout, $log) {

    var jsp,
        jspReinit,
        jspPane,

        scrollPositionX,
        scrollPositionY,

        updateVisibleArea,
        updatePromise,

        timedJSPReinit,
        jspReinitChillPeriod,
        jspReinitPromise,

        onWindowResize;


    updateVisibleArea = function() {

        var left,
            top,
            _updateVisibleArea;

        _updateVisibleArea = function() {

            $scope.visibleArea = {
                left: left || 0,
                top: top || 0,
                right: left + $scope.$contentPane.width(),
                bottom: top + $scope.$contentPane.height()
            };

        };

        if (jspPane) {

            left = scrollPositionX || 0;
            top = scrollPositionY || 0;

            if (updatePromise) {
                $timeout.cancel(updatePromise);
                updatePromise = null;
            }

            updatePromise = $timeout(_updateVisibleArea, 100);
        }
    };

    jspReinitChillPeriod = 200;

    timedJSPReinit = function() {

        if (angular.isObject(jsp)) {

            $log.debug('Reinitializing JSP.');
            jsp.reinitialise();

        }

    };

    jspReinit = function() {

        $timeout.cancel(jspReinitPromise);

        jspReinitPromise = $timeout(timedJSPReinit, jspReinitChillPeriod);

    };

    $scope.$on('DiagramContainerInitialized', function() {

        $scope.$contentPane

            .bind('jsp-initialised',
                function() {

                    var spaceBarKiller;

                    jspPane = $scope.$contentPane.find('.jspPane');
                    updateVisibleArea();

                    spaceBarKiller = function(event) {

                        var d,
                            doPrevent;

                        if (event.keyCode === 32) { // Space

                            doPrevent = true;

                            d = event.srcElement || event.target;

                            if (d.tagName) {

                                if ((d.tagName.toUpperCase() === 'INPUT' &&
                                        (
                                            d.type.toUpperCase() === 'TEXT' ||
                                            d.type.toUpperCase() === 'PASSWORD' ||
                                            d.type.toUpperCase() === 'FILE' ||
                                            d.type.toUpperCase() === 'EMAIL' ||
                                            d.type.toUpperCase() === 'SEARCH' ||
                                            d.type.toUpperCase() === 'DATE')
                                    ) ||
                                    d.tagName.toUpperCase() === 'TEXTAREA') {
                                    doPrevent = d.readOnly || d.disabled;
                                }
                            }
                        }

                        if (doPrevent) {
                            event.preventDefault();
                        }

                    };

                    jspPane.keypress(spaceBarKiller);

                }
            )
            .bind('jsp-scroll-y', function(event, aScrollPositionY) {

                scrollPositionY = aScrollPositionY;

                updateVisibleArea();
            })
            .bind('jsp-scroll-x', function(event, aScrollPositionX) {

                scrollPositionX = aScrollPositionX;

                updateVisibleArea();
            })
            //            .bind(
            //            'jsp-arrow-change',
            //            function (event, isAtTop, isAtBottom, isAtLeft, isAtRight) {
            //                console.log('Handle jsp-arrow-change', this,
            //                    'isAtTop=', isAtTop,
            //                    'isAtBottom=', isAtBottom,
            //                    'isAtLeft=', isAtLeft,
            //                    'isAtRight=', isAtRight);
            //            }
            //        )
            .jScrollPane({
                verticalDragMinHeight: 60,
                verticalDragMaxHeight: 60,
                horizontalDragMinWidth: 60,
                horizontalDragMaxWidth: 60,
                animateScroll: true,
                mouseWheelSpeed: 0
            });

        jsp = $scope.$contentPane.data('jsp');

        jspReinit();
    });

    $scope.$on('DiagramInitialized', function() {
        jspReinit();
    });

    $scope.$on('contentPan', function($event, distance) {

        if (angular.isObject(jsp)) {

            //            $log.debug('jsp.scrollBy', distance);
            jsp.scrollBy(-distance.x, -distance.y, false);

        }

    });

    onWindowResize = function() {
        jspReinit();
    };

    this.onWindowResize = onWindowResize;

    return this;

};
