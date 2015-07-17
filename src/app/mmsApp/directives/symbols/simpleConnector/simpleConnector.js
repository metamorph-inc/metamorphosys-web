/*globals angular*/

'use strict';

angular.module(
        'mms.designVisualization.symbols.simpleConnector', []
    ).config([ 'symbolManagerProvider',
        function (symbolManagerProvider) {
            symbolManagerProvider.registerSymbol({
                type: 'simpleConnector',
                symbolDirective: 'simple-connector',
                labelPrefix: '',
                labelPosition: {
                    x: 3,
                    y: 11
                },
                width: 120,
                height: 15,
                ports: {
                    p1: {
                        id: 'p1',
                        wireAngle: 0,
                        wireLeadIn: 20,
                        label: '',
                        x: 117,
                        y: 7
                    } }
            });
        }
    ])
    .controller('SimpleConnectorController', function () {
    })
    .directive(
    'simpleConnector',

    function () {

        return {
            scope: false,
            restrict: 'E',
            replace: true,
            controller: 'SimpleConnectorController',
            templateUrl: '/mmsApp/templates/simpleConnector.html',
            templateNamespace: 'SVG'
        };
    });
