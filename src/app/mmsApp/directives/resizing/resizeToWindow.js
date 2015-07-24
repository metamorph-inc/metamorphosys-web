/*globals angular*/
'use strict';

var resizeToWindowModule = angular.module('mms.resizeToWindow', []);


resizeToWindowModule.directive('resizeToWindow', function ($window) {

    return function (scope, element, attributes) {

        var window = angular.element(
                $window
            ),
            minWidth = parseInt(attributes.minWidth, 10) || 0,
            minHeight = parseInt(attributes.mindHeight, 10) || 0,
            maxWidth = parseInt(attributes.maxWidth, 10) || Infinity,
            maxHeight = parseInt(attributes.maxHeight, 10) || Infinity,
            widthIsLessWith = parseInt(attributes.widthIsLessWith, 10) || 0,
            heightIsLessWith = parseInt(attributes.heightIsLessWith, 10) || 0,

            reverseInPortrait = true;

        scope.getWindowHeight = function () {

            var max, min,
                height, width;

            height = ($window.innerHeight > 0) ? $window.innerHeight : screen.height;
            width = ($window.innerWidth > 0) ? $window.innerWidth : screen.width;

            if (reverseInPortrait && height > width) {
                max = maxWidth;
                min = minWidth;
            } else {
                max = maxHeight;
                min = minHeight;
            }

            return Math.max(Math.min(height - heightIsLessWith, max), min);
        };

        scope.getWindowWidth = function () {

            var max, min,
                height, width;

            height = ($window.innerHeight > 0) ? $window.innerHeight : screen.height;
            width = ($window.innerWidth > 0) ? $window.innerWidth : screen.width;

            if (reverseInPortrait && height > width) {
                max = maxHeight;
                min = minHeight;
            } else {
                max = maxWidth;
                min = minWidth;
            }

            return Math.max(Math.min(width - widthIsLessWith, max), min);
        };

        scope.$watch(scope.getWindowWidth,
            function (newValue) {
                element.outerWidth(newValue);
            });

        scope.$watch(scope.getWindowHeight,
            function (newValue) {
                element.outerHeight(newValue);
            });

        window.bind('resize', function () {
            scope.$apply();
        });

    };
});

module.exports = resizeToWindowModule;
