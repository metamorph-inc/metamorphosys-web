/*globals angular*/

'use strict';

require( './componentWireSegment' );
require( './componentWireCorner' );

angular.module(
    'mms.designVisualization.componentWire', [
        'mms.designVisualization.componentWire.segment',
        'mms.designVisualization.componentWire.corner'
    ]
)
    .controller( 'ComponentWireController', function ( $scope ) {
        $scope.getSegments = function () {
            var endPositions,
                x1, y1, x2, y2;

            endPositions = $scope.wire.getEndPositions();

            x1 = endPositions.x1;
            x2 = endPositions.x2;
            y1 = endPositions.y1;
            y2 = endPositions.y2;

            return [
                endPositions
            ];

        };

        //$scope.onSegmentClick = function ( wire, segment ) {
        //    console.log( wire, segment );
        //};


        $scope.segments = $scope.getSegments();

    } )
    .directive(
        'componentWire',

        function () {

            return {
                scope: true,
                controller: 'ComponentWireController',
                restrict: 'E',
                replace: true,
                templateUrl: '/mmsApp/templates/componentWire.html',
                templateNamespace: 'SVG',
                require: '^svgDiagram',
                link: function(scope, element, attributes, svgDiagramController) {

                    scope.onMouseUp = function ( segment, $event ) {
                        svgDiagramController.onWireMouseUp( scope.wire, segment, $event );
                    };

                    scope.onMouseDown = function ( segment, $event ) {
                        svgDiagramController.onWireMouseDown( scope.wire, segment, $event );
                        $event.stopPropagation();
                    };

                    scope.onCornerMouseUp = function ( segment, $event ) {
                        svgDiagramController.onWireCornerMouseUp( scope.wire, segment, $event );
                    };

                    scope.onCornerMouseDown = function ( segment, $event ) {
                        svgDiagramController.onWireCornerMouseDown( scope.wire, segment, $event );
                        $event.stopPropagation();
                    };

                }
            };
        }
);
