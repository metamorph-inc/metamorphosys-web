/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.tvsDiode', []
    )
    .config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
                type: 'tvsDiode',
                directive: null,
                svgDecoration: 'images/symbols.svg#icon-tvsDiode',
                labelPrefix: 'D',
                labelPosition: {
                    x: 10,
                    y: -8
                },
                width: 75,
                height: 15,
                ports: {
                    C: {
                        id: 'C',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'C',
                        x: 0,
                        y: 7.5
                    }, A: {
                        id: 'A',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: 'A',
                        x: 75,
                        y: 7.5
                    } }
            });
        }
    ]);
