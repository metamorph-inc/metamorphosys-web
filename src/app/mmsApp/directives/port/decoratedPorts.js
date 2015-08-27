/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.port.decoratedPorts', []
)


    .directive(
    'decoratedPort',
    function ($timeout) {
        return {
            scope: true,
            controller: function ($scope) {

                if ($scope.$parent.portData) {
                    // Port type is being inferred/redefined

                    $scope.component = $scope.$parent.portData.parentComponent;
                    $scope.portInstance = $scope.$parent.portData;

                }

                if ($scope.component.symbol.symbolDirective === 'container-box' ||
                    $scope.component.symbol.symbolDirective === 'connector-adapter') {

                    switch ($scope.portInstance.portSymbol.side) {

                        case 'left':
                            $scope.decorationTransform = 'translate(3, -8)';
                            break;

                        default:
                        case 'right':
                            $scope.decorationTransform = 'translate(-30, -8)';
                    }

                }
                else if ($scope.component.symbol.symbolDirective === 'simple-connector') {

                        $scope.decorationTransform = 'translate(0, 0)';
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

                // Having rotation set by class name doesn't reliably rotate svg elements how we expect.
                // Watch the component rotation and apply style using Jquery instead.

                // If the decorator takes up the entire port (ie, SupplySingle), the rotation will rotate the entire port
                // making a left port look like it is should be on the right.
                if ( !scope.portInstance.portSymbol.portDecorator || !scope.portInstance.portSymbol.portDecorator.disableDecoratorRotate ) {
                    scope.isComponentUpsideDown = false;

                    scope.$watch('portInstance.parentComponent.rotation', function() {
                        var rotate = 0;

                        if (scope.portInstance.parentComponent.rotation % 360 === 180) {
                            scope.isComponentUpsideDown = true;

                            rotate = 180;
                        }

                        $timeout(function() {
                            var wrapperEl = $(element).find('.decorator-wrapper');

                            if (wrapperEl.length) {
                                if (!!window.chrome && !!window.chrome.webstore) {
                                    wrapperEl.css({ WebkitTransform: 'rotate(' + rotate + 'deg)'});
                                }
                                wrapperEl.css({ msTransform: 'rotate(' + rotate + 'deg)'});
                                // wrapperEl.css({ MozTransform: 'rotate(' + rotate + 'deg)'});
                            }

                            scope.$apply();
                        }, 0);
                    });
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
    .directive(
    'analogConnectorSymbol',
    function () {
        return {
            scope: false,
            restrict: 'E',
            replace: true,
            templateNamespace: 'SVG',
            templateUrl: '/mmsApp/templates/analogConnectorSymbol.html'
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
            templateUrl: '/mmsApp/templates/supplySingleSymbol.html'
        };
    })
    ;
