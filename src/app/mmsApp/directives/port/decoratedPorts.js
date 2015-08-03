/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.port.decoratedPorts', []
)
    

    .directive(
    'decoratedPort',
    function () {
        return {
            scope: true,
            controller: function ($scope) {

                if ($scope.$parent.portData) {
                    $scope.component = $scope.$parent.portData.parentComponent;
                    $scope.portInstance = $scope.$parent.portData;
                }

                if ($scope.component.symbol.symbolDirective === 'container-box') {

                    switch ($scope.portInstance.portSymbol.side) {

                        case 'left':
                            $scope.decorationTransform = 'translate(3, -8)';
                            break;

                        default:
                        case 'right':
                            $scope.decorationTransform = 'translate(-29, -8)';
                    }

                } 
                else if ($scope.component.symbol.symbolDirective === 'simple-connector') {

                        $scope.decorationTransform = 'translate(-28, 0)';
                        $scope.portInstance = $scope.component.portInstances[0];
                        $scope.portInstance.portSymbol.side = "left";

                } else {

                    switch ($scope.portInstance.portSymbol.side) {

                        case 'left':
                            $scope.decorationTransform = 'translate(3.5, -8)';
                            break;

                        default:
                        case 'right':
                            $scope.decorationTransform = 'translate(-30.5, -8)';
                    }

                }

            },
            restrict: 'E',
            replace: true,
            templateNamespace: 'SVG',
            require: ['^svgDiagram', '^diagramContainer'],
            templateUrl: '/mmsApp/templates/decoratedPort.html',
            link: function (scope, element, attributes, controllers) {

                var ctrl = controllers[0],
                    diagramContainerController = controllers[1];

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

                scope.decoratorBGColor = scope.decoratorBGColor || '#747f8d';
                scope.decoratorColor = scope.decoratorColor || '#fff';
                scope.portType = scope.portInstance.portSymbol.type;

                if (scope.portType) {
                    if (scope.portType === 'GPIO') {
                        scope.pinCount = 'X';
                    } else {
                        scope.pinCount = scope.portType.split('_')[1];
                    }
                }

                scope.$watch('scope.portInstance.portSymbol.portDecorator.directive', function() {
                    console.log('j');
                }, true);
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
            templateUrl: '/mmsApp/templates/usbConnectorSymbol.html',
            link: function(scope){

                if (scope.$parent.portData) {
                    scope.portInstance = scope.$parent.portData;
                }
            }
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
            templateUrl: '/mmsApp/templates/digitalConnectorSymbol.html',
            link: function(scope){

                if (scope.$parent.portData) {
                    scope.portInstance = scope.$parent.portData;
                }
            }
        };
    })
    .directive(
    'analogConnectorSymbol',
    function () {
        return {
            scope: false,
            restrict: 'E',
            replace: true,
            templateNamespace: 'SVG',
            templateUrl: '/mmsApp/templates/analogConnectorSymbol.html',
            link: function(scope){

                if (scope.$parent.portData) {
                    scope.portInstance = scope.$parent.portData;
                }
            }
        };
    })
    .directive(
    'supplySingleSymbol',
    function () {
        return {
            scope: true,
            restrict: 'E',
            replace: true,
            templateNamespace: 'SVG',
            templateUrl: '/mmsApp/templates/supplySingleSymbol.html',
            link: function(scope){

                if (scope.$parent.portData) {
                    scope.portInstance = scope.$parent.portData;
                }
            }
        };
    })
    ;
