'use strict';

angular.module('mms.testBenchDrawerPanel.testBenchConfig', [
])

.directive('testBenchConfig', function() {

    function TestBenchConfigController() {

    }

    return {
        restrict: 'E',
        controller: TestBenchConfigController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: true,
        scope: {
            testBench: '=',
            directive: '='
        },
        template: '<div class="custom-test-bench-config-wrapper"><div class="place-holder"></div>',
        link: function(scope, $el) {

            var element = $el,
                placeHolderEl = element.quesySelector('.place-holder');




        }
    };
});
