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

                    case 'left':
                        $scope.decorationTransform = 'translate(2, -8)';
                        break;

                    default:
                    case 'right':
                        $scope.decorationTransform = 'translate(-29, -8)';
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
                    scope.decoratorBGColor = scope.portInstance.portSymbol.portDecorator.bgColor;

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

                scope.decoratorBGColor = scope.decoratorBGColor || '#93A0B5';
                scope.decoratorColor = scope.decoratorColor || '#fff';
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
    .directive(
    'digitalConnectorSymbol',
    function () {
        return {
            scope: false,
            restrict: 'E',
            replace: true,
            templateNamespace: 'SVG',
            templateUrl: '/mmsApp/templates/digitalConnectorSymbol.html'
        };
    })
    ;
