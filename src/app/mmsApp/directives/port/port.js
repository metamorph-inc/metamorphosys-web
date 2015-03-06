/*globals angular, $*/

'use strict';

angular.module(
    'mms.designVisualization.port', []
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

        $scope.getCssClass = function () {

            var cssClass;

            cssClass = $scope.portInstance.portSymbol.cssClass;

            return cssClass;

        };

    })
    .directive(
    'port',

    function ($compile) {

        return {
            scope: false,
            controller: 'PortController',
            restrict: 'E',
            replace: true,
            templateUrl: '/mmsApp/templates/port.html',
            templateNamespace: 'SVG',
            require: ['^svgDiagram', '^diagramContainer'],
            link: function (scope, element, attributes, controllers) {

                var svgDiagramController,
                    portDirective,
                    compiledSymbol,
                    templateStr,
                    template,
                    diagramContainerController,
                    $el;

                svgDiagramController = controllers[0];
                diagramContainerController = controllers[1];

                scope.onPortClick = function (port, $event) {
                    svgDiagramController.onPortClick(scope.component, port, $event);
                };

                scope.onPortMouseDown = function (port, $event) {
                    svgDiagramController.onPortMouseDown(scope.component, port, $event);
                };

                scope.onPortMouseUp = function (port, $event) {
                    svgDiagramController.onPortMouseUp(scope.component, port, $event);
                };

                portDirective = scope.portInstance.portSymbol.portDirective || 'circle-port';

                compiledSymbol = diagramContainerController.getCompiledDirective(portDirective);

                if (!angular.isFunction(compiledSymbol)) {

                    templateStr = '<' + portDirective + '>' +
                    '</' + portDirective + '>';

                    template = angular.element(templateStr);

                    compiledSymbol = $compile(template);

                    diagramContainerController.setCompiledDirective(portDirective, compiledSymbol);

                }

                $el = $(element);

                compiledSymbol(scope, function (clonedElement) {
                    $el.find('.symbol-placeholder')
                        .replaceWith(clonedElement);
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
