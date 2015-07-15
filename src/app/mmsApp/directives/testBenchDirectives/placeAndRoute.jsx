/*globals ga*/

'use strict';

angular.module('mms.testBenchDirectives')
.run(function(testBenchService) {

    testBenchService.registerTestBenchDirectives(
        'Place and Route',
        {
            config: 'place-and-route-config',
            resultCompact: 'place-and-route-result-compact'
        }
    );

    testBenchService.registerTestBenchDescription(
        'Place and Route',
        'This test bench is designed to build an EAGLE schematic and board file. It automatically places components according to layout constraints provided in the CyPhy model. It then uses EAGLE\'s routing engine to automatically route the signals on the board.'
    );

})

.directive('placeAndRouteConfig', function() {

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
        templateUrl: '/mmsApp/templates/placeAndRouteConfig.html'
    };

})

.directive('placeAndRouteResultCompact', function($mdDialog) {

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
        templateUrl: '/mmsApp/templates/placeAndRouteResultCompact.html',
        require: ['placeAndRouteResultCompact', '^testBenchResultOpener'],
        link: function(s, element, attributes, controllers) {

            var ctrl = controllers[0],
                openerController = controllers[1];

            function showResults() {

                ga('send', 'event', 'testbench', 'result', ctrl.result.id);

                function ShowResultsDialogController($scope, result, visualUrl, attachments) {

                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.close = function () {
                        $mdDialog.hide();
                    };

                    $scope.result = result;
                    $scope.attachments = attachments;
                    $scope.visualUrl = visualUrl;
                }

                $mdDialog.show({
                    controller: ShowResultsDialogController,
                    bindToController: true,
                    controllerAs: 'ctrl',
                    templateUrl: '/mmsApp/templates/placeAndRouteResult.html',
                    locals: {
                        result: ctrl.result,
                        visualUrl: '/rest/blob/view/' + ctrl.result.resultHash + '/results/eagle-board.png',
                        attachments: [
                            {
                                name: 'Download Eagle File',
                                url: '/rest/blob/download/' + ctrl.result.resultHash + '/results/eagle-board.brd'
                            }
                        ]
                    }
                })
                .then(function () {
                });
            }

            openerController.resultsOpener = showResults;

        }
    };

});
