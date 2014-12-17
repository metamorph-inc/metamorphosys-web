/*globals angular, fabric*/

'use strict';

// Move this to GME eventually

angular.module('mms.designVisualization.fabricCanvas', [
])
.controller('FabricCanvasController', function () {

})
.directive('fabricCanvas', [
  '$log',
  'diagramService',
  function ($log, diagramService) {

    return {

      scope: {
      },
      controller: 'FabricCanvasController',
      require: '^diagramContainer',
      restrict: 'E',
      replace: true,
      templateUrl: '/mmsApp/templates/fabricCanvas.html',
      link: function (scope, element, attributes, diagramContainerCtrl) {

        var
        canvas,
        renderDiagram;

        scope.id = diagramContainerCtrl.getId() + 'fabric-canvas';

        canvas = new fabric.Canvas(scope.id);

        canvas.setBackgroundColor('rgba(255, 73, 64, 0.6)');

        renderDiagram = function () {

          if (angular.isObject(scope.diagramData)) {

            if (angular.isArray(scope.diagramData.symbols)) {

              angular.forEach(scope.diagramData.symbols, function (symbol) {

                diagramService.getSVGForSymbolType(symbol.type).then(function (object) {

                  var svgObject;

                  svgObject = object.set({ left: symbol.x, top: symbol.y, angle: 0 });

//                  canvas.add(svgObject);

                  var rect = new fabric.Rect({
                    left: 100,
                    top: 50,
                    width: 100,
                    height: 100,
                    fill: 'green',
                    angle: 20,
                    padding: 10
                  });

                  canvas.add(rect);

  //                $log.debug('e', svgObject);

                  canvas.renderAll();

                });

              });

            }

          }

          canvas.clear().renderAll();

        };

        scope.$watch(diagramContainerCtrl.getDiagramData, function (value) {
          $log.debug('DiagramData is ', value);
          scope.diagramData = value;
          renderDiagram();

        });

      }

    };
  }]);