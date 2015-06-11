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

            return cssClass;

        };

    })
    .directive(
    'port',

    function ($compile) {

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

                var svgDiagramController,
                    diagramContainerController,

                    labelEl,
                    typeEl;


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


                function replaceWithDirective(placeHolderEl, directive) {

                    var compiledSymbol,
                        templateStr,
                        template;

                    if (placeHolderEl) {

                        compiledSymbol = diagramContainerController.getCompiledDirective(directive);

                        if (!angular.isFunction(compiledSymbol)) {

                            templateStr = '<' + directive + '>' +
                            '</' + directive + '>';

                            template = angular.element(templateStr);

                            compiledSymbol = $compile(template);

                            diagramContainerController.setCompiledDirective(directive, compiledSymbol);

                        }


                        compiledSymbol(scope, function (clonedElement) {

                            placeHolderEl.parentNode.replaceChild(
                                clonedElement[0],
                                placeHolderEl
                            );

                        });

                    }

                }

                replaceWithDirective(
                    element[0].querySelector('.symbol-placeholder'),
                    scope.component.symbol.portDirective || scope.portInstance.portSymbol.portDirective || 'circle-port'
                );

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
