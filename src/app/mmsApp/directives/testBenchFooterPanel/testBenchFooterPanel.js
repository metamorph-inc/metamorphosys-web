'use strict';

angular.module('mms.testBenchFooterPanel', [

])

.directive('testBenchFooterPanel', function() {

    class TestBenchFooterPanelController {

        constructor() {

        }

    }

    return {
        restrict: 'E',
        controller: TestBenchFooterPanelController.constructor,
        controlerAs: 'ctrl',
        bindToController: true,
        scope: true,
        replace: true,
        transclude: false,
        templateUrl: '/mmsApp/templates/testBenchFooterPanel.html'
    };
})

.directive('testBenchFooterPanelTestList', function() {

    class TestListController {

        constructor() {

        }

    }

    return {
        restrict: 'E',
        controller: TestListController.constructor,
        controlerAs: 'ctrl',
        bindToController: true,
        scope: {
            tests: '='
        },
        replace: true,
        transclude: false,
        templateUrl: '/mmsApp/templates/testBenchFooterPanelTestList.html'
    };
})

.directive('testBenchFooterPanelResultList', function() {

    class ResultListController {

        constructor() {

        }

    }

    return {
        restrict: 'E',
        controller: ResultListController.constructor,
        controlerAs: 'ctrl',
        bindToController: true,
        scope: {
            results: '='
        },
        replace: true,
        transclude: false,
        templateUrl: '/mmsApp/templates/testBenchFooterPanelResultList.html'
    };
});
