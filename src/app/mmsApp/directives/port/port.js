/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.port',
[]
)
.controller('PortController', function ($scope) {
  $scope.getPortTransform = function() {
    var transformString;

    transformString = 'translate(' + $scope.portInstance.portSymbol.x + ',' + $scope.portInstance.portSymbol.y + ')';

    return transformString;
  };
})
.directive(
'port',

function () {

  return {
    scope: false,
    controller: 'PortController',
    restrict: 'E',
    replace: true,
    templateUrl: '/designVisualization/templates/port.html',
    templateNamespace: 'SVG',
    require: ['^svgDiagram', '^diagramContainer'],
    link: function(scope, element, attributes, controllers) {

      var svgDiagramController;

      svgDiagramController = controllers[0];

      scope.onPortClick = function(port, $event) {
        svgDiagramController.onPortClick(scope.component, port, $event);
      };

      scope.onPortMouseDown = function(port, $event) {
        svgDiagramController.onPortMouseDown(scope.component, port, $event);
      };

      scope.onPortMouseUp = function(port, $event) {
        svgDiagramController.onPortMouseUp(scope.component, port, $event);
      };

    }
  };
}
);