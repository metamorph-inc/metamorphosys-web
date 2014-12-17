/*globals angular*/

'use strict';

require('./componentWireSegment');

angular.module(
'mms.designVisualization.componentWire',
[
  'mms.designVisualization.componentWire.segment'
]
)
.controller('ComponentWireController', function ($scope) {
  $scope.getSegments = function() {
    var endPositions,
      x1,y1,x2,y2;

    endPositions = $scope.wire.getEndPositions();

    x1 = endPositions.x1;
    x2 = endPositions.x2;
    y1 = endPositions.y1;
    y2 = endPositions.y2;

    return [
      endPositions
    ];

  };

  $scope.onSegmentClick = function(wire, segment) {
    console.log(wire, segment);
  };

  $scope.segments = $scope.getSegments();

})
.directive(
'componentWire',

function () {

  return {
    scope: true,
    controller: 'ComponentWireController',
    restrict: 'E',
    replace: true,
    templateUrl: '/mmsApp/templates/componentWire.html',
    templateNamespace: 'SVG'
  };
}
);