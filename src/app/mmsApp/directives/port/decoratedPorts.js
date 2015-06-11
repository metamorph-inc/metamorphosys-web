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

                if (scope.portInstance.portSymbol.portDecoratorDirective) {

                    diagramContainerController.replaceWithDirective(
                        element[0].querySelector('.decoration-placeholder'),
                        scope.portInstance.portSymbol.portDecoratorDirective,
                        scope
                    );

                }
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
