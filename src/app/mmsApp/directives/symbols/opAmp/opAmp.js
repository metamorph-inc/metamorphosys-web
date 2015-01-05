/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.opAmp', []
    )
    .config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
                type: 'opAmp',
                directive: null,
                svgDecoration: 'images/symbols.svg#icon-opAmp',
                labelPrefix: 'A',
                labelPosition: {
                    x: 90,
                    y: 15
                },
                width: 140,
                height: 100,
                ports: {
                    'Vs+': {
                        id: 'Vs+',
                        wireAngle: 270,
                        wireLeadIn: 20,
                        label: 'Vs+',
                        x: 65,
                        y: 0
                    }, 'Vout': {
                        id: 'Vout',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: 'Vout',
                        x: 140,
                        y: 50
                    }, 'Vs-': {
                        id: 'Vs-',
                        wireAngle: 90,
                        wireLeadIn: 20,
                        label: 'Vs-',
                        x: 65,
                        y: 100
                    }, 'V-': {
                        id: 'V-',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'V-',
                        x: 0,
                        y: 75
                    }, 'V+': {
                        id: 'V+',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'V+',
                        x: 0,
                        y: 25
                    } }
            });
        }
    ]);