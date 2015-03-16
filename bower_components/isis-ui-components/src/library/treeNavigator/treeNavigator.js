/*globals angular*/

'use strict';

require('./treeNavigator.nodeList.js');
require('./treeNavigator.header.js');
require('./treeNavigator.node.label.js');

angular.module(
    'isis.ui.treeNavigator', [
        'isis.ui.treeNavigator.nodeList',
        'isis.ui.treeNavigator.header',
        'isis.ui.treeNavigator.node.label'
    ])

    .controller('TreeNavigatorController', function ($scope) {

        $scope.scopeMenuConfig = {
            triggerEvent: 'click',
            position: 'left bottom'
        };

        $scope.preferencesMenuConfig = {
            triggerEvent: 'click',
            position: 'right bottom'
        };


        $scope.config = $scope.config || {};

        $scope.config.collapsedIconClass = $scope.config.collapsedIconClass || 'icon-arrow-right';
        $scope.config.expandedIconClass = $scope.config.expandedIconClass || 'icon-arrow-down';

        $scope.config.extraInfoTemplateUrl = $scope.config.extraInfoTemplateUrl ||
        '/isis-ui-components/templates/treeNavigator.node.extraInfo.html';

    })

    .directive(
    'treeNavigator', function () {
        return {
            scope: {
                treeData: '=',
                config: '='
            },

            restrict: 'E',
            replace: true,
            templateUrl: '/isis-ui-components/templates/treeNavigator.html',
            controller: 'TreeNavigatorController'

        };
    }
)
    // Based on: http://stackoverflow.com/questions/20444409/handling-ng-click-and-ng-dblclick-on-the-same-element-with-angularjs

    .directive('isisSglclick', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var fn = $parse(attr.isisSglclick);
                var delay = 300, clicks = 0, timer = null;
                element.on('click', function (event) {
                    clicks++;  //count clicks
                    if (clicks === 1) {
                        timer = setTimeout(function () {
                            scope.$apply(function () {
                                fn(scope, {$event: event});
                            });
                            clicks = 0;             //after action performed, reset counter
                        }, delay);
                    } else {
                        clearTimeout(timer);    //prevent single-click action
                        clicks = 0;             //after action performed, reset counter
                    }
                });
            }
        };
    }])
    .directive('isisStopEvent', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function (e) {
                    e.stopPropagation();
                });
            }
        };
    });