/*globals angular*/

'use strict';

require('./decoratedPorts.js');

angular.module(
    'mms.designVisualization.port',
    [
        'mms.designVisualization.port.decoratedPorts'
    ]
)
    .controller('PortController', function ($scope) {

        $scope.getPortTransform = function () {

            var transformString;

            transformString = 'translate(' + $scope.portInstance.portSymbol.x + ',' + $scope.portInstance.portSymbol
                .y + ')';

            return transformString;

        };

        $scope.getLabel = function () {

            var label;

            if (angular.isString($scope.portInstance.label)) {
                label = $scope.portInstance.label;
            } else if (angular.isFunction($scope.portInstance.label)) {
                label = $scope.portInstance.label();
            } else {
                label = $scope.portInstance.portSymbol.label;
            }

            return label;
        };

        $scope.isPortLabelVisible = function () {

            return $scope.component.symbol.showPortLabels;

        };

        $scope.getTypeText = function() {

            var type;

            if (angular.isString($scope.portInstance.type)) {
                type = $scope.portInstance.type;
            } else if (angular.isFunction($scope.portInstance.type)) {
                type = $scope.portInstance.type();
            } else {
                type = $scope.portInstance.portSymbol.type;
            }

            return type;

        };

        $scope.getCssClass = function () {

            var cssClass;

            cssClass = $scope.portInstance.portSymbol.cssClass;

            if ($scope.portInstance.portSymbol.type) {
                cssClass += ' ' + $scope.portInstance.portSymbol.type;
            }
            // if ($scope.svgDiagramController &&
            //     $scope.svgDiagramController.focusedPort &&
            //     $scope.svgDiagramController.focusedPort.portSymbol &&
            //     $scope.svgDiagramController.focusedPort.portSymbol.type) {
            //
            //         if (!($scope.portInstance.portSymbol &&
            //             $scope.portInstance.portSymbol.type === $scope.svgDiagramController.focusedPort.portSymbol.type)) {
            //                 cssClass += 'fade-out';
            //             }
            //
            //     }
            //
            // console.log(cssClass);
            //

            return cssClass;

        };

    })
    .directive(
    'port',

    function ($timeout) {

        var TYPE_ELEMENT_SPACING = 6;

        return {
            scope: false,
            controller: 'PortController',
            restrict: 'E',
            replace: true,
            templateUrl: '/mmsApp/templates/port.html',
            templateNamespace: 'SVG',
            require: ['^svgDiagram', '^diagramContainer'],
            link: function (scope, element, attributes, controllers) {

                var svgDiagramController = controllers[0],
                    diagramContainerController = controllers[1];

                scope.svgDiagramController = svgDiagramController;
                scope.diagram = diagramContainerController.getDiagram();
                scope.element = element[0];

                scope.onPortClick = function (port, $event) {
                    svgDiagramController.onPortClick(scope.component, port, $event);
                };

                scope.onPortMouseDown = function (port, $event) {
                    svgDiagramController.onPortMouseDown(scope.component, port, $event);
                };

                scope.onPortMouseUp = function (port, $event) {
                    svgDiagramController.onPortMouseUp(scope.component, port, $event);
                };

                scope.onPortMouseOver = function (port, $event) {
                    svgDiagramController.onPortMouseOver(scope.diagram, scope.component, port, $event);
                };

                scope.onPortMouseOut = function (port, $event) {
                    svgDiagramController.onPortMouseOut(scope.diagram, scope.component, port, $event);
                };

                diagramContainerController.replaceWithDirective(
                    element[0].querySelector('.symbol-placeholder'),
                    scope.component.symbol.portDirective || scope.portInstance.portSymbol.portDirective || 'circle-port',
                    scope
                );

                if (scope.portInstance.portSymbol && scope.portInstance.portSymbol.type) {
                    svgDiagramController.registerPortElement(scope.portInstance.portSymbol.type, element[0]);
                }


                // Having rotation set by class name doesn't reliably rotate svg elements how we expect.
                // Watch the component rotation and apply style using Jquery instead.
                scope.isComponentUpsideDown = false;

                scope.$watch('portInstance.parentComponent.rotation', function() {
                    var rotate = 0;

                    if (scope.portInstance.parentComponent.rotation % 360 === 180) {
                        scope.isComponentUpsideDown = true;

                        rotate = 180;
                    }

                    $timeout(function() {
                        var wrapperEl = $(element).find('.port-label-wrapper');

                        if (wrapperEl.length) {
                            wrapperEl.css({ WebkitTransform: 'rotate(' + rotate + 'deg)'});
                            wrapperEl.css({ msTransform: 'rotate(' + rotate + 'deg)'});
                            // wrapperEl.css({ MozTransform: 'rotate(' + rotate + 'deg)'});
                        }

                        scope.$apply();
                    }, 0);
                });

                scope.$on('$destroy', function() {

                    if (scope.portInstance.portSymbol && scope.portInstance.portSymbol.type) {
                        svgDiagramController.deregisterPortElement(scope.portInstance.portSymbol.type, element[0]);
                    }

                });

            }
        };
    }
)
    .directive(
    'circlePort',
    function () {
        return {
            scope: false,
            restrict: 'E',
            replace: true,
            templateNamespace: 'SVG',
            templateUrl: '/mmsApp/templates/circlePort.html'
        };
    })
    .directive(
    'rectanglePort',
    function () {
        return {
            scope: false,
            controller: function ($scope) {

                switch ($scope.portInstance.portSymbol.side) {

                    case 'right':
                        $scope.portOffset = {
                            x: -15,
                            y: -3
                        };

                        break;

                    default:
                    case 'left':
                        $scope.portOffset = {
                            x: 5,
                            y: -3
                        };

                }

            },
            restrict: 'E',
            replace: true,
            templateNamespace: 'SVG',
            templateUrl: '/mmsApp/templates/rectanglePort.html'
        };
    });
