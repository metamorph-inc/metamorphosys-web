/*globals ga*/

'use strict';

angular.module('mms.testBenchDirectives')
    .run(function (testBenchService) {

        testBenchService.registerTestBenchDirectives(
            'CAD PCB',
            {
                config: 'cad-pcb-config',
                resultCompact: 'cad-pcb-result-compact'
            }
        );

        testBenchService.registerTestBenchDescription(
            'CAD PCB',
            'This test bench generates a 3D visualization of the PCB'
        );

    })

    .directive('cadPcbConfig', function () {

        function TestBenchConfigController() {
        }

        return {
            restrict: 'E',
            controller: TestBenchConfigController,
            controllerAs: 'ctrl',
            bindToController: true,
            replace: true,
            transclude: false,
            scope: {
                testBench: '='
            },
            templateUrl: '/mmsApp/templates/cadPcbConfig.html'
        };

    })

    .directive('cadPcbResultCompact', function ($mdDialog) {

        function TestBenchResultCompactController() {

        }

        return {
            restrict: 'E',
            controller: TestBenchResultCompactController,
            controllerAs: 'ctrl',
            bindToController: true,
            replace: true,
            transclude: false,
            scope: {
                result: '='
            },
            templateUrl: '/mmsApp/templates/cadPcbResultCompact.html',
            require: ['cadPcbResultCompact', '^testBenchResultOpener'],
            link: function (s, element, attributes, controllers) {

                var ctrl = controllers[0],
                    openerController = controllers[1],
                    cadJsUrl = '/extlib/node_modules/cad.js/public/index.html' +
                        '?resource_url=/rest/blob/download/' + ctrl.result.resultHash + '/results/StepXMLs/index.xml';

                function showResults() {
                    ga('send', 'event', 'testbench', 'result', ctrl.result.id);

                    window.open(cadJsUrl, '_blank');
                }

                openerController.resultsOpener = showResults;

            }
        };

    });
