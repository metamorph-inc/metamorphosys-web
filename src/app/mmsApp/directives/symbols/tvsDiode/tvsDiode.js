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
                labelPrefix: 'TVSD',
                labelPosition: {
                    x: 10,
                    y: -8
                },
                width: 60,
                height: 15,
                ports: {
                    C: {
                        id: 'C',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: 'C',
                        x: 0,
                        y: 7
                    }, A: {
                        id: 'A',
                        wireAngle: 180,
                        wireLeadIn: 20,
                        label: 'A',
                        x: 60,
                        y: 7
                    } }
            });
        }
    ]);