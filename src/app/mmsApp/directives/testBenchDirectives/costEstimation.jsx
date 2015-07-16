/* globals ga*/

'use strict';

angular.module('mms.testBenchDirectives')
.run(function(testBenchService) {

    testBenchService.registerTestBenchDirectives(
        'Cost Estimation',
        {
            config: 'cost-estimation-config',
            resultCompact: 'cost-estimation-result-compact'
        }
    );

    testBenchService.registerTestBenchDescription(
        'Cost Estimation',
        'This test bench is designed to estimate the cost of parts for a given system design. It polls the Octopart database for up-to-date pricing for each part, looks for the best price break based on the quantity needed, and estimates a parts cost for the design. It also produces a bill-of-materials (BOM) spreadsheet for the design.'
    );

})

.directive('costEstimationConfig', function() {

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
        templateUrl: '/mmsApp/templates/costEstimationConfig.html'
    };

})

.directive('costEstimationResultCompact', function($mdDialog, $http) {

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
        templateUrl: '/mmsApp/templates/costEstimationResultCompact.html',
        require: ['costEstimationResultCompact', '^testBenchResultOpener'],
        link: function(s, element, attributes, controllers) {

            var ctrl = controllers[0],
                openerController = controllers[1],
                jsonUrl = '/rest/blob/view/' + ctrl.result.resultHash + '/results/CostEstimationResults.json',
                bomUrl = '/rest/blob/view/' + ctrl.result.resultHash + '/results/BomTable.html';

            function showResults() {

                ga('send', 'event', 'testbench', 'result', ctrl.result.id);

                function ShowResultsDialogController($scope, result, detailedCostEstimation) {

                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.close = function () {
                        $mdDialog.hide();
                    };

                    $scope.result = result;
                    $scope.detailedCostEstimation = detailedCostEstimation;
                    $scope.bomUrl = bomUrl;
                }

                $http.get(jsonUrl).then(function(detailedCostEstimationJSON) {

                    $mdDialog.show({
                        controller: ShowResultsDialogController,
                        bindToController: true,
                        controllerAs: 'ctrl',
                        templateUrl: '/mmsApp/templates/costEstimationResult.html',
                        locals: {
                            result: ctrl.result,
                            bomUrl: bomUrl,
                            detailedCostEstimation: detailedCostEstimationJSON.data
                        }
                    })
                    .then(function () {
                    });

                });

            }

            openerController.resultsOpener = showResults;

        }
    };

});
