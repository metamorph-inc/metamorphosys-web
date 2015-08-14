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
        $scope.iconSvgElement = null;
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

                    function getElementChild(data) {
                        
                        var element = null,
                            node;

                        if (data.firstElementChild) { 
                            element = data.firstElementChild;
                        }
                        else {
                            node = data.firstChild;

                            for ( ; node; node = node.nextSibling) {

                                if (node.nodeType === 1) {
                                    element = node;
                                    break;
                                }
                            }
                        }
                        return element;
                    }

                    function replaceIcon() {

                        var svgIconData,
                            symbolIconChildElement;

                        if (scope.component.icon) {

                            $.get(scope.component.icon, null, function(data) {

                                svgIconData = getElementChild(data);

                            }, 'xml').then(function() {

                                scope.iconSvgElement = svgIconData;

                                symbolIconChildElement = getElementChild(symbolIcon);

                                if (symbolIconChildElement) {
                                    symbolIcon.replaceChild(scope.iconSvgElement, symbolIconChildElement);
                                }
                                else {
                                    symbolIcon.appendChild(scope.iconSvgElement);
                                }

                                scope.setIconSvgViewBox(symbolIcon);
                            });
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
                     
                    $rootScope.$on('iconWasChanged', function() {
                        scope.$apply(function() {

                            replaceIcon();

                        });
                    });
                }
            };
        } );
