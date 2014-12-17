/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.symbols.jFetP',
[]
)
.config(['symbolManagerProvider', function(symbolManagerProvider){
  symbolManagerProvider.registerSymbol({
    type: 'jFetP',
    directive: null,
    svgDecoration: 'images/symbols.svg#icon-jFetP',
    labelPrefix: 'Q',
    labelPosition: {
      x: 60,
      y: 12
    },
    width: 62,
    height: 70,
    ports: [
      {
        id: 's',
        wireAngle: 270,
        wireLeadIn: 20,
        label: 'S',
        x: 46,
        y: 0
      },
      {
        id: 'd',
        wireAngle: 90,
        wireLeadIn: 20,
        label: 'D',
        x: 46,
        y: 70
      },
      {
        id: 'g',
        wireAngle: 180,
        wireLeadIn: 20,
        label: 'G',
        x: 0,
        y: 26
      }
    ]
  });
}]);