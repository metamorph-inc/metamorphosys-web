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

.directive('costEstimationResult', function() {

    function TestBenchResultController() {

    }

    return {
        restrict: 'E',
        controller: TestBenchResultController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: false,
        scope: {
            result: '='
        },
        templateUrl: '/mmsApp/templates/costEstimationResult.html'
    };

})

.directive('costEstimationResultCompact', function() {

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

            var openerController = controllers[1];

            function showResults() {
                console.log('Show results from here');
            }

            openerController.resultsOpener = showResults;

        }
    };

});
