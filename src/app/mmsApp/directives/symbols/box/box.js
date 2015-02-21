/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.box', []
)
    .controller( 'BoxController', function ( $scope ) {


    } )
    .directive(
        'box',

        function () {

            return {
                scope: false,
                restrict: 'E',
                replace: true,
                controller: 'BoxController',
                templateUrl: '/mmsApp/templates/box.html',
                templateNamespace: 'SVG',
                require: '^componentSymbol',
                link: function(scope, element, attr, self) {

                    //debugger;

                    self.portWires = [];

                    angular.forEach( self.component.symbol.ports, function ( port ) {

                        var toX = 0,
                            toY = 0,
                            portWireLength,
                            width, height;

                        portWireLength = self.component.symbol.portWireLength;
                        width = self.component.symbol.width;
                        height = self.component.symbol.height;

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

                        self.portWires.push( {
                            x1: port.x,
                            y1: port.y,
                            x2: toX,
                            y2: toY
                        } );
                    } );                    
                    
                }
            };
        } );