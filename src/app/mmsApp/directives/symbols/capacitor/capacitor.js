/*globals angular*/

'use strict';

angular.module(
'mms.designVisualization.symbols.capacitor',
[]
)
.config(['symbolManagerProvider', function(symbolManagerProvider){
  symbolManagerProvider.registerSymbol({
    type: 'capacitor',
    directive: null,
    svgDecoration: 'images/symbols.svg#icon-capacitor',
    labelPrefix: 'C',
    labelPosition: {
      x: 10,
      y: -8
    },
    width: 60,
    height: 15,
    ports: [
      {
        id: 'C',
        wireAngle: 180,
        wireLeadIn: 20,
        label: 'C',
        x: 0,
        y: 7.5
      },
      {
        id: 'A',
        wireAngle: 0,
        wireLeadIn: 20,
        label: 'A',
        x: 60,
        y: 7.5
      }
    ]
  });
}]);