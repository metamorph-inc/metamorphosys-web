/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.port.decoratedPorts', []
)
    .directive(
    'decoratedPort',
    function () {
        return {
            scope: false,
            controller: function ($scope) {

                switch ($scope.portInstance.portSymbol.side) {

                    case 'right':
                        $scope.decorationTransform = 'translate(-28, -8)';
                        break;

                    default:
                    case 'left':
                        $scope.decorationTransform = 'translate(3, -8)';
                }

            },
            restrict: 'E',
            replace: true,
            templateNamespace: 'SVG',
            require: ['^svgDiagram', '^diagramContainer'],
            templateUrl: '/mmsApp/templates/decoratedPort.html',
            link: function (scope, element, attributes, controllers) {

                var diagramContainerController = controllers[1];

                if (scope.portInstance.portSymbol.portDecorator) {

                    scope.decoratorColor = scope.portInstance.portSymbol.portDecorator.color;
                    scope.decoratorLabel = scope.portInstance.portSymbol.portDecorator.label;
                    scope.decoratorDirective = scope.portInstance.portSymbol.portDecorator.directive;

                    if (scope.portInstance.portSymbol.portDecorator.directive) {

                        diagramContainerController.replaceWithDirective(
                            element[0].querySelector('.decoration-placeholder'),
                            scope.portInstance.portSymbol.portDecorator.directive,
                            scope
                        );

                    }

                }

                scope.decoratorColor = scope.decoratorColor || '#93A0B5';
            }

        };
    })
    .directive(
    'usbConnectorSymbol',
    function () {
        return {
            scope: false,
            restrict: 'E',
            replace: true,
            templateNamespace: 'SVG',
            templateUrl: '/mmsApp/templates/usbConnectorSymbol.html'
        };
    })
    ;
