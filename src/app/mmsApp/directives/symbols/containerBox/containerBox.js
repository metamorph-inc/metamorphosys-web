/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.containerBox', []
)
    .controller( 'ContainerBoxController', function ( $scope, $log ) {

        $scope.portWires = [];

        $scope.addedIconHeight = 30;
        $scope.maxIconWidth = 180;
        $scope.maxIconHeight = 50;
        $scope.iconUrl = null;
        $scope.iconSvgElement;
        $scope.iconSvgViewBox = "0 0 0 0";

        angular.forEach( $scope.component.symbol.ports, function ( port ) {

            var toX = 0,
                toY = 0,
                portWireLength,
                width, height;

            portWireLength = $scope.component.symbol.portWireLength;
            width = $scope.component.symbol.width;
            height = $scope.component.symbol.height;

            if ($scope.component.icon) {
                height += $scope.addedIconHeight;
            }

            if ( port.x === 0 ) {
                toX = portWireLength;
                toY = port.y;
            }

            if ( port.y === 0 ) {
                toY = portWireLength;
                toX = port.x;
            }

            if ( port.x === width ) {
                toX = width - portWireLength;
                toY = port.y;
            }

            if ( port.y === height ) {
                toY = height - portWireLength;
                toX = port.x;
            }

            $scope.portWires.push( {
                x1: port.x,
                y1: port.y,
                x2: toX,
                y2: toY
            } );
        } );

        $scope.getIconUrl = function() {
            if ($scope.component.icon) {
                // return "http://localhost:8855/rest/blob/view/" + $scope.component.icon;
                return "data:image/svg+xml," + $scope.component.icon;
            }
        };

        $scope.getBoxStartY = function() {
            return $scope.component.symbol.hasTopPort * $scope.component.symbol.portWireLength;
        };

        $scope.getBoxStartX = function() {
            return $scope.component.symbol.hasLeftPort * $scope.component.symbol.portWireLength;
        };

        $scope.getIconStartY = function() {
            if ($scope.component.icon) {
                return $scope.getBoxStartY() + $scope.component.symbol.boxHeight - 30;
            }
            else {
                return $scope.getBoxStartY();
            }
        };

        $scope.getIconStartX = function() {
            return $scope.getBoxStartX();
        };

        $scope.updateIconTransform = function() {

            // Width varies based on ports

            if ($scope.component.symbol.hasLeftPort && $scope.component.symbol.hasRightPort) {
                $scope.iconElement.style.webkitTransform = "translate(40%, 0%)";
            }
            else {
                $scope.iconElement.style.webkitTransform = "translate(70%, 0%)";
            }

        };

        $scope.updateIconUrl = function() {
            $scope.iconUrl = $scope.getIconUrl();
        };

        $scope.getIconWidth = function() {
            return parseFloat($scope.iconSvgElement.getAttribute("width"));
        };

        $scope.getIconHeight = function() {
            return parseFloat($scope.iconSvgElement.getAttribute("height"));
        };

        $scope.setIconSvgViewBox = function(symbolElement) {
            
            var viewBox = "0 0 0 0",
                iconWidth,
                iconHeight;

            if ($scope.component.icon) {

                if ($scope.iconSvgElement.getAttribute("viewBox") === null) {

                    iconWidth = $scope.getIconWidth();
                    iconHeight = $scope.getIconHeight();

                    if (!iconWidth || !iconHeight) {
                        $log.warn("Imported icon does not have width or height attributes to construct viewBox, can't display!");
                    }
                    else {
                        viewBox = "0 0 " + iconWidth + " " + iconHeight;
                    }

                }
                else {

                    viewBox = $scope.iconSvgElement.getAttribute("viewBox");

                }
            }

            symbolElement.setAttribute("viewBox", viewBox);

        };

    } )
    .directive(
        'containerBox',

        function ($timeout, dndService, $rootScope) {

            return {
                scope: false,
                restrict: 'E',
                replace: true,
                controller: 'ContainerBoxController',
                templateUrl: '/mmsApp/templates/containerBox.html',
                templateNamespace: 'SVG',
                require: ['^svgDiagram', '^diagramContainer'],
                link: function (scope, element, attributes, controllers) {

                    var svgDiagramController = controllers[0],
                        diagramContainerController = controllers[1],

                        dropHandler,

                        $el,

                        symbolIcon,
                        $symbolIcon;

                    scope.svgDiagramController = svgDiagramController;
                    scope.diagram = diagramContainerController.getDiagram();
                    scope.element = element[0];

                    $el = $( scope.element );

                    symbolIcon = $el.find('.symbol-icon')[0];
                    

                    // scope.iconElement = $el.find( '.symbol-icon-placeholder' )[0];

                    function replaceIcon() {
                        if (scope.component.icon) {
                            scope.iconSvgElement = $(scope.component.icon)[0];

                            if (symbolIcon.children.length) {
                                symbolIcon.replaceChild(scope.iconSvgElement, symbolIcon.children[0]);
                            }
                            else {
                                symbolIcon.appendChild(scope.iconSvgElement);
                            }
                            // $symbolIcon.prepend(scope.iconSvgElement);
                            scope.setIconSvgViewBox(symbolIcon);
                        }
                        else {

                            var $symbolIcon = $(symbolIcon);

                            if ($symbolIcon.children().length) {
                                $symbolIcon.children().eq(0).remove();      
                            }
                        }
                    }

                    replaceIcon();

                    dropHandler = svgDiagramController._onDrop.bind(svgDiagramController);

                    // Template bindings haven't occurred yet, need to put in timeout to have them set so that
                    // rect tags are available.
                    $timeout(function() {
                        dndService.registerDropTarget(
                            element[0].parentElement,
                            'component subscircuit',
                            dropHandler,
                            true
                        );
                        scope.$apply();
                    });

                    scope.$on('$destroy', function() {
                        dndService.unregisterDropTarget( element[0].parentElement );
                    });

                    // scope.$watchCollection('[component.symbol.hasLeftPort, component.symbol.hasRightPort]', function() {
                    //     scope.updateIconTransform();
                    // });
                    
                     
                    $rootScope.$on('iconWasChanged', function() {
                        scope.$apply(function() {

                            replaceIcon();

                        });
                    });
                }
            };
        } );
