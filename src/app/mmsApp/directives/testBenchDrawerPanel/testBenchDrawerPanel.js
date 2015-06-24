'use strict';

angular.module('mms.testBenchDrawerPanel', [

])

.directive('testBenchDrawerPanel', function() {

    class TestBenchDrawerPanelController {

        constructor() {

        }

    }

    return {
        restrict: 'E',
        controller: TestBenchDrawerPanelController.constructor,
        controlerAs: 'ctrl',
        bindToController: true,
        scope: true,
        replace: true,
        transclude: false,
        templateUrl: '/mmsApp/templates/testBenchDrawerPanel.html'
    };
})

.directive('testBenchDrawerPanelTestList', function() {

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
        templateUrl: '/mmsApp/templates/testBenchDrawerPanelTestList.html'
    };
})

.directive('testBenchDrawerPanelResultList', function() {

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
        templateUrl: '/mmsApp/templates/testBenchDrawerPanelResultList.html'
    };
});
