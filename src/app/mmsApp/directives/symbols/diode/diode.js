/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.diode', []
    )
    .config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
                type: 'diode',
                directive: null,
                svgDecoration: 'images/symbols.svg#icon-diode',
                labelPrefix: 'D',
                labelPosition: {
                    x: 10,
                    y: -8
                },
                width: 60,
                height: 15,
                ports: {
                    A: {
                        id: 'A',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'A',
                        x: 0,
                        y: 7.5
                    }, C: {
                        id: 'C',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: 'C',
                        x: 60,
                        y: 7.5
                    } }
            });
        }
    ]);
