/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.componentWire.segment',
[]
)

.directive(
'componentWireSegment',

function () {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/mmsApp/templates/componentWireSegment.html',
    templateNamespace: 'SVG'
  };
}
);