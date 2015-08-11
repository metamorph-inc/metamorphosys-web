/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.containerBox', []
)
    .controller( 'ContainerBoxController', function ( $scope, nodeService ) {

        $scope.portWires = [];

        $scope.addedIconHeight = 60;
        $scope.maxIconWidth = 180;
        $scope.maxIconHeight = 60;
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

        $scope.getIcon = function() {
            return $scope.component.icon;
        };

        $scope.getBoxStartY = function() {
            return $scope.component.symbol.hasTopPort * $scope.component.symbol.portWireLength;
        };

        $scope.getBoxStartX = function() {
            return $scope.component.symbol.hasLeftPort * $scope.component.symbol.portWireLength;
        };

        $scope.getIconStartY = function() {
            return $scope.getBoxStartY() + $scope.component.symbol.boxHeight - 20;
        };

        $scope.getIconStartX = function() {
            return $scope.getBoxStartX();
        };

        // $scope.getViewBox = function() {
            

        //     return "0 0 " + this.iconSvgWidth + " " + this.iconSvgHeight;
        // };

    } )
    .directive(
        'containerBox',

        function ($compile) {

            return {
                scope: false,
                restrict: 'E',
                replace: true,
                controller: 'ContainerBoxController',
                templateUrl: '/mmsApp/templates/containerBox.html',
                templateNamespace: 'SVG',
                require: ['^svgDiagram', '^diagramContainer', 'containerBox'],
                link: function (scope, element, attributes, controllers) {

                    var svgDiagramController = controllers[0],
                        diagramContainerController = controllers[1],
                        containerBoxController = controllers[2],

                        compiledIcon,
                        template,

                        $el;

                    scope.svgDiagramController = svgDiagramController;
                    scope.diagram = diagramContainerController.getDiagram();
                    scope.element = element[0];

                    $el = $ ( scope.element );

                                    // Only subcircuits for now
                    // scope.getViewBox = function(iconSvg) {
                        
                    //     var svgWidth = iconSvg.attributes.width,
                    //         svgHeight = iconSvg.attributes.height,
                    //         multFactor;

                    //     if (svgWidth && svgHeight) {
                    //         scope.iconSvgWidth = Number(svgWidth.nodeValue);
                    //         scope.iconSvgHeight = Number(svgHeight.nodeValue);

                    //         multFactor = Math.min(scope.addedIconHeight / scope.iconSvgWidth,
                    //                           scope.addedIconHeight / scope.iconSvgHeight);

                    //         scope.iconSvgWidth /= multFactor;
                    //         scope.iconSvgHeight /= multFactor;
                    //     }
                    //     else {
                    //         console.log('Icon SVG does not have a top-level width/height specified.');
                    //     }

                    //     scope.iconSvgViewBox = "0 0 " + Math.round(scope.iconSvgWidth) + " " + Math.round(scope.iconSvgHeight);
                    // };
                    

                    if (scope.component.icon) {
                        var iconEl = $el.find( '.symbol-icon-placeholder' );

                        if (iconEl) {
                            if (scope.component.symbol.hasLeftPort && scope.component.symbol.hasRightPort) {
                                iconEl[0].style.webkitTransform = "translate(40%, 0%)";
                            }
                            else {
                                iconEl[0].style.webkitTransform = "translate(60%, 0%)";
                            }
                        }
                    }


                    // }

                    // scope.$watch('component.icon', function(icon) {

                    //     // if icon, check newId oldId. if old was null, add icon. if not, replace

                    // });
                     
                    

                }
            };
        } );
