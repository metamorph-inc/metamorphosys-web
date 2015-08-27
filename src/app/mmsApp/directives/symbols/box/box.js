/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.symbols.box', []
)
    .controller( 'BoxController', function ( $scope ) {

        $scope.portWires = [];

        $scope.addedIconHeight = 30;
        $scope.maxIconWidth = 180;
        $scope.maxIconHeight = 50;

        angular.forEach( $scope.component.symbol.ports, function ( port ) {

            var toX = 0,
                toY = 0,
                portWireLength,
                width, height;

            portWireLength = $scope.component.symbol.portWireLength;
            width = $scope.component.symbol.width;
            height = $scope.component.symbol.height;

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
                return $scope.getBoxStartY() + $scope.component.symbol.boxHeight - $scope.maxIconHeight - 2.5;
            }
            else {
                return $scope.getBoxStartY();
            }
        };

        $scope.getIconStartX = function() {
            return $scope.getBoxStartX();
        };

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
                templateNamespace: 'SVG'
            };
        } );
