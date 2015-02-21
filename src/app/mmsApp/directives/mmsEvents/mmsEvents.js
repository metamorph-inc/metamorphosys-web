/*global angular*/

'use strict';

var doubleEventDelay = 200;

angular.module('mms.events', [])

    .directive('mmsSingleMousedown', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var fn = $parse(attr.mmsSingleMousedown);
                var delay = doubleEventDelay, clicks = 0, timer = null;
                element.on('mousedown', function (event) {
                    clicks++;
                    if (clicks === 1) {
                        timer = setTimeout(function () {
                            scope.$apply(function () {
                                fn(scope, {$event: event});
                            });
                            clicks = 0;
                        }, delay);
                    } else {
                        clearTimeout(timer);
                        clicks = 0;
                    }
                });
            }
        };
    }])

    .directive('mmsSingleMouseup', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var fn = $parse(attr.mmsSingleMouseup);
                var delay = doubleEventDelay, clicks = 0, timer = null;
                element.on('mouseup', function (event) {

                    clicks++;
                    if (clicks === 1) {
                        timer = setTimeout(function () {
                            scope.$apply(function () {
                                fn(scope, {$event: event});
                            });
                            clicks = 0;
                        }, delay);
                    } else {
                        clearTimeout(timer);
                        clicks = 0;
                    }
                });
            }
        };
    }])

    .directive('mmsSingleClick', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var fn = $parse(attr.mmsSingleClick);
                var delay = doubleEventDelay, clicks = 0, timer = null;
                element.on('click', function (event) {
                    clicks++;
                    if (clicks === 1) {
                        timer = setTimeout(function () {
                            scope.$apply(function () {
                                fn(scope, {$event: event});
                            });
                            clicks = 0;
                        }, delay);
                    } else {
                        clearTimeout(timer);
                        clicks = 0;
                    }
                });
            }
        };
    }])

    .directive('mmsStopEvent', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function (e) {
                    e.stopPropagation();
                });
            }
        };
    });